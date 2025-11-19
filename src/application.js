import * as THREE from 'three/webgpu'
import { Camera } from './camera.js'
import { Scene } from './scene.js'
import { Control } from './control.js'
import { UI } from './ui.js'

export class Application {
    
    constructor() {
        this.renderer = new THREE.WebGPURenderer({antialias: true})
        this.renderer.setSize(window.innerWidth, window.innerHeight)
        this.renderer.shadowMap.enabled = true
        document.body.appendChild(this.renderer.domElement)
        
        this.sceneManager = new Scene()
        this.scene = this.sceneManager.scene

        // this.sceneManager.addCube()
        this.sceneManager.addAmbiantLight()
        this.sceneManager.addDirectionLight()
        
        this.cameraManager = new Camera()
        this.camera = this.cameraManager.camera
        this.controlManager = new Control(this.camera, this.renderer.domElement)
        
        this.initParmams()
        this.sceneManager.addGround(this.groundParams.texture, this.groundParams.repeats)
        this.sceneManager.loadScene('/scenes/scene_1.json')
        
        this.sceneManager.addSkybox(this.skyboxParams.file)

        this.ui = new UI()
        this.ui.addSkyboxUI(this.skyboxFiles, this.skyboxParams, 
        this.sceneManager.addSkybox.bind(this.sceneManager))

        this.renderer.setAnimationLoop(this.render.bind(this))
    }

    initParmams() {
        this.groundTextures = [
            'aerial_grass_rock',
            'brown_mud_leaves_01',
            'forest_floor',
            'forrest_ground_01',
            'gravelly_sand'
        ]

        this.groundParams = {
            texture: this.groundTextures[0],
            repeats: 1000
        }

        this.skyboxFiles = [
            'DaySkyHDRI019A_2K-TONEMAPPED.jpg',
            'DaySkyHDRI050A_2K-TONEMAPPED.jpg',
            'NightSkyHDRI009_2K-TONEMAPPED.jpg'
        ]

        this.skyboxParams = {
            file: this.skyboxFiles[1]
        }
    }

    render() {
        this.controlManager.update()
        this.renderer.render(this.scene, this.camera)
    }

}
