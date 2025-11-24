import * as THREE from 'three/webgpu'

/**
 * Gestion des animations du joueur
 */
export class PlayerAnimation {
    constructor() {
        this.mixer = null
        this.animations = []
        this.currentAction = null
        this.idleAction = null
        this.walkAction = null
        this.deathAction = null

        // Index des animations dans le fichier GLB
        this.ANIM_DEATH = 0
        this.ANIM_IDLE = 8
        this.ANIM_WALK = 16
    }

    setup(mesh, animations) {
        if (!animations || animations.length === 0) return

        this.animations = animations
        this.mixer = new THREE.AnimationMixer(mesh)

        this.idleAction = this.mixer.clipAction(this.animations[this.ANIM_IDLE])
        this.walkAction = this.mixer.clipAction(this.animations[this.ANIM_WALK])

        this.idleAction.play()
        this.currentAction = this.idleAction
    }

    playAnimation(isMoving) {
        if (!this.mixer || !this.idleAction || !this.walkAction) return

        if (isMoving && this.currentAction !== this.walkAction) {
            this.idleAction.stop()
            this.walkAction.play()
            this.currentAction = this.walkAction
        } else if (!isMoving && this.currentAction !== this.idleAction) {
            this.walkAction.stop()
            this.idleAction.play()
            this.currentAction = this.idleAction
        }
    }

    playDeathAnimation() {
        if (!this.mixer || !this.animations[this.ANIM_DEATH]) return

        if (this.currentAction) {
            this.currentAction.stop()
        }

        this.deathAction = this.mixer.clipAction(this.animations[this.ANIM_DEATH])
        this.deathAction.setLoop(THREE.LoopOnce)
        this.deathAction.clampWhenFinished = true
        this.deathAction.play()
        this.currentAction = this.deathAction
    }

    update(deltaTime) {
        if (this.mixer) {
            this.mixer.update(deltaTime)
        }
    }

    dispose() {
        if (this.mixer) {
            this.mixer.stopAllAction()
        }
    }
}
