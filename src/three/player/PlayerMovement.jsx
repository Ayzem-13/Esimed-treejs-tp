import * as THREE from 'three/webgpu'

/**
 * Gestion du déplacement et de la physique du joueur
 */
export class PlayerMovement {
    constructor() {
        this.velocity = new THREE.Vector3(0, 0, 0)
        this.moveDirection = new THREE.Vector3(0, 0, 0)

        this.isGrounded = true
        this.gravity = 9.8
        this.moveSpeed = 5
        this.jumpForce = 6

        this.bodyRotation = 0
        this.rotationSpeed = 0.08

        this.lastMoveForward = 0
    }

    jump() {
        if (this.isGrounded) {
            this.velocity.y = this.jumpForce
            this.isGrounded = false
            return true
        }
        return false
    }

    update(deltaTime, moveForward, turnSpeed, checkCollision, bodyPosition) {
        // Rotation
        if (turnSpeed !== 0) {
            this.bodyRotation += turnSpeed * this.rotationSpeed
        }

        // Mouvement avant/arrière
        if (moveForward !== 0) {
            // Gestion du demi-tour
            if (moveForward < 0 && this.lastMoveForward >= 0) {
                this.bodyRotation += Math.PI
            }
            if (moveForward > 0 && this.lastMoveForward < 0) {
                this.bodyRotation += Math.PI
            }
            this.lastMoveForward = moveForward

            const moveDistance = this.moveSpeed
            this.velocity.x = Math.sin(this.bodyRotation) * moveDistance
            this.velocity.z = Math.cos(this.bodyRotation) * moveDistance
        } else {
            // Friction
            this.velocity.x *= 0.85
            this.velocity.z *= 0.85

            if (Math.abs(this.velocity.x) < 0.01) this.velocity.x = 0
            if (Math.abs(this.velocity.z) < 0.01) this.velocity.z = 0
        }

        // Gravité
        this.velocity.y -= this.gravity * deltaTime

        // Calcul nouvelle position
        const nextPosition = bodyPosition.clone()
        nextPosition.x += this.velocity.x * deltaTime
        nextPosition.z += this.velocity.z * deltaTime

        // Collision horizontale
        if (checkCollision(nextPosition)) {
            this.velocity.x = 0
            this.velocity.z = 0
        } else {
            bodyPosition.x = nextPosition.x
            bodyPosition.z = nextPosition.z
        }

        // Application gravité
        bodyPosition.y += this.velocity.y * deltaTime

        // Collision sol
        const characterHalfHeight = 0.9
        const groundLevel = 0

        if (bodyPosition.y - characterHalfHeight <= groundLevel) {
            bodyPosition.y = groundLevel + characterHalfHeight
            this.velocity.y = 0
            this.isGrounded = true
        } else {
            this.isGrounded = false
        }

        return {
            rotation: this.bodyRotation,
            isMoving: moveForward !== 0 || turnSpeed !== 0
        }
    }

    stopMovement() {
        this.velocity.x = 0
        this.velocity.z = 0
    }

    reset() {
        this.velocity.set(0, 0, 0)
        this.isGrounded = true
        this.bodyRotation = 0
        this.lastMoveForward = 0
    }
}
