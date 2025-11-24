import * as THREE from 'three/webgpu'

/**
 * Gestion des animations pour les ennemis (zombies)
 */
export class EnemyAnimation {
    constructor() {
        this.mixer = null
        this.animations = []
        this.currentAction = null
        this.currentAnimationIndex = null
    }

    setup(mesh, animations) {
        this.mixer = new THREE.AnimationMixer(mesh)
        this.animations = animations
    }

    playAnimation(animationIndex, loop = true) {
        if (!this.mixer || !this.animations[animationIndex]) return

        // Ne jouer l'animation que si elle a changé
        if (this.currentAnimationIndex === animationIndex) return

        if (this.currentAction) {
            this.currentAction.stop()
        }

        this.currentAnimationIndex = animationIndex
        this.currentAction = this.mixer.clipAction(this.animations[animationIndex])
        this.currentAction.loop = loop ? THREE.LoopRepeat : THREE.LoopOnce
        this.currentAction.play()
    }

    update(deltaTime) {
        if (this.mixer) {
            this.mixer.update(deltaTime)
        }
    }

    dispose() {
        if (this.mixer) {
            this.mixer.stopAllAction()
            this.mixer = null
        }
        this.animations = []
        this.currentAction = null
        this.currentAnimationIndex = null
    }
}
