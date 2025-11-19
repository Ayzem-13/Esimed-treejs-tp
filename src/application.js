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
        
        this.initParms()
        this.sceneManager.addGround(this.groundParams.texture, this.groundParams.repeats)
        this.sceneManager.loadScene('/scenes/scene_1.json')
        
        this.sceneManager.addSkybox(this.skyboxParams.file)

        this.ui = new UI()
        this.ui.addSkyboxUI(this.skyboxFiles, this.skyboxParams,
            this.sceneManager.addSkybox.bind(this.sceneManager))
        this.ui.addGroundUI(this.groundTextures, this.groundParams,
            this.sceneManager.changeGround.bind(this.sceneManager))
        this.ui.addSunUI(this.sceneManager.sun)
        this.ui.addSelectionUI()
        
        this.selectedObject = null
        this.selectedMesh = null
        this.selectedMeshMaterial = null
        this.moveSelectedObject = false

        this.renderer.domElement.addEventListener('click', (event) => this.handleObjectSelection(event))
        window.addEventListener('keydown', (event) => this.handleKeyPress(event))
        document.addEventListener('mousemove', (event) => this.handleObjectMovement(event))

        this.renderer.setAnimationLoop(this.render.bind(this))
    }

    initParms() {
        this.groundTextures = [
            'aerial_grass_rock',
            'brown_mud_leaves_01',
            'forest_floor',
            'forrest_ground_01',
            'gravelly_sand'
        ]

        this.groundParams = {
            texture: this.groundTextures[0],
            repeats: 140
        }

        this.skyboxFiles = [
            'DaySkyHDRI019A_2K-TONEMAPPED.jpg',
            'DaySkyHDRI050A_2K-TONEMAPPED.jpg',
            'NightSkyHDRI009_2K-TONEMAPPED.jpg'
        ]

        this.skyboxParams = {
            file: this.skyboxFiles[1]
        }

        this.sunParams = {
            color: '#ffffff',
            intensity: 1.5,
            x: 10,
            z: 10,
        }
    }

    handleObjectSelection(event) {
        const rect = this.renderer.domElement.getBoundingClientRect()
        const mouse = this.getMouseCoordinates(event, rect)
        const raycaster = new THREE.Raycaster()
        raycaster.setFromCamera(mouse, this.camera)
        const intersects = raycaster.intersectObjects(this.scene.children, true)
        
        if (intersects.length > 0) {
            this.selectObject(intersects)
        } else {
            this.deselectObject()
        }
    }

    getMouseCoordinates(event, rect) {
        return new THREE.Vector2(
            ((event.clientX - rect.left) / rect.width) * 2 - 1,
            -((event.clientY - rect.top) / rect.height) * 2 + 1
        )
    }

    selectObject(intersects) {
        for (let i = 0; i < intersects.length; i++) {
            if (intersects[i].object.userData.isSelectable) {
                this.deselectObject()

                this.selectedMesh = intersects[i].object
                this.selectedObject = this.selectedMesh.userData.object
                this.selectedMeshMaterial = this.selectedMesh.material
                this.selectedMesh.material = new THREE.MeshStandardMaterial({ color: 0xffff00 })

                this.ui.updateSelectionUI(this.selectedObject)
                break
            }
        }
    }

    deselectObject() {
        if (this.selectedMesh) {
            this.selectedMesh.material = this.selectedMeshMaterial
        }
        this.selectedMesh = null
        this.selectedObject = null
        this.selectedMeshMaterial = null
        this.moveSelectedObject = false
        this.ui.hideSelectionUI()
    }

    handleKeyPress(event) {
        if (event.code === 'KeyG') {
            this.moveSelectedObject = !this.moveSelectedObject
        }
    }

    handleObjectMovement(event) {
        if (this.moveSelectedObject && this.selectedObject != null) {
            const rect = this.renderer.domElement.getBoundingClientRect()
            const mouse = new THREE.Vector2(
                ((event.clientX - rect.left) / rect.width) * 2 - 1,
                -((event.clientY - rect.top) / rect.height) * 2 + 1
            )
            const raycaster = new THREE.Raycaster()
            raycaster.setFromCamera(mouse, this.camera)
            const intersects = raycaster.intersectObject(this.sceneManager.groundPlane, true)
            if (intersects.length > 0) {
                this.selectedObject.position.copy(intersects[0].point)
                this.ui.updateSelectionUI(this.selectedObject)
            }
        }
    }

    render() {
        this.controlManager.update()
        this.renderer.render(this.scene, this.camera)
    }

}
