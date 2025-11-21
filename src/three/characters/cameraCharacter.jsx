import * as THREE from 'three/webgpu'

export class CameraCharacter {
    constructor(camera, character) {
        this.camera = camera
        this.character = character

        this.distance = 5
        this.minDistance = 3
        this.maxDistance = 20

        this.cameraHeight = 2

        this.angleVertical = -0.2
        this.angleHorizontal = 0 
        this.isRotating = false 

        document.addEventListener('mousedown', (e) => {
            if (e.button === 2) { 
                this.isRotating = true
                e.preventDefault()
            }
        })

        document.addEventListener('mouseup', (e) => {
            if (e.button === 2) {
                this.isRotating = false
            }
        })

        document.addEventListener('contextmenu', (e) => e.preventDefault())

        document.addEventListener('mousemove', (e) => {
            if (this.isRotating) {
                this.angleHorizontal -= e.movementX * 0.005 
                this.angleVertical -= e.movementY * 0.003

                this.angleVertical = Math.max(-1.2, Math.min(0.5, this.angleVertical))
            }
        })

        document.addEventListener('wheel', (e) => {
            e.preventDefault()
            this.distance += e.deltaY * 0.01
            this.distance = Math.max(this.minDistance, Math.min(this.maxDistance, this.distance))
        }, { passive: false })
    }

    update() {
        if (!this.character || !this.camera) return

        let playerPosition
        let playerRotation

        if (this.character.inVehicle && this.character.vehicle) {
            playerPosition = this.character.vehicle.position
            playerRotation = this.character.vehicle.rotation
        } else {
            playerPosition = this.character.body.position
            playerRotation = this.character.bodyRotation
        }

        const totalRotation = playerRotation + this.angleHorizontal

        const distanceHorizontale = this.distance * Math.cos(this.angleVertical)

        const cameraPosX = playerPosition.x - Math.sin(totalRotation) * distanceHorizontale
        const cameraPosY = playerPosition.y + this.cameraHeight - Math.sin(this.angleVertical) * this.distance
        const cameraPosZ = playerPosition.z - Math.cos(totalRotation) * distanceHorizontale

        this.camera.position.lerp(
            new THREE.Vector3(cameraPosX, cameraPosY, cameraPosZ),
            0.1
        )

        const lookAtTarget = new THREE.Vector3(
            playerPosition.x,
            playerPosition.y + 1.5,
            playerPosition.z
        )
        this.camera.lookAt(lookAtTarget)
    }

    dispose() {
        this.isRotating = false
    }
}
