import * as THREE from 'three/webgpu'
import {OrbitControls} from 'three/addons/controls/OrbitControls.js'

export class Camera {
    
    constructor(renderer, params) {
        this.renderer = renderer;
        this.params = params;
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
        this.controls = new OrbitControls(this.camera, renderer.domElement)
        this.controls.enableDamping = true
        this.controls.dampingFactor = 0.05
        this.controls.target.set(0, 1.7, 0)
        this.defaultPosition()

        this.direction = new THREE.Vector2(0,0)
        this.speed = 0.2

        // Bind methods
        this.handleKeyDown = this.handleKeyDown.bind(this)
        this.handleKeyUp = this.handleKeyUp.bind(this)
        this.handleMouseClick = this.handleMouseClick.bind(this)
        this.handlePointerLockChange = this.handlePointerLockChange.bind(this)
        this.handleMouseMove = this.handleMouseMove.bind(this)

        window.addEventListener('keydown', this.handleKeyDown);
        window.addEventListener('keyup', this.handleKeyUp);

        this.mouseSensitivity = 0.002
        this.yaw = 0;
        this.pitch = 0;
        this.isMouseCaptured = false;
        
        renderer.domElement.addEventListener('click', this.handleMouseClick)
        document.addEventListener('pointerlockchange', this.handlePointerLockChange)
        document.addEventListener('mousemove', this.handleMouseMove);
    }

    toogleControls(params) {
        this.controls.enabled = !params.useWASD
        if (params.useWASD) {
            this.camera.defaultPosition()
        }
    }

    handleKeyDown(event) {
        switch (event.code) {
            case 'KeyW': this.direction.x = 1; break;
            case 'KeyS': this.direction.x = -1; break;
            case 'KeyA': this.direction.y = -1; break;
            case 'KeyD': this.direction.y = 1; break;
        }
    }

    handleKeyUp(event) {
        switch (event.code) {
            case 'KeyW':  
            case 'KeyS': this.direction.x = 0; break;
            case 'KeyA': 
            case 'KeyD': this.direction.y = 0; break;
        }
    }

    handleMouseClick() {
        if (this.params.useWASD) {
            this.renderer.domElement.requestPointerLock()
        }
    }

    handlePointerLockChange() {
        if (this.params.useWASD) {
            this.isMouseCaptured = document.pointerLockElement === this.renderer.domElement
        }
    }

    handleMouseMove(event) {
        if (this.isMouseCaptured) {
            this.yaw -= event.movementX * this.mouseSensitivity
            this.pitch -= event.movementY * this.mouseSensitivity
            this.pitch = Math.max(-Math.PI/2, Math.min(Math.PI/2, this.pitch))
        }
    }

    process(params) {
        if (params.useWASD && this.isMouseCaptured) {
            const forwardVector = new THREE.Vector3(-Math.sin(this.yaw), 0, -Math.cos(this.yaw)).normalize()
            const rightVector = new THREE.Vector3(-Math.cos(this.yaw), 0, Math.sin(this.yaw)).normalize()
            this.camera.position.addScaledVector(forwardVector, this.direction.x * this.speed)
            this.camera.position.addScaledVector(rightVector, this.direction.y * this.speed)
            const lookDir = new THREE.Vector3(
                -Math.sin(this.yaw) * Math.cos(this.pitch),
                Math.sin(this.pitch),
                -Math.cos(this.yaw) * Math.cos(this.pitch)
            ).normalize();
            this.camera.lookAt(this.camera.position.clone().add(lookDir))
        }
        this.controls.update()
    }

    defaultPosition() {
        this.camera.position.set(0, 1.7, 10)
    }

    dispose() {
        window.removeEventListener('keydown', this.handleKeyDown);
        window.removeEventListener('keyup', this.handleKeyUp);
        if (this.renderer && this.renderer.domElement) {
            this.renderer.domElement.removeEventListener('click', this.handleMouseClick)
        }
        document.removeEventListener('pointerlockchange', this.handlePointerLockChange)
        document.removeEventListener('mousemove', this.handleMouseMove);
        
        if (this.controls) {
            this.controls.dispose();
        }
    }

}