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

        window.addEventListener('keydown', this.handleKeyDown);
        window.addEventListener('keyup', this.handleKeyUp);

        this.mouseSensitivity = 0.002
        this.yaw = 0;
        this.pitch = 0;
        this.isMouseCaptured = false;
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

    process() {
        if (this.controls.enabled) {
            this.controls.update()
        }
    }

    defaultPosition() {
        this.camera.position.set(0, 1.7, 10)
    }

    dispose() {
        window.removeEventListener('keydown', this.handleKeyDown);
        window.removeEventListener('keyup', this.handleKeyUp);

        if (this.controls) {
            this.controls.dispose();
        }
    }

}