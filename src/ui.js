import GUI from 'lil-gui'
import { ColorGUIHelper } from './tools'

export class UI {
    constructor() {
        this.gui = new GUI({ title: 'Controls' })
        this.controlsFolder = this.gui.addFolder('Controls')
	}

    addSkyboxUI(files, params, onChange) {
        const folder = this.gui.addFolder('sky')
        
		folder.add(params, 'file', files).name('skybox')
			.onChange(onChange)
    }

    addGroundUI(textures, params, onChange) {
        const folder = this.gui.addFolder('Ground')
        folder.add(params, 'texture', textures).name('texture')
			.onChange(() => { onChange(params.texture, params.repeats);})
        folder.add(params, 'repeats', 1, 1000).name('repeats')
			.onChange(() => { onChange(params.texture, params.repeats);})
    }

    addSunUI(sun) {
        const folder = this.gui.addFolder('Sun')
        folder.addColor(new ColorGUIHelper(sun, 'color'), 'value').name('color')
        folder.add(sun, 'intensity', 0, 10)
        folder.add(sun.position, 'x', -100, 100)
        folder.add(sun.position, 'z', -100, 100)
    }

    addSelectionUI() {
        this.infoFolder = this.gui.addFolder('Selected')
        this.infoMessages = {
            name: '',
            position: '',
            rotation: '',
            scale: '',
        }
        this.infoName = this.infoFolder.add(this.infoMessages, 'name')
        this.infoPos = this.infoFolder.add(this.infoMessages, 'position').name('position')
        this.infoRot = this.infoFolder.add(this.infoMessages, 'rotation').name('rotation')
        this.infoScale = this.infoFolder.add(this.infoMessages, 'scale').name('scale')

        // Edit controls for rotation and scale
        this.editFolder = this.infoFolder.addFolder('Edit')
        this.editParams = {
            rotationY: 0,
            scale: 1,
        }
        this.editFolder.add(this.editParams, 'rotationY', 0, Math.PI * 2, 0.01).name('Rotation Y')
        this.editFolder.add(this.editParams, 'scale', 0.1, 5, 0.1).name('Scale')
        this.hideSelectionUI()
    }

    updateSelectionUI(selectedObject) {
        this.infoMessages.name = selectedObject.name
        this.infoMessages.position = `${selectedObject.position.x.toFixed(2)}, ${selectedObject.position.y.toFixed(2)}, ${selectedObject.position.z.toFixed(2)}`
        this.infoMessages.rotation = `${selectedObject.rotation.x.toFixed(2)}, ${selectedObject.rotation.y.toFixed(2)}, ${selectedObject.rotation.z.toFixed(2)}`
        this.infoMessages.scale = `${selectedObject.scale.x.toFixed(2)}, ${selectedObject.scale.y.toFixed(2)}, ${selectedObject.scale.z.toFixed(2)}`
        this.infoName.updateDisplay()
        this.infoPos.updateDisplay()
        this.infoRot.updateDisplay()
        this.infoScale.updateDisplay()

        // Update edit controls to match current object state
        this.editParams.rotationY = selectedObject.rotation.y
        this.editParams.scale = selectedObject.scale.x

        this.infoFolder.show()
    }

    hideSelectionUI() {
        this.infoFolder.hide()
    }

    addExportButton(exportCallback) {
        this.gui.add({ export: exportCallback }, 'export').name('Export Scene')
    }

    addClearButton(clearCallback) {
        this.gui.add({ clear: clearCallback }, 'clear').name('Clear Scene')
    }

    addImportButton(importCallback) {
        this.gui.add({ import: importCallback }, 'import').name('Import Scene')
    }

    addWASDUI(wasdParams, onChange) {
        this.controlsFolder.add(wasdParams, 'enabled').name('WASD Mode')
            .onChange(onChange)
    }

    setupEditCallbacks(onRotationYChange, onScaleChange) {

        const rotationYController = this.editFolder.controllers.find(c => c.property === 'rotationY')
        const scaleController = this.editFolder.controllers.find(c => c.property === 'scale')

        if (rotationYController) {
            rotationYController.onChange(onRotationYChange)
        }
        if (scaleController) {
            scaleController.onChange(onScaleChange)
        }
    }

    addEditSceneUI(onDelete, onAdd, modelNames) {
        const editSceneFolder = this.gui.addFolder('Scene Edit')
        editSceneFolder.add({ delete: onDelete }, 'delete').name('Delete Selected')

        const addParams = { model: modelNames[0] }
        editSceneFolder.add(addParams, 'model', modelNames).name('Add Model')
            .onChange((value) => onAdd(value))
    }

}