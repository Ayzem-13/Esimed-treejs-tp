import * as THREE from 'three/webgpu'
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

        this.keys = {
            Z: false,
            Q: false,
            S: false,
            D: false,
            ' ': false
        }

        this.setupEventListeners()
    }

    createCharacterMesh() {
        const geometry = new THREE.BoxGeometry(0.6, 1.8, 0.6)
        const material = new THREE.MeshStandardMaterial({
            color: 0x3b82f6,
            metalness: 0.5,
            roughness: 0.5,
            emissive: 0x1e40af
        })
        const cube = new THREE.Mesh(geometry, material)
        cube.castShadow = true
        cube.receiveShadow = true
        cube.position.y = 0
        this.body.add(cube)
        this.mesh = cube

        console.log('Character created at:', this.body.position)
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
            if (this.isGrounded) {
                this.velocity.y = this.jumpForce
                this.isGrounded = false
            }
            event.preventDefault()
        }
    }

    handleKeyUp(event) {
        const key = event.key.toUpperCase()
        if (key in this.keys) {
            this.keys[key] = false
            event.preventDefault()
        }
    }

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
        this.scene.traverse((object) => {
            if (isColliding) return
            if (object === this.mesh) return
            if (object.isMesh && object.userData?.isSelectable) {
                const objBox = new THREE.Box3().setFromObject(object)
                if (charBox.intersectsBox(objBox)) {
                    // check si on est en train de se rapprocher de l'objet
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

        return isColliding
    }

    update(deltaTime = 1/60) {
        const moveInput = new THREE.Vector3()

        if (this.keys.Z) moveInput.z -= 1
        if (this.keys.S) moveInput.z += 1
        if (this.keys.Q) moveInput.x -= 1
        if (this.keys.D) moveInput.x += 1

        if (moveInput.length() > 0) {
            moveInput.normalize()

            const cameraYaw = this.cameraController.yaw

            const worldMoveX = moveInput.x * Math.cos(cameraYaw) - moveInput.z * Math.sin(cameraYaw)
            const worldMoveZ = moveInput.x * Math.sin(cameraYaw) + moveInput.z * Math.cos(cameraYaw)

            const targetRotation = Math.atan2(worldMoveX, -worldMoveZ)
            const rotationDiff = targetRotation - this.bodyRotation

            const normalizedDiff = Math.atan2(
                Math.sin(rotationDiff),
                Math.cos(rotationDiff)
            )

            this.bodyRotation += normalizedDiff * this.rotationSpeed
            this.body.rotation.y = this.bodyRotation

            this.velocity.x = worldMoveX * this.moveSpeed
            this.velocity.z = worldMoveZ * this.moveSpeed
        } else {
            this.velocity.x = 0
            this.velocity.z = 0
        }

        this.velocity.y -= this.gravity * deltaTime
        // update les positions
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

        if (this.cameraController) {
            this.cameraController.update()
        }
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
