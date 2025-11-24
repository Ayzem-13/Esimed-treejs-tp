import * as THREE from 'three/webgpu'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { CameraCharacter } from './cameraCharacter'
import { DialogueManager } from '../dialogue/dialogueManager'
import { CollisionManager } from '../collision/collisionManager'

export class CharacterController {
    constructor(scene, camera, initialPosition = new THREE.Vector3(0, 0, 0)) {
        this.scene = scene
        this.camera = camera

        this.cameraController = new CameraCharacter(camera, this)

        this.body = new THREE.Group()
        this.body.position.copy(initialPosition)
        this.body.position.y = 1
        scene.add(this.body)

        setTimeout(() => {
            this.camera.position.set(
                this.body.position.x,
                this.body.position.y + 12,
                this.body.position.z + 0.1
            )
        }, 100)

        this.createCharacterMesh()

        this.velocity = new THREE.Vector3(0, 0, 0)
        this.moveDirection = new THREE.Vector3(0, 0, 0)
        this.isGrounded = true
        this.gravity = 9.8
        this.moveSpeed = 5
        this.jumpForce = 6

        this.bodyRotation = 0
        this.rotationSpeed = 0.08

        // Vie du personnage
        this.health = 100
        this.maxHealth = 100
        this.isDead = false
        this.damageCooldown = 0
        this.onDeath = null

        this.shootCooldown = 0
        this.shootRate = 0.3
        this.shootDamage = 50
        this.shootRange = 30
        this.enemies = []
        this.bullets = []
        this.bulletSpeed = 25

        // Score
        this.score = 0
        this.scorePerKill = 100

        // Animation
        this.mixer = null
        this.animations = []
        this.currentAction = null
        this.idleAction = null
        this.walkAction = null

        this.lastMoveForward = 0

        // Véhicule
        this.vehicle = null
        this.inVehicle = false
        this.vehicleDistance = 3
        this.ignoreVehicleCollision = false
        this.ignoreVehicleTimer = 0

        // Touche
        this.keys = {
            Z: false,
            Q: false,
            S: false,
            D: false,
            ' ': false,
            F: false
        }

        // NPCs pour les collisions
        this.npcs = []

        // Collision Manager
        this.collisionManager = new CollisionManager(scene)
        this.collisionManager.setupBVH()

        // Dialogue
        this.dialogueManager = new DialogueManager()
        this.currentDialogue = null
        this.nearbyNPC = null
        this.interactionDistance = 3
        this.wrongAnswerCount = 0
        this.maxWrongAnswers = 3

        this.setupEventListeners()
    }

    setNPCs(npcs) {
        this.npcs = npcs
    }

    setEnemies(enemies) {
        this.enemies = enemies
    }

    setWaveManager(waveManager) {
        this.waveManager = waveManager
    }

    addScore(points) {
        this.score += points
        console.log(`+${points} points! Score total: ${this.score}`)
    }

    resumeWaves() {
        if (this.waveManager && this.waveManager.resumeWaves) {
            this.waveManager.resumeWaves()
        }
    }

    createCharacterMesh() {
        const loader = new GLTFLoader()

        loader.load(
            '/models/character/Adventurer.glb',
            (gltf) => {
                this.mesh = gltf.scene
                this.mesh.position.y = -0.9
                this.mesh.scale.set(1.2, 1.2, 1.2)

                this.mesh.traverse((child) => {
                    if (child.isMesh) {
                        child.castShadow = true
                        child.receiveShadow = true
                    }
                })

                this.body.add(this.mesh)

                if (gltf.animations && gltf.animations.length > 0) {
                    this.animations = gltf.animations
                    this.mixer = new THREE.AnimationMixer(this.mesh)

                    this.idleAction = this.mixer.clipAction(this.animations[8])

                    this.walkAction = this.mixer.clipAction(this.animations[16])

                    this.idleAction.play()
                    this.currentAction = this.idleAction
                }

                console.log('Personnage chargé!')
            },
            undefined,
            (error) => {
                console.error('Erreur de chargement:', error)
            }
        )
    }

    setupEventListeners() {
        window.addEventListener('keydown', (e) => this.handleKeyDown(e))
        window.addEventListener('keyup', (e) => this.handleKeyUp(e))
        window.addEventListener('mousedown', (e) => this.handleMouseDown(e))
    }

    handleMouseDown(event) {
        if (event.button === 0 && !this.isDead && !this.inVehicle) {
            this.shoot()
        }
    }

    shoot() {
        if (this.shootCooldown > 0) return

        this.shootCooldown = this.shootRate

        let closestEnemy = null
        let closestDistance = this.shootRange

        for (const enemy of this.enemies) {
            if (!enemy.isLoaded || enemy.isDead) continue

            const enemyPos = enemy.body.position
            const playerPos = this.body.position
            const distance = playerPos.distanceTo(enemyPos)

            if (distance < closestDistance) {
                const dirToEnemy = new THREE.Vector3().subVectors(enemyPos, playerPos).normalize()
                const playerDir = new THREE.Vector3(
                    Math.sin(this.bodyRotation),
                    0,
                    Math.cos(this.bodyRotation)
                )

                const dot = dirToEnemy.dot(playerDir)
                if (dot > 0.5) {
                    closestDistance = distance
                    closestEnemy = enemy
                }
            }
        }

        if (closestEnemy) {
            this.createBullet(closestEnemy)
        }
    }

    createBullet(targetEnemy) {
        const bulletGeometry = new THREE.SphereGeometry(0.15, 8, 8)
        const bulletMaterial = new THREE.MeshStandardMaterial({
            color: 0xffff00,
            emissive: 0xffaa00,
            emissiveIntensity: 0.5
        })
        const bulletMesh = new THREE.Mesh(bulletGeometry, bulletMaterial)

        const startPos = this.body.position.clone()
        startPos.y += 0.8
        const forward = new THREE.Vector3(
            Math.sin(this.bodyRotation),
            0,
            Math.cos(this.bodyRotation)
        )
        startPos.add(forward.multiplyScalar(0.5))

        bulletMesh.position.copy(startPos)
        this.scene.add(bulletMesh)

        this.bullets.push({
            mesh: bulletMesh,
            target: targetEnemy,
            damage: this.shootDamage
        })
    }

    updateBullets(deltaTime) {
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i]

            // Si l'ennemi est mort ou n'existe plus, supprimer la balle
            if (!bullet.target || bullet.target.isDead || !bullet.target.body) {
                this.scene.remove(bullet.mesh)
                bullet.mesh.geometry.dispose()
                bullet.mesh.material.dispose()
                this.bullets.splice(i, 1)
                continue
            }

            // Direction vers l'ennemi
            const targetPos = bullet.target.body.position.clone()
            targetPos.y += 0.9
            const direction = new THREE.Vector3().subVectors(targetPos, bullet.mesh.position).normalize()

            bullet.mesh.position.add(direction.multiplyScalar(this.bulletSpeed * deltaTime))

            // Vérifier si la balle a touché l'ennemi
            const distanceToTarget = bullet.mesh.position.distanceTo(targetPos)
            if (distanceToTarget < 0.5) {
                const wasAlive = !bullet.target.isDead
                bullet.target.takeDamage(bullet.damage)
                const isDead = bullet.target.isDead

                if (wasAlive && isDead) {
                    this.addScore(this.scorePerKill)
                }

                this.scene.remove(bullet.mesh)
                bullet.mesh.geometry.dispose()
                bullet.mesh.material.dispose()
                this.bullets.splice(i, 1)
            }
        }
    }

    handleKeyDown(event) {
        const key = event.key.toUpperCase()

        if (key in this.keys) {
            this.keys[key] = true
            event.preventDefault()
        }
        if (event.code === 'Space') {
            if (this.isGrounded && !this.inVehicle) {
                this.velocity.y = this.jumpForce
                this.isGrounded = false
            }
            event.preventDefault()
        }
        if (key === 'F') {
            if (this.inVehicle) {
                this.exitVehicle()
            } else if (this.vehicle && this.getDistanceToVehicle() <= this.vehicleDistance) {
                this.enterVehicle()
            }
        }

        if (key === 'E') {
            const nearbyNPC = this.getNearbyNPC()
            if (nearbyNPC) {
                this.startDialogue(nearbyNPC)
            }
        }
    }

    handleKeyUp(event) {
        const key = event.key.toUpperCase()
        if (key in this.keys) {
            this.keys[key] = false
            event.preventDefault()
        }
    }


    /**
     * Joue l'animation appropriée des qu'il ce deplace ou s'arrete
     * @param {boolean} isMoving - Indique si le personnage est en mouvement
     * @returns {void}
     */
    playAnimation(isMoving) {
        if (!this.mixer || !this.idleAction || !this.walkAction) return

        if (isMoving && this.currentAction !== this.walkAction) {
            this.idleAction.stop()
            this.walkAction.play()
            this.currentAction = this.walkAction
        } else if (!isMoving && this.currentAction !== this.idleAction) {
            this.walkAction.stop()
            this.idleAction.play()
            this.currentAction = this.idleAction
        }
    }

    /**
     * Vérifie les collisions avec le véhicule, les NPCs et les objets sélectionnables dans la scène
     * @param {THREE.Vector3} position - Position à vérifier
     * @returns {boolean} - True si une collision est détectée, sinon false
     */
    checkCollision(position) {
        return this.collisionManager.checkCollision({
            currentPos: this.body.position,
            newPos: position,
            vehicle: this.vehicle,
            inVehicle: this.inVehicle,
            ignoreVehicleCollision: this.ignoreVehicleCollision,
            npcs: this.npcs,
            characterMesh: this.mesh,
            characterBody: this.body
        })
    }

    update(deltaTime = 1 / 60) {
        if (this.mixer) {
            this.mixer.update(deltaTime)
        }

        // Décrémenter le timer pour ignorer les collisions avec le véhicule
        if (this.ignoreVehicleTimer > 0) {
            this.ignoreVehicleTimer -= deltaTime
            if (this.ignoreVehicleTimer <= 0) {
                this.ignoreVehicleTimer = 0
                this.ignoreVehicleCollision = false
            }
        }

        // Décrémenter le cooldown des dégâts
        if (this.damageCooldown > 0) {
            this.damageCooldown -= deltaTime
        }

        // Décrémenter le cooldown du tir
        if (this.shootCooldown > 0) {
            this.shootCooldown -= deltaTime
        }

        // Mettre à jour les balles
        this.updateBullets(deltaTime)

        // Ne plus bouger si mort (mais continuer l'animation de mort)
        if (this.isDead) {
            if (this.mixer) {
                this.mixer.update(deltaTime)
            }
            return
        }

        let moveForward = 0
        let turnSpeed = 0

        if (this.keys.Z) moveForward = 1
        if (this.keys.S) moveForward = -1
        if (this.keys.D) turnSpeed = -1
        if (this.keys.Q) turnSpeed = 1

        if (this.inVehicle && this.vehicle) {
            this.vehicle.setInput(moveForward, turnSpeed)
        } else {
            const isMoving = moveForward !== 0 || turnSpeed !== 0
            this.playAnimation(isMoving)

            if (turnSpeed !== 0) {
                this.bodyRotation += turnSpeed * this.rotationSpeed
                this.body.rotation.y = this.bodyRotation
            }

            if (moveForward !== 0) {
                if (moveForward < 0 && this.lastMoveForward >= 0) {
                    this.bodyRotation += Math.PI
                }
                if (moveForward > 0 && this.lastMoveForward < 0) {
                    this.bodyRotation += Math.PI
                }
                this.lastMoveForward = moveForward
                this.body.rotation.y = this.bodyRotation

                const moveDistance = this.moveSpeed
                this.velocity.x = Math.sin(this.bodyRotation) * moveDistance
                this.velocity.z = Math.cos(this.bodyRotation) * moveDistance
            } else {
                this.velocity.x *= 0.85
                this.velocity.z *= 0.85

                if (Math.abs(this.velocity.x) < 0.01) this.velocity.x = 0
                if (Math.abs(this.velocity.z) < 0.01) this.velocity.z = 0
            }

            this.velocity.y -= this.gravity * deltaTime

            const nextPosition = this.body.position.clone()
            nextPosition.x += this.velocity.x * deltaTime
            nextPosition.z += this.velocity.z * deltaTime

            // Tester les collisions seulement si le personnage n'est pas dans le véhicule
            if (!this.inVehicle && this.checkCollision(nextPosition)) {
                this.velocity.x = 0
                this.velocity.z = 0
            } else {
                this.body.position.x = nextPosition.x
                this.body.position.z = nextPosition.z
            }

            this.body.position.y += this.velocity.y * deltaTime

            const characterHalfHeight = 0.9
            const groundLevel = 0

            if (this.body.position.y - characterHalfHeight <= groundLevel) {
                this.body.position.y = groundLevel + characterHalfHeight
                this.velocity.y = 0
                this.isGrounded = true
            } else {
                this.isGrounded = false
            }
        }

        if (this.cameraController) {
            this.cameraController.update()
        }
    }

    setVehicle(vehicle) {
        this.vehicle = vehicle
    }

    getDistanceToVehicle() {
        if (!this.vehicle) return Infinity
        return this.body.position.distanceTo(this.vehicle.position)
    }

    enterVehicle() {
        if (!this.vehicle || this.inVehicle) return

        this.inVehicle = true
        this.body.visible = false
        this.vehicle.show()

        console.log('Entré dans le véhicule!')
    }

    exitVehicle() {
        if (!this.inVehicle) return

        this.inVehicle = false
        this.vehicle.show()
        this.body.visible = true

        // Ignorer les collisions avec le véhicule pendant 1 seconde
        // IMPORTANT: Activer AVANT de calculer la position de sortie
        this.ignoreVehicleCollision = true
        this.ignoreVehicleTimer = 1.0

        // Augmenter la distance de sortie pour éviter d'être dans la hitbox
        const exitOffset = new THREE.Vector3(3.5, 0, 0)
        exitOffset.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.vehicle.rotation)
        const exitPosition = this.vehicle.position.clone().add(exitOffset)
        exitPosition.y = 1

        if (!this.checkCollision(exitPosition)) {
            this.body.position.copy(exitPosition)
        } else {
            const altOffset = new THREE.Vector3(-3.5, 0, 0)
            altOffset.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.vehicle.rotation)
            const altPosition = this.vehicle.position.clone().add(altOffset)
            altPosition.y = 1

            if (!this.checkCollision(altPosition)) {
                this.body.position.copy(altPosition)
            } else {

                const frontOffset = new THREE.Vector3(0, 0, 3.5)
                frontOffset.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.vehicle.rotation)
                const frontPosition = this.vehicle.position.clone().add(frontOffset)
                frontPosition.y = 1

                if (!this.checkCollision(frontPosition)) {
                    this.body.position.copy(frontPosition)
                } else {
                    // En dernier recours, placer derrière le véhicule
                    const backOffset = new THREE.Vector3(0, 0, -3.5)
                    backOffset.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.vehicle.rotation)
                    const backPosition = this.vehicle.position.clone().add(backOffset)
                    backPosition.y = 1
                    this.body.position.copy(backPosition)
                }
            }
        }

        this.velocity.x = 0
        this.velocity.z = 0
        this.vehicle.brake()

        console.log('Sorti du véhicule!')
    }

    getNearbyInteractable() {
        const interactionDistance = 3
        let nearestInteractable = null
        let nearestDistance = interactionDistance

        // Vérifier les NPCs d'abord
        const nearbyNPC = this.getNearbyNPC()
        if (nearbyNPC) {
            nearestDistance = this.body.position.distanceTo(nearbyNPC.body.position)
            if (nearestDistance < interactionDistance) {
                nearestInteractable = {
                    object: nearbyNPC.body,
                    label: 'Discuter',
                    key: 'E',
                    callback: () => this.startDialogue(nearbyNPC),
                    distance: nearestDistance
                }
                return nearestInteractable
            }
        }

        // Puis vérifier les autres objets interactables
        this.scene.traverse((object) => {
            if (object.userData?.isInteractable) {
                // Obtenir la position globale de l'objet
                const worldPos = new THREE.Vector3()
                object.getWorldPosition(worldPos)

                const distance = this.body.position.distanceTo(worldPos)

                if (distance < nearestDistance) {
                    nearestDistance = distance
                    nearestInteractable = {
                        object: object,
                        label: object.userData.interactionLabel || 'Interagir',
                        key: object.userData.interactionKey || 'E',
                        callback: object.userData.onInteract,
                        distance: distance
                    }
                }
            }
        })

        return nearestInteractable
    }

    getNearbyNPC() {
        let nearestNPC = null
        let nearestDistance = this.interactionDistance

        for (const npc of this.npcs) {
            if (!npc.body) continue

            const distance = this.body.position.distanceTo(npc.body.position)

            if (distance < nearestDistance) {
                nearestDistance = distance
                nearestNPC = npc
            }
        }

        return nearestNPC
    }

    startDialogue(npc, isAutoQuiz = false) {
        if (!npc && !isAutoQuiz) return

        // Vérifier si c'est un NPC qui demande le quiz et si le score est insuffisant
        if (npc && !isAutoQuiz && this.score < 1000) {
            console.log(`❌ Score insuffisant: ${this.score}/1000. Quiz verrouillé!`)
            return
        }

        this.nearbyNPC = npc
        this.currentDialogue = this.dialogueManager.getRandomQuestion()

        // Pause les vagues quand le quiz démarre
        if (this.waveManager && this.waveManager.pauseWaves) {
            this.waveManager.pauseWaves()
        }
    }

    takeDamage(amount) {
        if (this.isDead || this.damageCooldown > 0 || this.inVehicle) return

        this.health -= amount
        this.damageCooldown = 1
        console.log(`Degats recu Vie: ${this.health}/${this.maxHealth}`)

        if (this.onHealthChange) {
            this.onHealthChange(this.health, this.maxHealth)
        }

        if (this.health <= 0) {
            this.health = 0
            this.isDead = true
            console.log('Le joueur est mort')

            if (this.onHealthChange) {
                this.onHealthChange(this.health, this.maxHealth)
            }

            if (this.mixer && this.animations[0]) {
                if (this.currentAction) {
                    this.currentAction.stop()
                }
                const deathAction = this.mixer.clipAction(this.animations[0])
                deathAction.setLoop(THREE.LoopOnce)
                deathAction.clampWhenFinished = true
                deathAction.play()
            }

            if (this.onDeath) {
                this.onDeath()
            }
        }
    }

    getHealth() {
        return this.health
    }

    dispose() {
        // Nettoyer les balles
        for (const bullet of this.bullets) {
            this.scene.remove(bullet.mesh)
            bullet.mesh.geometry.dispose()
            bullet.mesh.material.dispose()
        }
        this.bullets = []

        if (this.body && this.body.parent) {
            this.body.parent.remove(this.body)
        }

        if (this.cameraController) {
            this.cameraController.dispose()
        }

        if (this.collisionManager) {
            this.collisionManager.dispose()
        }
    }
}
