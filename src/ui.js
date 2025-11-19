import GUI from 'lil-gui'
import { ColorGUIHelper } from './tools'

export class UI {
    constructor() {
        this.gui = new GUI({ title: 'Controls' })
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

}