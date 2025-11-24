import * as THREE from 'three/webgpu'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { EnemyAnimation } from './EnemyAnimation'

export class EnemyController {
    constructor(scene, position = new THREE.Vector3(0, 0, 0), options = {}, collisionManager = null) {
        this.scene = scene
        this.position = position.clone()
        this.body = null
        this.mesh = null
        this.isLoaded = false

        this.scale = options.scale || 1
        this.rotation = options.rotation || 0
        this.meshYOffset = options.meshYOffset || 0

        this.animation = new EnemyAnimation()
        this.autoPlayAnimation = options.autoPlayAnimation ?? true

        this.collisionManager = collisionManager
        this.debugMesh = null
        this.width = options.width || 0.5
        this.height = options.height || 1.8
        this.length = options.length || 0.5

        this.moveSpeed = options.moveSpeed || 2.5
        this.detectionRange = options.detectionRange || 20
        this.stopDistance = options.stopDistance || 1.5
        this.currentVelocity = new THREE.Vector3()

        this.targetCharacter = null
        this.targetVehicle = null
        this.isMoving = false
        this.isDead = false
        this.health = options.health || 1
        this.maxHealth = this.health
        this.damage = options.damage || 20
        this.attackRange = options.attackRange || 1.5
        this.attackCooldown = 0
        this.attackSpeed = 0.6 // Cooldown entre les attaques (en secondes) 

        this.loadZombieModel()
    }

    loadZombieModel() {
        this.body = new THREE.Group()
        this.body.position.copy(this.position)
        this.body.rotation.y = this.rotation
        this.scene.add(this.body)

        const loader = new GLTFLoader()
        loader.load(
            '/models/character/Zombie.glb',
            (gltf) => {
                this.mesh = gltf.scene
                this.mesh.scale.set(this.scale, this.scale, this.scale)
                this.mesh.position.y = this.meshYOffset

                // Setup animations
                this.animation.setup(this.mesh, gltf.animations)

                this.mesh.traverse((child) => {
                    if (child.isMesh) {
                        child.castShadow = true
                        child.receiveShadow = true
                    }
                })

                this.body.add(this.mesh)
                this.isLoaded = true

                console.log(`Zombie chargé à la position: ${this.position.x}, ${this.position.y}, ${this.position.z}`)
                console.log(`Animations disponibles: ${gltf.animations.length}`)
            },
            undefined,
            (error) => {
                console.error('Erreur de chargement du Zombie:', error)
                // Fallback: créer un cube si le modèle ne charge pas
                this.createFallbackCube()
            }
        )
    }

    createFallbackCube() {
        const geometry = new THREE.BoxGeometry(0.5, 1.8, 0.5)
        const material = new THREE.MeshStandardMaterial({
            color: 0x4CAF50,
            roughness: 0.8,
            metalness: 0.1
        })
        this.mesh = new THREE.Mesh(geometry, material)
        this.mesh.castShadow = true
        this.mesh.receiveShadow = true
        this.mesh.position.y = this.meshYOffset

        this.body.add(this.mesh)
        this.isLoaded = true

        console.log(`Fallback: Cube créé à la position: ${this.position.x}, ${this.position.y}, ${this.position.z}`)
    }

    setTargetCharacter(character) {
        this.targetCharacter = character
    }

    setTargetVehicle(vehicle) {
        this.targetVehicle = vehicle
    }

    //Mettre à jour la position et le mouvement du zombie
    update(deltaTime = 1 / 60) {
        if (!this.isLoaded || !this.targetCharacter) return

        // Gérer le cooldown d'attaque
        if (this.attackCooldown > 0) {
            this.attackCooldown -= deltaTime
        }

        // Déterminer la cible: véhicule si le joueur est dedans, sinon le personnage
        let targetPos
        if (this.targetCharacter.inVehicle && this.targetVehicle && this.targetVehicle.mesh) {
            targetPos = this.targetVehicle.mesh.position
        } else if (this.targetCharacter.body) {
            targetPos = this.targetCharacter.body.position
        }

        if (!targetPos) return

        const currentPos = this.body.position
        const distanceToTarget = currentPos.distanceTo(targetPos)

        // Toujours suivre sauf si trop proche
        if (distanceToTarget > this.stopDistance) {
            this.isMoving = true

            const direction = new THREE.Vector3().subVectors(targetPos, currentPos)
            direction.y = 0
            direction.normalize()

            const targetRotation = Math.atan2(direction.x, direction.z)
            this.body.rotation.y = this.lerpRotation(this.body.rotation.y, targetRotation, 0.1)

            // Calculer la prochaine position
            const moveVector = direction.multiplyScalar(this.moveSpeed * deltaTime)
            const nextPosition = new THREE.Vector3(
                currentPos.x + moveVector.x,
                currentPos.y,
                currentPos.z + moveVector.z
            )

            this.body.position.copy(nextPosition)
            this.position.copy(nextPosition)
        } else {
            this.isMoving = false
        }

        // Gérer les animations
        if (this.isMoving) {
            // Jouer animation de marche (index 11)
            this.animation.playAnimation(11, true)
        }

        // Attaquer seulement si le cooldown est terminé
        if (distanceToTarget <= this.attackRange && !this.targetCharacter.inVehicle) {
            if (this.attackCooldown <= 0) {
                this.targetCharacter.takeDamage(this.damage)
                this.attackCooldown = this.attackSpeed
            }
        }

        this.animation.update(deltaTime)

        if (this.body) {
            this.position.copy(this.body.position)
        }

        this.clearDebugBox()
    }

    /**
     * Interpoler l'angle de rotation (smoothstep)
     */
    lerpRotation(current, target, speed) {
        let diff = target - current

        while (diff > Math.PI) diff -= 2 * Math.PI
        while (diff < -Math.PI) diff += 2 * Math.PI

        return current + diff * speed
    }

    clearDebugBox() {
        if (this.debugMesh) {
            this.scene.remove(this.debugMesh)
            this.debugMesh.geometry.dispose()
            this.debugMesh.material.dispose()
            this.debugMesh = null
        }
    }

    setPosition(x, y, z) {
        if (this.body) {
            this.body.position.set(x, y, z)
        }
        this.position.set(x, y, z)
    }

    setRotation(y) {
        if (this.body) {
            this.body.rotation.y = y
        }
        this.rotation = y
    }

    getPosition() {
        return this.body ? this.body.position.clone() : this.position.clone()
    }


    getDistanceToCharacter() {
        if (!this.targetCharacter) return Infinity
        return this.body.position.distanceTo(this.targetCharacter.body.position)
    }

    takeDamage(amount) {
        if (this.isDead) return

        this.health -= amount
        console.log(`Zombie touché! Vie: ${this.health}/${this.maxHealth}`)

        // Changer la couleur pour montrer les dégâts
        if (this.mesh && this.mesh.material) {
            this.mesh.material.color.setHex(0xff0000) 
            setTimeout(() => {
                if (this.mesh && this.mesh.material && !this.isDead) {
                    this.mesh.material.color.setHex(0x4CAF50) 
                }
            }, 100)
        }

        if (this.health <= 0) {
            this.die()
        }
    }

    die() {
        this.isDead = true
        this.isLoaded = false
        console.log('Zombie éliminé!')

        // Supprimer le zombie de la scène
        if (this.body && this.body.parent) {
            this.body.parent.remove(this.body)
        }
    }

    dispose() {
        this.isLoaded = false
        this.attackCooldown = 0

        this.animation.dispose()

        if (this.mesh) {
            if (this.mesh.geometry) this.mesh.geometry.dispose()
            if (this.mesh.material) this.mesh.material.dispose()
            this.mesh = null
        }

        if (this.body && this.body.parent) {
            this.body.parent.remove(this.body)
            this.body = null
        }
    }
}
