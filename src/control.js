import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export class Control {
    constructor(camera, domElement) {
        this.controls = new OrbitControls(camera, domElement)
        this.controls.target.set(0, 0, 0)
        this.controls.update()
    }

    update() {
        this.controls.update()
    }
}