import * as THREE from 'three/webgpu'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

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
        this.moveSpeed = 8
        this.rotationSpeed = 0.1
        this.gravity = 9.8
        this.isGrounded = true

        this.currentMoveForward = 0
        this.currentTurnSpeed = 0

        this.loadVehicleMesh()
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
                    }
                })

                this.mesh.add(model)
                this.scene.add(this.mesh)
                this.isLoaded = true
                console.log('Véhicule chargé!')
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

        if (moveForward !== 0) {
            const moveDistance = this.moveSpeed * moveForward
            this.velocity.x = Math.sin(this.rotation) * moveDistance
            this.velocity.z = Math.cos(this.rotation) * moveDistance
        } else {
            this.velocity.x *= 0.85
            this.velocity.z *= 0.85

            if (Math.abs(this.velocity.x) < 0.01) this.velocity.x = 0
            if (Math.abs(this.velocity.z) < 0.01) this.velocity.z = 0

            if (turnSpeed !== 0 && moveForward === 0) {
                this.velocity.x = 0
                this.velocity.z = 0
            }
        }

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

    dispose() {
        if (this.mesh && this.mesh.parent) {
            this.mesh.parent.remove(this.mesh)
        }
    }
}