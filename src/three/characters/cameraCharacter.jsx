import * as THREE from 'three/webgpu'

export class CameraCharacter {
    constructor(camera, character) {
        this.camera = camera
        this.character = character

        this.yaw = 0
        this.pitch = -0.3
        this.mouseSensitivity = 0.002

        this.distance = 15
        this.height = 5

        this.isMouseCaptured = false

        this.yawVelocity = 0
        this.pitchVelocity = 0
        this.mouseDamping = 0.88

        this.setupEventListeners()
    }

    setupEventListeners() {
        document.addEventListener('click', () => {
            if (!this.isMouseCaptured) {
                document.body.requestPointerLock = document.body.requestPointerLock || document.body.mozRequestPointerLock
                document.body.requestPointerLock()
            }
        })

        document.addEventListener('mousemove', (e) => this.handleMouseMove(e))

        document.addEventListener('pointerlockchange', () => {
            this.isMouseCaptured = document.pointerLockElement === document.body
        })
    }

    handleMouseMove(event) {
        if (!this.isMouseCaptured) return

        this.yawVelocity += event.movementX * this.mouseSensitivity
        this.pitchVelocity += event.movementY * this.mouseSensitivity

        const maxPitchVel = Math.PI / 6
        this.pitchVelocity = Math.max(-maxPitchVel, Math.min(maxPitchVel, this.pitchVelocity))
    }

    updateRotation() {
        this.yawVelocity *= this.mouseDamping
        this.pitchVelocity *= this.mouseDamping

        this.yaw += this.yawVelocity
        this.pitch += this.pitchVelocity

        const maxPitch = Math.PI / 3
        const minPitch = -Math.PI / 2.5
        this.pitch = Math.max(minPitch, Math.min(maxPitch, this.pitch))
    }

    update() {
        if (!this.character || !this.camera) return

        this.updateRotation()

        const charPos = this.character.body.position

        const horizontalDistance = this.distance * Math.cos(this.pitch)
        const cameraX = charPos.x - Math.sin(this.yaw) * horizontalDistance
        const cameraY = charPos.y + this.height - Math.sin(this.pitch) * this.distance
        const cameraZ = charPos.z - Math.cos(this.yaw) * horizontalDistance

        const targetCameraPos = new THREE.Vector3(cameraX, cameraY, cameraZ)

        const cameraSpeed = 8.0
        const lerpFactor = Math.min(1.0, cameraSpeed * (1/60))
        this.camera.position.lerp(targetCameraPos, lerpFactor)

        const lookAtPoint = charPos.clone()
        lookAtPoint.y += 1.2

        this.camera.lookAt(lookAtPoint)
    }

    dispose() {
        document.exitPointerLock()
    }
}
