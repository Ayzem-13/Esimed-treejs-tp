import GUI from 'lil-gui'

export class UI {
    constructor() {
        this.gui = new GUI()
    }

    addSkyboxUI(files, params, onChange) {
        const folder = this.gui.addFolder('Skybox')
        
        const fileOptions = {}
        files.forEach((file) => {
            fileOptions[file] = file
        })
        
        folder.add(params, 'file', fileOptions)
            .onChange(onChange)
    }
}