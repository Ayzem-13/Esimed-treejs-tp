import * as THREE from 'three/webgpu'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export class Control {
    constructor(camera, domElement) {
        this.camera = camera
        this.domElement = domElement

        this.controls = new OrbitControls(camera, domElement)
        this.controls.target.set(0, 0, 0)
        this.controls.update()

        // WASD Movement state
        this.wasdModeEnabled = false
        this.keysPressed = {}

        // Mouse camera control state
        this.cameraRotation = { x: 0, y: 0 }
        this.mouseSensitivity = 0.005
        this.isMouseDown = false
        this.lastMouseX = 0
        this.lastMouseY = 0

        // Bind event handlers
        this.handleKeyPress = this.handleKeyPress.bind(this)
        this.handleKeyRelease = this.handleKeyRelease.bind(this)
        this.handleMouseMove = this.handleMouseMove.bind(this)
        this.handleMouseDown = this.handleMouseDown.bind(this)
        this.handleMouseUp = this.handleMouseUp.bind(this)
        this.handleContextMenu = this.handleContextMenu.bind(this)

        // Setup event listeners
        window.addEventListener('keydown', this.handleKeyPress)
        window.addEventListener('keyup', this.handleKeyRelease)
        document.addEventListener('mousemove', this.handleMouseMove)
        document.addEventListener('mousedown', this.handleMouseDown)
        document.addEventListener('mouseup', this.handleMouseUp)
        this.domElement.addEventListener('contextmenu', this.handleContextMenu)
    }

    update() {
        this.controls.update()
    }

    setEnabled(enabled) {
        this.controls.enabled = enabled
    }

    setWASDMode(enabled) {
        this.wasdModeEnabled = enabled
        // Disable OrbitControls when WASD mode is active
        this.setEnabled(!enabled)

        if (enabled) {
            // Sync camera rotation state with current camera orientation
            const euler = new THREE.Euler()
            euler.setFromQuaternion(this.camera.quaternion, 'YXZ')
            this.cameraRotation.x = euler.x
            this.cameraRotation.y = euler.y
        }
    }

    handleContextMenu(event) {
        if (this.wasdModeEnabled) {
            event.preventDefault()
        }
    }

    handleMouseDown(event) {
        // Right mouse button to control camera in WASD mode
        if (event.button === 2 && this.wasdModeEnabled) {
            this.isMouseDown = true
            this.lastMouseX = event.clientX
            this.lastMouseY = event.clientY
        }
    }

    handleMouseUp(event) {
        if (event.button === 2) {
            this.isMouseDown = false
        }
    }

    handleKeyPress(event) {
        const key = event.key.toLowerCase()

        // WASD movement tracking
        if (['w', 'a', 's', 'd'].includes(key)) {
            this.keysPressed[key] = true
            event.preventDefault()
        }
    }

    handleKeyRelease(event) {
        const key = event.key.toLowerCase()

        // WASD movement tracking
        if (['w', 'a', 's', 'd'].includes(key)) {
            this.keysPressed[key] = false
        }
    }

    handleMouseMove(event) {
        // Camera control with right mouse button in WASD mode
        if (this.wasdModeEnabled && this.isMouseDown) {
            const deltaX = event.clientX - this.lastMouseX
            const deltaY = event.clientY - this.lastMouseY

            this.lastMouseX = event.clientX
            this.lastMouseY = event.clientY

            // Update camera rotation
            this.cameraRotation.y += deltaX * this.mouseSensitivity
            this.cameraRotation.x += deltaY * this.mouseSensitivity

            // Clamp pitch to prevent flipping
            this.cameraRotation.x = Math.max(-Math.PI / 2.3, Math.min(Math.PI / 2.3, this.cameraRotation.x))

            // Apply rotation to camera
            this.updateCameraRotation()
        }
    }

    updateCameraRotation() {
        // Create euler angles from rotation values
        const euler = new THREE.Euler(this.cameraRotation.x, this.cameraRotation.y, 0, 'YXZ')
        this.camera.quaternion.setFromEuler(euler)
    }

    handleWASDMovement() {
        if (!this.wasdModeEnabled) return

        const moveSpeed = 0.2
        const direction = new THREE.Vector3()

        // Get forward and right vectors based on camera rotation
        const forward = new THREE.Vector3()
        const right = new THREE.Vector3()

        this.camera.getWorldDirection(forward)
        forward.y = 0
        forward.normalize()

        right.crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize()

        // Handle WASD inputs
        if (this.keysPressed['w']) {
            direction.addScaledVector(forward, moveSpeed)
        }
        if (this.keysPressed['s']) {
            direction.addScaledVector(forward, -moveSpeed)
        }
        if (this.keysPressed['d']) {
            direction.addScaledVector(right, moveSpeed)
        }
        if (this.keysPressed['a']) {
            direction.addScaledVector(right, -moveSpeed)
        }

        // Move camera
        if (direction.length() > 0) {
            this.camera.position.add(direction)
        }
    }
}
