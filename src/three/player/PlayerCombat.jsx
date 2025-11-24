import * as THREE from 'three/webgpu'

/**
 * Gestion du combat (tir et balles) du joueur
 */
export class PlayerCombat {
    constructor(scene) {
        this.scene = scene

        this.shootCooldown = 0
        this.shootRate = 0.3
        this.shootDamage = 50
        this.shootRange = 30
        this.bulletSpeed = 25

        this.bullets = []
        this.enemies = []

        // Score
        this.score = 0
        this.scorePerKill = 100

        // Callback
        this.onScoreChange = null
    }

    setEnemies(enemies) {
        this.enemies = enemies
    }

    addScore(points) {
        this.score += points
        console.log(`+${points} points! Score total: ${this.score}`)
        if (this.onScoreChange) {
            this.onScoreChange(this.score)
        }
    }

    getScore() {
        return this.score
    }

    shoot(playerPosition, playerRotation) {
        if (this.shootCooldown > 0) return

        this.shootCooldown = this.shootRate

        let closestEnemy = null
        let closestDistance = this.shootRange

        for (const enemy of this.enemies) {
            if (!enemy.isLoaded || enemy.isDead) continue

            const enemyPos = enemy.body.position
            const distance = playerPosition.distanceTo(enemyPos)

            if (distance < closestDistance) {
                const dirToEnemy = new THREE.Vector3().subVectors(enemyPos, playerPosition).normalize()
                const playerDir = new THREE.Vector3(
                    Math.sin(playerRotation),
                    0,
                    Math.cos(playerRotation)
                )

                const dot = dirToEnemy.dot(playerDir)
                if (dot > 0.5) {
                    closestDistance = distance
                    closestEnemy = enemy
                }
            }
        }

        if (closestEnemy) {
            this.createBullet(playerPosition, playerRotation, closestEnemy)
        }
    }

    createBullet(playerPosition, playerRotation, targetEnemy) {
        const bulletGeometry = new THREE.SphereGeometry(0.15, 8, 8)
        const bulletMaterial = new THREE.MeshStandardMaterial({
            color: 0xffff00,
            emissive: 0xffaa00,
            emissiveIntensity: 0.5
        })
        const bulletMesh = new THREE.Mesh(bulletGeometry, bulletMaterial)

        const startPos = playerPosition.clone()
        startPos.y += 0.8
        const forward = new THREE.Vector3(
            Math.sin(playerRotation),
            0,
            Math.cos(playerRotation)
        )
        startPos.add(forward.multiplyScalar(0.5))

        bulletMesh.position.copy(startPos)
        this.scene.add(bulletMesh)

        this.bullets.push({
            mesh: bulletMesh,
            target: targetEnemy,
            damage: this.shootDamage
        })
    }

    update(deltaTime) {
        // Cooldown tir
        if (this.shootCooldown > 0) {
            this.shootCooldown -= deltaTime
        }

        // Mise à jour des balles
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i]

            if (!bullet.target || bullet.target.isDead || !bullet.target.body) {
                this.removeBullet(i)
                continue
            }

            const targetPos = bullet.target.body.position.clone()
            targetPos.y += 0.9
            const direction = new THREE.Vector3().subVectors(targetPos, bullet.mesh.position).normalize()

            bullet.mesh.position.add(direction.multiplyScalar(this.bulletSpeed * deltaTime))

            const distanceToTarget = bullet.mesh.position.distanceTo(targetPos)
            if (distanceToTarget < 0.5) {
                const wasAlive = !bullet.target.isDead
                bullet.target.takeDamage(bullet.damage)
                const isDead = bullet.target.isDead

                if (wasAlive && isDead) {
                    this.addScore(this.scorePerKill)
                }

                this.removeBullet(i)
            }
        }
    }

    removeBullet(index) {
        const bullet = this.bullets[index]
        this.scene.remove(bullet.mesh)
        bullet.mesh.geometry.dispose()
        bullet.mesh.material.dispose()
        this.bullets.splice(index, 1)
    }

    dispose() {
        for (const bullet of this.bullets) {
            this.scene.remove(bullet.mesh)
            bullet.mesh.geometry.dispose()
            bullet.mesh.material.dispose()
        }
        this.bullets = []
    }
}
