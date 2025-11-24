/**
 * Gestion des entrées clavier/souris pour le joueur
 */
export class PlayerInput {
    constructor() {
        this.keys = {
            Z: false,
            Q: false,
            S: false,
            D: false,
            ' ': false,
            F: false,
            E: false
        }

        this.onJump = null
        this.onShoot = null
        this.onInteract = null
        this.onVehicleToggle = null

        this.handleKeyDown = this.handleKeyDown.bind(this)
        this.handleKeyUp = this.handleKeyUp.bind(this)
        this.handleMouseDown = this.handleMouseDown.bind(this)

        this.setupEventListeners()
    }

    setupEventListeners() {
        window.addEventListener('keydown', this.handleKeyDown)
        window.addEventListener('keyup', this.handleKeyUp)
        window.addEventListener('mousedown', this.handleMouseDown)
    }

    handleKeyDown(event) {
        const key = event.key.toUpperCase()

        if (key in this.keys) {
            this.keys[key] = true
            event.preventDefault()
        }

        if (event.code === 'Space') {
            if (this.onJump) this.onJump()
            event.preventDefault()
        }

        if (key === 'F') {
            if (this.onVehicleToggle) this.onVehicleToggle()
        }

        if (key === 'E') {
            if (this.onInteract) this.onInteract()
        }
    }

    handleKeyUp(event) {
        const key = event.key.toUpperCase()
        if (key in this.keys) {
            this.keys[key] = false
            event.preventDefault()
        }
    }

    handleMouseDown(event) {
        if (event.button === 0) {
            if (this.onShoot) this.onShoot()
        }
    }

    getMovement() {
        let moveForward = 0
        let turnSpeed = 0

        if (this.keys.Z) moveForward = 1
        if (this.keys.S) moveForward = -1
        if (this.keys.D) turnSpeed = -1
        if (this.keys.Q) turnSpeed = 1

        return { moveForward, turnSpeed }
    }

    dispose() {
        window.removeEventListener('keydown', this.handleKeyDown)
        window.removeEventListener('keyup', this.handleKeyUp)
        window.removeEventListener('mousedown', this.handleMouseDown)
    }
}
