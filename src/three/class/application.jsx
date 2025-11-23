import * as THREE from 'three/webgpu'
import { Scene } from './scene'
import { UI } from './ui'
import { Camera } from './camera'
import { CharacterController } from '../characters/characterController'
import { VehicleController } from '../vehicles/vehicleController'
import { NPCController } from '../npc/npcController'

export class Application {

    constructor(container = document.body, gameMode = 'editor') {
        this.container = container
        this.gameMode = gameMode
        this.initParams();
        this.renderer = new THREE.WebGPURenderer({antialias: true})
        this.renderer.setSize(window.innerWidth, window.innerHeight)
        this.renderer.shadowMap.enabled = true
        this.container.appendChild(this.renderer.domElement)

        this.camera = new Camera(this.renderer, this.globalParams)

        this.scene = new Scene()
        // this.scene.addCube()
        this.scene.addAmbiantLight()
        this.scene.addGround(this.groundParams)
        this.scene.addSkybox(this.skyboxParams.file)
        this.sunHelper = this.scene.addDirectionalLight()
        this.scene.loadScene('/scenes/scene_1.json')

        this.importInput = document.createElement('input')
        this.importInput.type = 'file'
        this.importInput.accept = '.json,application/json'
        this.importInput.style.display = 'none';
        this.container.appendChild(this.importInput)
        this.importInput.addEventListener('change', async (event) => {
            await this.scene.importScene(event, { skybox : this.skyboxParams, ground: this.groundParams})
            this.importInput.value = ''
        });

        this.ui = new UI()
        this.ui.addGlobalUI(this.globalParams, this.camera.toogleControls.bind(this.camera),
            () => {
                this.scene.exportScene({ skybox : this.skyboxParams, ground: this.groundParams})
            },
            () => {
                this.importInput.click()
            },
            this.scene.clearScene.bind(this.scene)
        )
        this.ui.addSelectionUI(this.handleTransformChange.bind(this), this.handleDeleteObject.bind(this))
        this.ui.addModelLoader(this.tpModels, this.cityModels, this.handleLoadModel.bind(this))
        this.ui.addSkyboxUI(this.skyboxFiles, this.skyboxParams, this.scene.addSkybox.bind(this.scene))
        this.ui.addGroundUI(this.groundTextures, this.groundParams, this.scene.changeGround.bind(this.scene))
        this.ui.addSunUI(this.scene.sun)

        this.character = null
        this.npcs = []
        if (this.gameMode === 'character') {
            this.initCharacter()
            this.initNPCs()
        }

        this.selectedObject = null
        this.selectedMesh = null
        this.selectedMeshMaterial = null

        this.clock = new THREE.Clock()

        this.handleClick = this.handleClick.bind(this)
        this.handleKeyDown = this.handleKeyDown.bind(this)
        this.handleMouseMove = this.handleMouseMove.bind(this)

        this.renderer.domElement.addEventListener('click', this.handleClick);

        this.moveSelectedObject = false
        this.dragStartPosition = null
        this.dragStartScale = null
        window.addEventListener('keydown', this.handleKeyDown)
        document.addEventListener('mousemove', this.handleMouseMove);

        this.renderer.setAnimationLoop(this.render.bind(this))
    }

    handleClick(event) {
        if (this.globalParams.useWASD) return
        if (this.selectedObject != null) {
            this.selectedMesh.material = this.selectedMeshMaterial
            this.selectedObject = null
        }
        const rect = this.renderer.domElement.getBoundingClientRect()
        const mouse = new THREE.Vector2(
            ((event.clientX - rect.left) / rect.width) * 2 - 1,
            -((event.clientY - rect.top) / rect.height) * 2 + 1
        )
        const raycaster = new THREE.Raycaster()
        raycaster.setFromCamera(mouse, this.camera.camera)
        const intersects = raycaster.intersectObjects(this.scene.scene.children, true)
        const hit = intersects.find(i => i.object && i.object.userData && i.object.userData.isSelectable)
        if (hit) {
            this.selectedMesh = hit.object
            this.selectedObject = this.selectedMesh.userData.object
            this.selectedMeshMaterial = this.selectedMesh.material
            this.selectedMesh.material = new THREE.MeshStandardMaterial({ color: 0xffff00 })
            this.ui.updateSelectionUI(this.selectedObject)
            this.moveSelectedObject = false
        } else {
            this.ui.hideSelectionUI()
        }
    }

    handleKeyDown(event) {
        switch (event.code) {
            case 'KeyG':
                this.moveSelectedObject = !this.moveSelectedObject
                if (this.moveSelectedObject && this.selectedObject) {
                    // Mémoriser la position et l'échelle au début du déplacement
                    this.dragStartPosition = this.selectedObject.position.clone()
                    this.dragStartScale = this.selectedObject.scale.clone()
                }
                break
        }
    }

    handleMouseMove(event) {
        if (this.moveSelectedObject && this.selectedObject != null && this.dragStartPosition) {
            const rect = this.renderer.domElement.getBoundingClientRect()
            const mouse = new THREE.Vector2(
                ((event.clientX - rect.left) / rect.width) * 2 - 1,
                -((event.clientY - rect.top) / rect.height) * 2 + 1
            )
            const raycaster = new THREE.Raycaster();
            raycaster.setFromCamera(mouse, this.camera.camera);
            const intersects = raycaster.intersectObject(this.scene.ground, true);
            if (intersects.length > 0) {

                const hitPoint = intersects[0].point
                const offset = new THREE.Vector3(
                    hitPoint.x - this.dragStartPosition.x,
                    0, // Ne pas changer Y pour éviter de tomber dans le sol
                    hitPoint.z - this.dragStartPosition.z
                )

                // Appliquer l'offset à la position courante de départ
                this.selectedObject.position.copy(this.dragStartPosition)
                this.selectedObject.position.add(offset)

                // Mettre à jour les contrôles de position dans l'UI
                this.ui.positionControls.x = this.selectedObject.position.x
                this.ui.positionControls.y = this.selectedObject.position.y
                this.ui.positionControls.z = this.selectedObject.position.z
                this.ui.posXControl.updateDisplay()
                this.ui.posYControl.updateDisplay()
                this.ui.posZControl.updateDisplay()
                this.ui.updateSelectionUI(this.selectedObject)
            }
        }
    }

    initNPCs() {
        // Créer et ajouter des NPCs à la map
        const npc1 = new NPCController(
            this.scene.scene,
            '/models/character/Woman.glb',
            new THREE.Vector3(5, 0, 10),
            { scale: 0.4, rotation: 0 }
        )
        this.npcs.push(npc1)

        // Attendre que le NPC soit chargé puis configurer l'animation
        setTimeout(() => {
            if (npc1.isLoaded) {
                console.log('Animations disponibles:', npc1.getAnimationNames())
                npc1.playAnimation(1)
            }
        }, 500)

    }

    initCharacter() {
        const spawnPosition = new THREE.Vector3(0, 1, 5)
        this.character = new CharacterController(
            this.scene.scene,
            this.camera.camera,
            spawnPosition
        )

        // Passer les NPCs au personnage pour les collisions
        this.character.setNPCs(this.npcs)

        const vehiclePosition = new THREE.Vector3(10, 1.2, 5)
        this.vehicle = new VehicleController(this.scene.scene, vehiclePosition)
        this.character.setVehicle(this.vehicle)

        // Passer les NPCs au véhicule pour les collisions
        this.vehicle.setNPCs(this.npcs)

        this.camera.controls.enabled = false
        this.globalParams.useWASD = true

        if (this.ui && this.ui.gui) {
            this.ui.gui.domElement.style.display = 'none'
        }
    }

    async handleLoadModel(folder, modelName) {
        try {
            await this.scene.addModelToScene(folder, modelName)
            console.log(`Model ${modelName} loaded successfully`)
        } catch (error) {
            console.error(`Error loading model ${modelName}:`, error)
            alert(`Failed to load model: ${modelName}`)
        }
    }

    handleTransformChange(transformType) {
        if (!this.selectedObject) return

        if (transformType === 'position') {
            this.selectedObject.position.set(
                this.ui.positionControls.x,
                this.ui.positionControls.y,
                this.ui.positionControls.z
            )
        } else if (transformType === 'rotation') {
            this.selectedObject.rotation.set(
                THREE.MathUtils.degToRad(this.ui.rotationControls.x),
                THREE.MathUtils.degToRad(this.ui.rotationControls.y),
                THREE.MathUtils.degToRad(this.ui.rotationControls.z)
            )
        } else if (transformType === 'scale') {
            this.selectedObject.scale.set(
                this.ui.scaleControls.uniform,
                this.ui.scaleControls.uniform,
                this.ui.scaleControls.uniform
            )
        }

        this.ui.updateSelectionUI(this.selectedObject)
    }

    handleDeleteObject() {
        if (!this.selectedObject) return

        if (this.selectedMesh && this.selectedMeshMaterial) {
            this.selectedMesh.material = this.selectedMeshMaterial
        }

        this.scene.removeObjectFromScene(this.selectedObject)

        // Réinitialiser les références
        this.selectedObject = null
        this.selectedMesh = null
        this.selectedMeshMaterial = null

        this.ui.hideSelectionUI()
    }


    initParams() {
        this.tpModels = [
            'birch1.glb', 'bush1.glb', 'bush2.glb', 'flowers1.glb',
            'grass1.glb', 'log1.glb', 'oak1.glb', 'oak2.glb', 'oak3.glb',
            'pine1.glb', 'spruce1.glb', 'stone1.glb', 'stone2.glb', 'stump1.glb'
        ]

        // Réorganiser les cityModels par catégorie
        this.cityModelCategories = {
            'batiment': [
                'Big Building.glb', 'Brown Building.glb', 'Building Green.glb', 'Building Red Corner.glb',
                'Building Red.glb', 'Greenhouse.glb', 'Pizza Corner.glb', 'RB Blank.glb', 'Roof Exit.glb'
            ],
            'props': [
                'Air conditioner.glb', 'ATM.glb', 'Bench.glb', 'Billboard.glb', 'Box.glb',
                'Bus stop sign.glb', 'Bus Stop.glb', 'Cone.glb', 'Dumpster.glb', 'Fence End.glb',
                'Fence Piece.glb', 'Fence.glb', 'Fire Exit.glb', 'Fire hydrant.glb', 'Floor Hole.glb',
                'Flower Pot.glb', 'Mailbox.glb', 'Planter & Bushes.glb', 'Stop sign.glb', 'Traffic Light.glb',
                'Trash Can.glb', 'Tree.glb'
            ],
            'vehicules': [
                'Bicycle.glb', 'Bus.glb', 'Car.glb', 'Motorcycle.glb', 'Pickup Truck.glb', 'Police Car.glb',
                'Sports Car.glb', 'SUV.glb', 'Van.glb'
            ]
        }

        // Créer un tableau plat pour compatibilité avec l'UI existante
        this.cityModels = [
            ...this.cityModelCategories.batiment.map(m => `batiment/${m}`),
            ...this.cityModelCategories.props.map(m => `City_Pprops/${m}`),
            ...this.cityModelCategories.vehicules.map(m => `vehicules/${m}`)
        ]
        
        this.groundTextures = [
            'aerial_grass_rock',
            'brown_mud_leaves_01',
            'forrest_ground_01',
            'gravelly_sand',
            'forest_floor'
        ]
        this.groundParams = {
            texture: this.groundTextures[0],
            repeats: 750,
            useTexture: false,  // true = texture, false = couleur unie
            color: '#6b7b18'  
        }
        this.skyboxFiles = [
            'DaySkyHDRI019A_2K-TONEMAPPED.jpg',
            'DaySkyHDRI050A_2K-TONEMAPPED.jpg',
            'NightSkyHDRI009_2K-TONEMAPPED.jpg',
            'sky_23_2k.jpg',
        ]
        this.skyboxParams = {
            file: this.skyboxFiles[3]
        }
        this.globalParams = {
            useWASD: false
        }
    }

    render() {
        const deltaTime = this.clock.getDelta()
        if (this.character) {
            this.character.update(deltaTime)
        }
        if (this.vehicle) {
            this.vehicle.update(deltaTime)
        }
        // Mettre à jour les animations des NPCs
        for (const npc of this.npcs) {
            npc.update(deltaTime)
        }
        this.camera.process(this.globalParams)
        this.sunHelper.update()
        this.renderer.render(this.scene.scene, this.camera.camera)
    }

    dispose() {
        this.renderer.setAnimationLoop(null)
        this.renderer.dispose()

        if (this.character) {
            this.character.dispose()
        }

        if (this.vehicle) {
            this.vehicle.dispose()
        }

        // Nettoyer les NPCs
        for (const npc of this.npcs) {
            npc.dispose()
        }
        this.npcs = []

        if (this.camera) {
            this.camera.dispose()
        }

        if (this.ui && this.ui.gui) {
            this.ui.gui.destroy()
        }

        if (this.renderer.domElement) {
            this.renderer.domElement.removeEventListener('click', this.handleClick)
        }
        window.removeEventListener('keydown', this.handleKeyDown)
        document.removeEventListener('mousemove', this.handleMouseMove)

        if (this.renderer.domElement && this.renderer.domElement.parentNode) {
            this.renderer.domElement.parentNode.removeChild(this.renderer.domElement)
        }

        if (this.importInput && this.importInput.parentNode) {
            this.importInput.parentNode.removeChild(this.importInput)
        }
    }

}
