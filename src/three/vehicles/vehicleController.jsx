import * as THREE from 'three/webgpu'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { ParticleSystem } from '../particles/ParticleSystem'

export class VehicleController {
    constructor(scene, initialPosition = new THREE.Vector3(0, 0, 0)) {
        this.scene = scene
        this.mesh = null
        this.isLoaded = false

        this.position = initialPosition.clone()
        this.rotation = 0

        this.width = 0.8
        this.height = 0.8
        this.length = 1.8

        this.velocity = new THREE.Vector3(0, 0, 0)
        this.rotationSpeed = 0.1
        this.gravity = 9.8
        this.isGrounded = true

        this.currentMoveForward = 0
        this.currentTurnSpeed = 0

        this.wheels = []
        this.leftWheels = []
        this.rightWheels = []
        this.rearWheels = []
        this.wheelRotation = 0
        this.steeringAngle = 0

        this.currentSpeed = 0
        this.acceleration = 20
        this.deceleration = 15
        this.moveSpeed = 27.78
        this.reverseSpeed = 8.33

        this.smokeParticles = new ParticleSystem(scene)
        this.emissionTimer = 0
        this.emissionRate = 0.1

        // NPCs pour les collisions
        this.npcs = []

        this.loadVehicleMesh()
    }

    setNPCs(npcs) {
        this.npcs = npcs
    }

    loadVehicleMesh() {
        const loader = new GLTFLoader()

        loader.load(
            '/models/vehicle/Range Rover.glb',
            (gltf) => {

                this.mesh = new THREE.Group()
                this.mesh.position.copy(this.position)

                const model = gltf.scene
                model.position.y = 0.7
                model.scale.set(0.8, 0.8, 0.8)

                model.traverse((child) => {
                    if (child.isMesh) {
                        child.castShadow = true
                        child.receiveShadow = true

                        const name = child.name.toLowerCase()
                        if (name.includes('wheel') || name.includes('tire') || name.includes('roue')) {
                            if (name.includes('spare') || name.includes('back') || name.includes('rear')) {
                                console.log('Roue de secours ignorée:', child.name)
                                return
                            }

                            this.wheels.push(child)

                            const isLeft = name.includes('left') || name.includes('_l') || name.includes('gauche') || name.includes('_fl') || name.includes('_rl')
                            const isRight = name.includes('right') || name.includes('_r') || name.includes('droite') || name.includes('_fr') || name.includes('_rr')
                            const isRear = name.includes('_rl') || name.includes('_rr')

                            if (isLeft) {
                                this.leftWheels.push(child)
                            } else if (isRight) {
                                this.rightWheels.push(child)
                            }

                            if (isRear) {
                                this.rearWheels.push(child)
                            }

                            console.log('Roue:', child.name, '- Gauche:', isLeft, 'Droite:', isRight, 'Arrière:', isRear)
                        }
                    }
                })

                this.mesh.add(model)
                this.scene.add(this.mesh)
                this.isLoaded = true

                // Marquer le véhicule comme interactif
                this.mesh.userData = {
                    isInteractable: true,
                    interactionLabel: 'Entrer',
                    interactionKey: 'F'
                }

                let steeringCount = 0
                for (const wheel of this.wheels) {
                    if (steeringCount < 2) {
                        wheel.userData.isSteering = true
                        steeringCount++
                    }
                }

                console.log('Véhicule chargé! Roues trouvées:', this.wheels.length)
            },
            undefined,
            (error) => {
                console.error('Erreur chargement véhicule:', error)
            }
        )
    }

    setInput(moveForward, turnSpeed) {
        this.currentMoveForward = moveForward
        this.currentTurnSpeed = turnSpeed
    }

    brake() {
        this.currentMoveForward = 0
        this.currentTurnSpeed = 0
    }

    /**
     * Vérifie les collisions
     * @param {THREE.Vector3} position - Position à vérifier
     * @returns {boolean} - True si une collision est détectée, sinon false
     */
    checkCollision(position) {
        const halfWidth = this.width / 2
        const halfLength = this.length / 2
        const bottomMargin = 0.3

        const min = new THREE.Vector3(
            position.x - halfWidth,
            position.y - this.height / 2 + bottomMargin,
            position.z - halfLength
        )
        const max = new THREE.Vector3(
            position.x + halfWidth,
            position.y + this.height / 2,
            position.z + halfLength
        )
        const vehicleBox = new THREE.Box3(min, max)

        let isColliding = false

        // Vérifier collision avec les NPCs
        if (this.npcs && this.npcs.length > 0) {
            for (const npc of this.npcs) {
                if (!npc.body) continue

                const npcHalfWidth = npc.width / 2
                const npcHalfLength = npc.length / 2
                const npcBottomMargin = 0.3

                const npcMin = new THREE.Vector3(
                    npc.body.position.x - npcHalfWidth,
                    npc.body.position.y - npc.height / 2 + npcBottomMargin,
                    npc.body.position.z - npcHalfLength
                )
                const npcMax = new THREE.Vector3(
                    npc.body.position.x + npcHalfWidth,
                    npc.body.position.y + npc.height / 2,
                    npc.body.position.z + npcHalfLength
                )
                const npcBox = new THREE.Box3(npcMin, npcMax)

                if (vehicleBox.intersectsBox(npcBox)) {
                    const npcCenter = new THREE.Vector3()
                    npcBox.getCenter(npcCenter)

                    const currentDist = this.position.distanceTo(npcCenter)
                    const newDist = position.distanceTo(npcCenter)

                    if (newDist < currentDist) {
                        isColliding = true
                        break
                    }
                }
            }
        }

        // Vérifier collision avec les objets de la scène
        if (!isColliding) {
            this.scene.traverse((object) => {
                if (isColliding) return
                if (object === this.mesh) return
                if (object.isMesh && object.userData?.isSelectable) {
                    const objBox = new THREE.Box3().setFromObject(object)
                    if (vehicleBox.intersectsBox(objBox)) {
                        const objCenter = new THREE.Vector3()
                        objBox.getCenter(objCenter)

                        const currentDist = this.position.distanceTo(objCenter)
                        const newDist = position.distanceTo(objCenter)

                        if (newDist < currentDist) {
                            isColliding = true
                        }
                    }
                }
            })
        }

        return isColliding
    }

    update(deltaTime = 1/60) {
        if (!this.mesh || !this.isLoaded) return

        let moveForward = this.currentMoveForward || 0
        let turnSpeed = this.currentTurnSpeed || 0

        if (turnSpeed !== 0 && moveForward !== 0) {
            this.rotation += turnSpeed * this.rotationSpeed
            this.mesh.rotation.y = this.rotation
        }

        // Accélération/décélération progressive
        if (moveForward > 0) {
            // Avancer - accélérer vers la vitesse max (moveSpeed)
            this.currentSpeed += this.acceleration * deltaTime
            if (this.currentSpeed > this.moveSpeed) {
                this.currentSpeed = this.moveSpeed
            }
        } else if (moveForward < 0) {
            // Reculer - accélérer vers la vitesse de recul négative
            this.currentSpeed -= this.acceleration * deltaTime
            if (this.currentSpeed < -this.reverseSpeed) {
                this.currentSpeed = -this.reverseSpeed
            }
        } else {
            // Pas d'accélération - décélérer progressivement
            if (this.currentSpeed > 0) {
                this.currentSpeed -= this.deceleration * deltaTime
                if (this.currentSpeed < 0) this.currentSpeed = 0
            } else if (this.currentSpeed < 0) {
                this.currentSpeed += this.deceleration * deltaTime
                if (this.currentSpeed > 0) this.currentSpeed = 0
            }
        }

        this.velocity.x = Math.sin(this.rotation) * this.currentSpeed
        this.velocity.z = Math.cos(this.rotation) * this.currentSpeed

        this.velocity.y -= this.gravity * deltaTime

        const nextPosition = this.position.clone()
        nextPosition.x += this.velocity.x * deltaTime
        nextPosition.z += this.velocity.z * deltaTime

        if (!this.checkCollision(nextPosition)) {
            this.position.x = nextPosition.x
            this.position.z = nextPosition.z
        } else {
            this.velocity.x = 0
            this.velocity.z = 0
        }

        this.position.y += this.velocity.y * deltaTime

        const vehicleHalfHeight = this.height / 2
        const groundLevel = 0

        if (this.position.y - vehicleHalfHeight <= groundLevel) {
            this.position.y = groundLevel + vehicleHalfHeight
            this.velocity.y = 0
            this.isGrounded = true
        } else {
            this.isGrounded = false
        }

        this.mesh.position.copy(this.position)

        if (this.wheels.length > 0) {
            const speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.z * this.velocity.z)
            this.wheelRotation += speed * deltaTime * 2

            if (this.leftWheels.length === 0 && this.rightWheels.length === 0) {
                for (const wheel of this.wheels) {
                    wheel.rotation.x = this.wheelRotation
                }
            } else {
                for (const wheel of this.rightWheels) {
                    wheel.rotation.x = this.wheelRotation
                    if (wheel.userData.isSteering) {
                        wheel.rotation.y = this.steeringAngle
                    }
                }

                for (const wheel of this.leftWheels) {
                    wheel.rotation.x = -this.wheelRotation
                    if (wheel.userData.isSteering) {
                        wheel.rotation.y = this.steeringAngle
                    }
                }
            }
        }

        this.steeringAngle = turnSpeed * 0.4

        // Fumée quand le véhicule avance
        if (moveForward !== 0) {
            this.emissionTimer += deltaTime

            if (this.emissionTimer >= this.emissionRate) {
                this.emissionTimer = 0

                const center = this.position.clone()
                const backwardDistance = 1.2
                const rearCenter = center.clone()
                rearCenter.x -= Math.sin(this.rotation) * backwardDistance
                rearCenter.z -= Math.cos(this.rotation) * backwardDistance
                rearCenter.y = 0.2

                const wheelSpacing = 0.35

                const leftSmoke = rearCenter.clone()
                leftSmoke.x += Math.cos(this.rotation) * wheelSpacing
                leftSmoke.z -= Math.sin(this.rotation) * wheelSpacing

                const rightSmoke = rearCenter.clone()
                rightSmoke.x -= Math.cos(this.rotation) * wheelSpacing
                rightSmoke.z += Math.sin(this.rotation) * wheelSpacing

                this.smokeParticles.emit(leftSmoke)
                this.smokeParticles.emit(rightSmoke)
            }
        }

        this.smokeParticles.update(deltaTime)
    }

    show() {
        if (this.mesh) {
            this.mesh.visible = true
        }
    }

    hide() {
        if (this.mesh) {
            this.mesh.visible = false
        }
    }

    getEnterPosition() {
        const offset = new THREE.Vector3(0, 1, 0)
        offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.rotation)
        return this.position.clone().add(offset)
    }

    getExitPosition() {
        const offset = new THREE.Vector3(0, 0, -2)
        offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.rotation)
        return this.position.clone().add(offset)
    }

    getSpeedKmh() {
        return Math.abs(this.currentSpeed) * 3.6
    }

    dispose() {
        if (this.mesh && this.mesh.parent) {
            this.mesh.parent.remove(this.mesh)
        }
        this.wheels = []
        this.smokeParticles.dispose()
    }
}