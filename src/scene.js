import * as THREE from 'three/webgpu'
import { createStandardMaterial, loadGltf, textureloader } from './tools.js'

export class Scene {
    constructor() {
        this.scene = new THREE.Scene()
        this.models = {}
        this.objects = []
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
        this.sun = new THREE.DirectionalLight(0xffffff, 1.5)
        this.sun.position.set(10, 20, 10)
        this.sun.target.position.set(0, 0, 0)
        this.sun.castShadow = true
        
        this.sun.shadow.camera.left = -50
        this.sun.shadow.camera.right = 50
        this.sun.shadow.camera.top = 50
        this.sun.shadow.camera.bottom = -50
        
        this.sun.shadow.mapSize.width = 2048
        this.sun.shadow.mapSize.height = 2048
        
        this.scene.add(this.sun)

        // direction du soleil repris sur la cible
        const sunHelper = new THREE.DirectionalLightHelper(this.sun, 5)
        this.scene.add(sunHelper)
    }

    addGround(texture, repeats) {
        const geometry = new THREE.PlaneGeometry(5000, 5000)
        const material = createStandardMaterial(texture, repeats)
        const plane = new THREE.Mesh(geometry, material)
        plane.rotation.x = -Math.PI / 2
        plane.receiveShadow = true
        this.groundPlane = plane
        this.scene.add(plane)
    }

    changeGround(texture, repeats) {
        const newMaterial = createStandardMaterial(texture, repeats)
        this.groundPlane.material = newMaterial
    }

    async loadScene(url) {
        try {
            const response = await fetch(url)
            const sceneData = await response.json()
            await this.loadNodesFromData(sceneData)
        } catch (error) {
            console.error('Erreur lors du chargement de la scène:', error)
        }
    }

    addSkybox(filename) {
        const texture = textureloader.load(`/skybox/${filename}`)
        texture.mapping = THREE.EquirectangularReflectionMapping
        this.scene.background = texture
    }

    getSelectableObjects() {
        const objects = []
        this.scene.children.forEach(child => {
            child.traverse(mesh => {
                if (mesh.isMesh && mesh.userData.isSelectable) {
                    const parent = mesh.userData.object
                    if (!objects.includes(parent)) {
                        objects.push(parent)
                    }
                }
            })
        })
        return objects
    }

    async loadNodesFromData(sceneData) {
        if (!sceneData.nodes || !Array.isArray(sceneData.nodes)) return

        for (const node of sceneData.nodes) {
            const model = await loadGltf(node.name)

            model.position.fromArray(node.position.split(',').map(Number))
            model.quaternion.fromArray(node.rotation.split(',').map(Number))
            model.scale.fromArray(node.scale.split(',').map(Number))

            model.traverse(o => {
                if (o.isMesh) {
                    o.userData = {
                        isSelectable: true,
                        object: model,
                    }
                }
            })

            this.scene.add(model)
        }
    }

    exportScene(params) {
        const nodes = this.getSelectableObjects().map(obj => ({
            name: obj.name,
            position: `${obj.position.x},${obj.position.y},${obj.position.z}`,
            rotation: `${obj.quaternion.x},${obj.quaternion.y},${obj.quaternion.z},${obj.quaternion.w}`,
            scale: `${obj.scale.x},${obj.scale.y},${obj.scale.z}`
        }))

        return {
            params: {
                version: '1.0',
                skybox: params.skybox,
                ground: params.ground
            },
            nodes
        }
    }

    clearScene() {
        this.getSelectableObjects().forEach(obj => {
            this.scene.remove(obj)
        })
    }

    async importScene(event, params) {
        const file = event.target.files[0]
        if (!file) return

        try {
            const text = await file.text()
            const sceneData = JSON.parse(text)

            this.clearScene()

            if (sceneData.params?.skybox) {
                params.skybox.file = sceneData.params.skybox.file
            }

            if (sceneData.params?.ground) {
                params.ground.texture = sceneData.params.ground.texture
                params.ground.repeats = sceneData.params.ground.repeats
            }

            await this.loadNodesFromData(sceneData)
        } catch (error) {
            console.error('Erreur lors de l\'importation de la scène:', error)
        }
    }

    async loadModel(modelName, position) {
        const model = await loadGltf(modelName)
        model.position.copy(position)
        model.traverse(o => {
            if (o.isMesh) {
                o.userData = { isSelectable: true, object: model }
            }
        })
        this.scene.add(model)
    }

    deleteObject(object) {
        if (object) {
            this.scene.remove(object)
        }
    }

    getAvailableModels() {
        return ['birch1', 'bush1', 'bush2', 'flowers1', 'grass1', 'log1', 'oak1', 'oak2', 'oak3', 'pine1', 'spruce1', 'stone1', 'stone2', 'stump1']
    }

    addNewObject(modelName) {
        this.loadModel(modelName, new THREE.Vector3(0, 0, 0))
    }
}