import * as THREE from 'three/webgpu'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { PlayerInput } from './PlayerInput'
import { PlayerMovement } from './PlayerMovement'
import { PlayerHealth } from './PlayerHealth'
import { PlayerCombat } from './PlayerCombat'
import { PlayerAnimation } from './PlayerAnimation'
import { ThirdPersonCamera } from '../camera/ThirdPersonCamera'
import { CollisionManager } from '../systems/CollisionManager'
import { DialogueManager } from '../systems/DialogueManager'

/**
 * Contrôleur principal du joueur - Orchestre tous les sous-systèmes
 */
export class PlayerController {
    constructor(scene, camera, initialPosition = new THREE.Vector3(0, 0, 0)) {
        this.scene = scene
        this.camera = camera

        // Corps du joueur
        this.body = new THREE.Group()
        this.body.position.copy(initialPosition)
        this.body.position.y = 1
        scene.add(this.body)

        // Sous-systèmes
        this.input = new PlayerInput()
        this.movement = new PlayerMovement()
        this.healthSystem = new PlayerHealth()
        this.combat = new PlayerCombat(scene)
        this.animation = new PlayerAnimation()
        this.cameraController = new ThirdPersonCamera(camera, this)
        this.collisionManager = new CollisionManager(scene)
        this.dialogueManager = new DialogueManager()

        // Véhicule
        this.vehicle = null
        this.inVehicle = false
        this.vehicleDistance = 3
        this.ignoreVehicleCollision = false
        this.ignoreVehicleTimer = 0

        // NPCs et ennemis
        this.npcs = []
        this.waveManager = null

        // Dialogue
        this.currentDialogue = null
        this.nearbyNPC = null
        this.interactionDistance = 3
        this.wrongAnswerCount = 0
        this.maxWrongAnswers = 3

        // Configuration initiale
        this.setupCamera()
        this.setupInputCallbacks()
        this.setupHealthCallbacks()
        this.collisionManager.setupBVH()
        this.createCharacterMesh()
    }

    setupCamera() {
        setTimeout(() => {
            this.camera.position.set(
                this.body.position.x,
                this.body.position.y + 12,
                this.body.position.z + 0.1
            )
        }, 100)
    }

    setupInputCallbacks() {
        this.input.onJump = () => {
            if (!this.inVehicle && !this.healthSystem.isDead) {
                this.movement.jump()
            }
        }

        this.input.onShoot = () => {
            if (!this.healthSystem.isDead && !this.inVehicle) {
                this.combat.shoot(this.body.position, this.movement.bodyRotation)
            }
        }

        this.input.onVehicleToggle = () => {
            if (this.inVehicle) {
                this.exitVehicle()
            } else if (this.vehicle && this.getDistanceToVehicle() <= this.vehicleDistance) {
                this.enterVehicle()
            }
        }

        this.input.onInteract = () => {
            const nearbyNPC = this.getNearbyNPC()
            if (nearbyNPC) {
                this.startDialogue(nearbyNPC)
            }
        }
    }

    setupHealthCallbacks() {
        this.healthSystem.onDeath = () => {
            this.animation.playDeathAnimation()
            if (this.onDeath) {
                this.onDeath()
            }
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
                this.animation.setup(this.mesh, gltf.animations)
                console.log('Personnage chargé!')
            },
            undefined,
            (error) => console.error('Erreur de chargement:', error)
        )
    }

    // === Setters ===
    setNPCs(npcs) { this.npcs = npcs }
    setEnemies(enemies) { this.combat.setEnemies(enemies) }
    setWaveManager(waveManager) { this.waveManager = waveManager }
    setVehicle(vehicle) { this.vehicle = vehicle }

    // === Getters ===
    get score() { return this.combat.score }
    get isDead() { return this.healthSystem.isDead }
    get enemies() { return this.combat.enemies }
    get bodyRotation() { return this.movement.bodyRotation }
    get health() { return this.healthSystem.health }
    get maxHealth() { return this.healthSystem.maxHealth }

    addScore(points) { this.combat.addScore(points) }

    // === Véhicule ===
    getDistanceToVehicle() {
        if (!this.vehicle) return Infinity
        return this.body.position.distanceTo(this.vehicle.position)
    }

    enterVehicle() {
        if (!this.vehicle || this.inVehicle) return

        if (this.combat.score < 1000) {
            console.log(`Score insuffisant: ${this.combat.score}/1000. Vehicule verrouille`)
            return
        }
        this.combat.score -= 1000

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

        this.ignoreVehicleCollision = true
        this.ignoreVehicleTimer = 1.0

        const exitPosition = this.findExitPosition()
        if (exitPosition) {
            this.body.position.copy(exitPosition)
        }

        this.movement.stopMovement()
        this.vehicle.brake()
        console.log('Sorti du véhicule!')
    }

    findExitPosition() {
        const offsets = [
            new THREE.Vector3(3.5, 0, 0),
            new THREE.Vector3(-3.5, 0, 0),
            new THREE.Vector3(0, 0, 3.5),
            new THREE.Vector3(0, 0, -3.5)
        ]

        for (const offset of offsets) {
            offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.vehicle.rotation)
            const position = this.vehicle.position.clone().add(offset)
            position.y = 1

            if (!this.checkCollision(position)) {
                return position
            }
        }

        // Dernier recours
        const backOffset = new THREE.Vector3(0, 0, -3.5)
        backOffset.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.vehicle.rotation)
        const backPosition = this.vehicle.position.clone().add(backOffset)
        backPosition.y = 1
        return backPosition
    }

    // === Collision ===
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

    // === Dialogue / NPC ===
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

    getNearbyInteractable() {
        const interactionDistance = 3
        const nearbyNPC = this.getNearbyNPC()

        if (nearbyNPC) {
            const distance = this.body.position.distanceTo(nearbyNPC.body.position)
            if (distance < interactionDistance) {
                return {
                    object: nearbyNPC.body,
                    label: 'Discuter',
                    key: 'E',
                    callback: () => this.startDialogue(nearbyNPC),
                    distance
                }
            }
        }

        return null
    }

    startDialogue(npc, isAutoQuiz = false) {
        if (!npc && !isAutoQuiz) return

        if (npc && !isAutoQuiz && this.combat.score < 2500) {
            console.log(`❌ Score insuffisant: ${this.combat.score}/2500. Quiz verrouillé!`)
            return
        }

        this.nearbyNPC = npc
        this.currentDialogue = this.dialogueManager.getRandomQuestion()

        if (this.waveManager && this.waveManager.pauseWaves) {
            this.waveManager.pauseWaves()
        }
    }

    resumeWaves() {
        if (this.waveManager && this.waveManager.resumeWaves) {
            this.waveManager.resumeWaves()
        }
    }

    // === Dégâts ===
    takeDamage(amount) {
        const died = this.healthSystem.takeDamage(amount, this.inVehicle)
        if (died) {
            this.animation.playDeathAnimation()
        }
    }

    getHealth() { return this.healthSystem.getHealth() }

    // Callbacks pour la compatibilité
    set onHealthChange(callback) { this.healthSystem.onHealthChange = callback }

    // === Update ===
    update(deltaTime = 1 / 60) {
        this.animation.update(deltaTime)
        this.healthSystem.update(deltaTime)
        this.combat.update(deltaTime)

        // Timer véhicule
        if (this.ignoreVehicleTimer > 0) {
            this.ignoreVehicleTimer -= deltaTime
            if (this.ignoreVehicleTimer <= 0) {
                this.ignoreVehicleTimer = 0
                this.ignoreVehicleCollision = false
            }
        }

        if (this.healthSystem.isDead) return

        const { moveForward, turnSpeed } = this.input.getMovement()

        if (this.inVehicle && this.vehicle) {
            this.vehicle.setInput(moveForward, turnSpeed)
        } else {
            const result = this.movement.update(
                deltaTime,
                moveForward,
                turnSpeed,
                (pos) => this.checkCollision(pos),
                this.body.position
            )

            this.body.rotation.y = result.rotation
            this.animation.playAnimation(result.isMoving)
        }

        if (this.cameraController) {
            this.cameraController.update()
        }
    }

    dispose() {
        this.input.dispose()
        this.combat.dispose()
        this.animation.dispose()

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
