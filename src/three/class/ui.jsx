import GUI from 'lil-gui'
import * as THREE from 'three/webgpu'
import { ColorGUIHelper } from '../tools'

export class UI {

    constructor() {
        this.gui = new GUI({ title: 'Controls' })
    }

    addGlobalUI(params, onChange, onExport, onImport, onClear) {
        this.gui.add(params, 'useWASD').name('WASD Mode').onChange(onChange)
        this.gui.add({clear: onClear}, 'clear').name('Clear Scene')
        this.gui.add({import: onImport}, 'import').name('Load Scene')
        this.gui.add({export: onExport}, 'export').name('Export Scene')
    }

    addModelLoader(tpModels, cityModels, onLoadModel) {
        this.modelsFolder = this.gui.addFolder('Add Models')

        const tpFolder = this.modelsFolder.addFolder('Nature (tp)')
        const tpParams = { model: tpModels[0] }
        tpFolder.add(tpParams, 'model', tpModels).name('Select Model')
        tpFolder.add({ load: () => onLoadModel('tp', tpParams.model) }, 'load').name('Add to Scene')

        const cityFolder = this.modelsFolder.addFolder('City Pack')
        const cityParams = { model: cityModels[0] }
        cityFolder.add(cityParams, 'model', cityModels).name('Select Model')
        cityFolder.add({ load: () => onLoadModel('City_Pack', cityParams.model) }, 'load').name('Add to Scene')
    }

    addSelectionUI(onTransformChange, onDelete) {
        this.infoFolder = this.gui.addFolder('Selected')
        this.infoMessages = {
            name: '--' ,
            position: '--',
            rotation: '--',
            scale: '--',
        }
        this.infoName = this.infoFolder.add(this.infoMessages, 'name')
        this.infoPos = this.infoFolder.add(this.infoMessages, 'position').name('position')
        this.infoRot = this.infoFolder.add(this.infoMessages, 'rotation').name('rotation')
        this.infoScale = this.infoFolder.add(this.infoMessages, 'scale').name('scale')

        // Bouton supprimer
        this.infoFolder.add({ delete: onDelete }, 'delete').name('Delete Object')

        // Position controls
        this.positionFolder = this.infoFolder.addFolder('Position')
        this.positionControls = { x: 0, y: 0, z: 0 }
        this.posXControl = this.positionFolder.add(this.positionControls, 'x', -100, 100, 0.1).onChange(() => onTransformChange('position'))
        this.posYControl = this.positionFolder.add(this.positionControls, 'y', -100, 100, 0.1).onChange(() => onTransformChange('position'))
        this.posZControl = this.positionFolder.add(this.positionControls, 'z', -100, 100, 0.1).onChange(() => onTransformChange('position'))

        // Rotation controls (en degrés)
        this.rotationFolder = this.infoFolder.addFolder('Rotation')
        this.rotationControls = { x: 0, y: 0, z: 0 }
        this.rotXControl = this.rotationFolder.add(this.rotationControls, 'x', -180, 180, 1).onChange(() => onTransformChange('rotation'))
        this.rotYControl = this.rotationFolder.add(this.rotationControls, 'y', -180, 180, 1).onChange(() => onTransformChange('rotation'))
        this.rotZControl = this.rotationFolder.add(this.rotationControls, 'z', -180, 180, 1).onChange(() => onTransformChange('rotation'))

        // Scale controls
        this.scaleControls = { uniform: 1 }
        this.infoFolder.add(this.scaleControls, 'uniform', 0.01, 20, 0.01).name('Scale').onChange(() => onTransformChange('scale'))

        this.hideSelectionUI()
    }

    updateSelectionUI(selectedObject) {
        this.infoMessages.name = selectedObject.name
        this.infoMessages.position = `${selectedObject.position.x.toFixed(2)}, ${selectedObject.position.y.toFixed(2)}, ${selectedObject.position.z.toFixed(2)}`
        this.infoMessages.rotation = `${selectedObject.rotation.x.toFixed(2)}, ${selectedObject.rotation.y.toFixed(2)}, ${selectedObject.rotation.z.toFixed(2)}`
        this.infoMessages.scale = selectedObject.scale ? selectedObject.scale.x.toFixed(2) : '--'
        this.infoName.updateDisplay()
        this.infoPos.updateDisplay()
        this.infoRot.updateDisplay()
        this.infoScale.updateDisplay()

        // Update controls
        this.positionControls.x = selectedObject.position.x
        this.positionControls.y = selectedObject.position.y
        this.positionControls.z = selectedObject.position.z
        this.posXControl.updateDisplay()
        this.posYControl.updateDisplay()
        this.posZControl.updateDisplay()

        // Update rotation (convert from radians to degrees)
        this.rotationControls.x = THREE.MathUtils.radToDeg(selectedObject.rotation.x)
        this.rotationControls.y = THREE.MathUtils.radToDeg(selectedObject.rotation.y)
        this.rotationControls.z = THREE.MathUtils.radToDeg(selectedObject.rotation.z)
        this.rotXControl.updateDisplay()
        this.rotYControl.updateDisplay()
        this.rotZControl.updateDisplay()

        // Update scale
        this.scaleControls.uniform = selectedObject.scale ? selectedObject.scale.x : 1

        this.infoFolder.show()
    }

    hideSelectionUI() {
        this.infoFolder.hide()
    }

    addSkyboxUI(files, params, onChange) {
        const folder = this.gui.addFolder('Sky')
        folder.add(params, 'file', files).name('skybox').onChange(onChange)
    }

    addGroundUI(textures, params, onChange) {
        const folder = this.gui.addFolder('Ground')
        folder.add(params, 'texture', textures).name('texture').onChange(() => { onChange(params.texture, params.repeats);})
        folder.add(params, 'repeats', 1, 1000).name('repeats').onChange(() => { onChange(params.texture, params.repeats);})
    }
    
    addSunUI(sun) {
        const folder = this.gui.addFolder('Sun')
        folder.addColor(new ColorGUIHelper(sun, 'color'), 'value').name('color')
        folder.add(sun, 'intensity', 0, 10)
        folder.add(sun.position, 'x', -100, 100)
        folder.add(sun.position, 'z', -100, 100)
    }

    destroy() {
        if (this.gui) {
            this.gui.destroy()
            this.gui = null
        }
    }
}
