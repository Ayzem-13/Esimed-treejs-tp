import * as THREE from 'three/webgpu'
import { createStandardMaterial, loadGltf, textureloader } from './tools.js'

export class Scene {
    constructor() {
        this.scene = new THREE.Scene()
        this.models = {}
    }

    addCube() {
        const geometry = new THREE.BoxGeometry(1, 1, 1)
        const material = new THREE.MeshPhongMaterial({ color: 0xff0000, flatShading: true })
        const cube = new THREE.Mesh(geometry, material)
        cube.position.y = 1
        this.scene.add(cube)
    }

    addAmbiantLight() {
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.1)
        this.scene.add(ambientLight)
    }

    addDirectionLight() {
        const sun = new THREE.DirectionalLight(0xffffff, 1.5)
        sun.position.set(10, 20, 10)
        sun.target.position.set(0, 0, 0)
        sun.castShadow = true
        
        sun.shadow.camera.left = -50
        sun.shadow.camera.right = 50
        sun.shadow.camera.top = 50
        sun.shadow.camera.bottom = -50
        
        sun.shadow.mapSize.width = 2048
        sun.shadow.mapSize.height = 2048
        
        this.scene.add(sun)

        // direction du soleil repris sur la cible
        const sunHelper = new THREE.DirectionalLightHelper(sun, 5)
        this.scene.add(sunHelper)
    }

    addGround(texture, repeats) {
        const geometry = new THREE.PlaneGeometry(5000, 5000)
        const material = createStandardMaterial(texture, repeats)
        const plane = new THREE.Mesh(geometry, material)
        plane.rotation.x = -Math.PI / 2
        plane.receiveShadow = true
        this.scene.add(plane)
    }

    async loadScene(url) {
        try {
            const response = await fetch(url)
            const sceneData = await response.json()
            
            if (sceneData.nodes && Array.isArray(sceneData.nodes)) {
                for (const node of sceneData.nodes) {
                    const modelName = node.name
                    const model = await loadGltf(modelName)
                    
                    model.position.fromArray(node.position.split(',').map(Number))
                    model.quaternion.fromArray(node.rotation.split(',').map(Number))
                    model.scale.fromArray(node.scale.split(',').map(Number))
                    
                    this.scene.add(model)
                }
            }
        } catch (error) {
            console.error('Erreur lors du chargement de la scène:', error)
        }
    }

    addSkybox(filename) {
        const texture = textureloader.load(`/skybox/${filename}`)
        texture.mapping = THREE.EquirectangularReflectionMapping
        this.scene.background = texture
    }
    
}