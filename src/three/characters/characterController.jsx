import * as THREE from 'three/webgpu'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { CameraCharacter } from './cameraCharacter'

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

        this.setupEventListeners()
    }

    setNPCs(npcs) {
        this.npcs = npcs
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
        const halfSize = 0.25
        const height = 1.8
        const bottomMargin = 0.6

        const min = new THREE.Vector3(
            position.x - halfSize,
            position.y - height / 2 + bottomMargin,
            position.z - halfSize
        )
        const max = new THREE.Vector3(
            position.x + halfSize,
            position.y + height / 2,
            position.z + halfSize
        )
        const charBox = new THREE.Box3(min, max)

        let isColliding = false

        // Vérifier collision avec le véhicule
        if (this.vehicle && !this.inVehicle) {
            const vehicleHalfWidth = this.vehicle.width / 2
            const vehicleHalfLength = this.vehicle.length / 2
            const vehicleBottomMargin = 0.3

            const vehicleMin = new THREE.Vector3(
                this.vehicle.position.x - vehicleHalfWidth,
                this.vehicle.position.y - this.vehicle.height / 2 + vehicleBottomMargin,
                this.vehicle.position.z - vehicleHalfLength
            )
            const vehicleMax = new THREE.Vector3(
                this.vehicle.position.x + vehicleHalfWidth,
                this.vehicle.position.y + this.vehicle.height / 2,
                this.vehicle.position.z + vehicleHalfLength
            )
            const vehicleBox = new THREE.Box3(vehicleMin, vehicleMax)

            if (charBox.intersectsBox(vehicleBox)) {
                const vehicleCenter = new THREE.Vector3()
                vehicleBox.getCenter(vehicleCenter)

                const currentDist = this.body.position.distanceTo(vehicleCenter)
                const newDist = position.distanceTo(vehicleCenter)

                if (newDist < currentDist) {
                    isColliding = true
                }
            }
        }

        // Vérifier collision avec les NPCs
        if (!isColliding && this.npcs && this.npcs.length > 0) {
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

                if (charBox.intersectsBox(npcBox)) {
                    const npcCenter = new THREE.Vector3()
                    npcBox.getCenter(npcCenter)

                    const currentDist = this.body.position.distanceTo(npcCenter)
                    const newDist = position.distanceTo(npcCenter)

                    if (newDist < currentDist) {
                        isColliding = true
                        break
                    }
                }
            }
        }

        if (!isColliding) {
            this.scene.traverse((object) => {
                if (isColliding) return
                if (object === this.mesh) return
                if (object === this.body) return
                if (object.isMesh && object.userData?.isSelectable) {
                    const objBox = new THREE.Box3().setFromObject(object)
                    if (charBox.intersectsBox(objBox)) {
                        const objCenter = new THREE.Vector3()
                        objBox.getCenter(objCenter)

                        const currentDist = this.body.position.distanceTo(objCenter)
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
        if (this.mixer) {
            this.mixer.update(deltaTime)
        }

        let moveForward = 0
        let turnSpeed = 0

        if (this.keys.Z) moveForward = 1
        if (this.keys.S) moveForward = -1
        if (this.keys.D) turnSpeed = 1
        if (this.keys.Q) turnSpeed = -1

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

            if (!this.checkCollision(nextPosition)) {
                this.body.position.x = nextPosition.x
                this.body.position.z = nextPosition.z
            } else {
                this.velocity.x = 0
                this.velocity.z = 0
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

        const exitOffset = new THREE.Vector3(2, 0, 0)
        exitOffset.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.vehicle.rotation)
        const exitPosition = this.vehicle.position.clone().add(exitOffset)
        exitPosition.y = 1 

        if (!this.checkCollision(exitPosition)) {
            this.body.position.copy(exitPosition)
        } else {
            const altOffset = new THREE.Vector3(-2, 0, 0)
            altOffset.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.vehicle.rotation)
            const altPosition = this.vehicle.position.clone().add(altOffset)
            altPosition.y = 1

            if (!this.checkCollision(altPosition)) {
                this.body.position.copy(altPosition)
            } else {

                const frontOffset = new THREE.Vector3(0, 0, 2)
                frontOffset.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.vehicle.rotation)
                const frontPosition = this.vehicle.position.clone().add(frontOffset)
                frontPosition.y = 1
                this.body.position.copy(frontPosition)
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

    dispose() {
        if (this.body && this.body.parent) {
            this.body.parent.remove(this.body)
        }

        if (this.cameraController) {
            this.cameraController.dispose()
        }
    }
}
