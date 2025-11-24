import * as THREE from 'three/webgpu'

/**
 * Gestion de la vie et des dégâts du joueur
 */
export class PlayerHealth {
    constructor(maxHealth = 100) {
        this.health = maxHealth
        this.maxHealth = maxHealth
        this.isDead = false
        this.damageCooldown = 0
        this.damageCooldownDuration = 1

        // Callbacks
        this.onHealthChange = null
        this.onDeath = null
    }

    takeDamage(amount, isInVehicle = false) {
        if (this.isDead || this.damageCooldown > 0 || isInVehicle) return false

        this.health -= amount
        this.damageCooldown = this.damageCooldownDuration
        console.log(`Degats recu Vie: ${this.health}/${this.maxHealth}`)

        if (this.onHealthChange) {
            this.onHealthChange(this.health, this.maxHealth)
        }

        if (this.health <= 0) {
            this.health = 0
            this.isDead = true
            console.log('Le joueur est mort')

            if (this.onHealthChange) {
                this.onHealthChange(this.health, this.maxHealth)
            }

            if (this.onDeath) {
                this.onDeath()
            }

            return true // mort
        }

        return false
    }

    heal(amount) {
        if (this.isDead) return

        this.health = Math.min(this.health + amount, this.maxHealth)

        if (this.onHealthChange) {
            this.onHealthChange(this.health, this.maxHealth)
        }
    }

    update(deltaTime) {
        if (this.damageCooldown > 0) {
            this.damageCooldown -= deltaTime
        }
    }

    getHealth() {
        return this.health
    }

    getHealthPercent() {
        return this.health / this.maxHealth
    }

    reset() {
        this.health = this.maxHealth
        this.isDead = false
        this.damageCooldown = 0
    }
}
