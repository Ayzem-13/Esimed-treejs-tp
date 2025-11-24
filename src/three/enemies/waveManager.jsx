import * as THREE from 'three/webgpu'
import { EnemyController } from './enemyController'

export class WaveManager {
    constructor(scene, character, collisionManager) {
        this.scene = scene
        this.character = character
        this.collisionManager = collisionManager
        this.vehicle = null
        this.enemies = []
        this.currentWave = 0
        this.waveInProgress = false
        this.timeSinceLastSpawn = 0
        this.spawnInterval = 1
        this.isPaused = false 

        // vague d'enemies (doublé)
        this.waveConfigs = [
            { count: 14 },
            { count: 20 },
            { count: 30 },
            { count: 40 },  // Vague 4+: 40 ennemis (bloqué)
        ]


        this.spawnRadius = 30
        this.spawnHeight = 0.5
    }

    startWave() {
        if (this.waveInProgress) return

        this.currentWave++
        this.waveInProgress = true
        this.timeSinceLastSpawn = 0

        // Déterminer le nombre d'ennemis pour cette vague
        const waveIndex = Math.min(this.currentWave - 1, this.waveConfigs.length - 1)
        this.enemiesToSpawn = this.waveConfigs[waveIndex].count
        this.enemiesSpawned = 0
        console.log(`% VAGUE ${this.currentWave} commence`)
    }

    update(deltaTime) {
        if (!this.waveInProgress || this.isPaused) return

        // Vérifier si la vague est terminée (tous les ennemis spawnés et morts)
        const aliveEnemies = this.enemies.filter(e => !e.isDead)
        if (this.enemiesSpawned >= this.enemiesToSpawn && aliveEnemies.length === 0) {
            this.waveInProgress = false
                console.log(`% VAGUE ${this.currentWave} termine`)
            return
        }

        // Spawn des ennemis progressivement
        if (this.enemiesSpawned < this.enemiesToSpawn) {
            this.timeSinceLastSpawn += deltaTime
            if (this.timeSinceLastSpawn >= this.spawnInterval) {
                this.spawnEnemy()
                this.timeSinceLastSpawn = 0
                this.enemiesSpawned++
            }
        }

        // Mettre à jour tous les ennemis vivants
        for (const enemy of this.enemies) {
            if (!enemy.isDead) {
                enemy.update(deltaTime)
            }
        }

        // Supprimer les ennemis morts 
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            if (this.enemies[i].isDead && !this.enemies[i].isLoaded) {
                this.enemies.splice(i, 1)
            }
        }
    }

    spawnEnemy() {
        // Position de spawn aléatoire autour du personnage
        const angle = Math.random() * Math.PI * 2
        const distance = this.spawnRadius * (0.8 + Math.random() * 0.4)

        const playerPos = this.character.body.position
        const spawnX = playerPos.x + Math.sin(angle) * distance
        const spawnZ = playerPos.z + Math.cos(angle) * distance
        const spawnPos = new THREE.Vector3(spawnX, this.spawnHeight, spawnZ)

        const zombie = new EnemyController(
            this.scene,
            spawnPos,
            { scale: 1, health: 75 },
            this.collisionManager
        )
        zombie.setTargetCharacter(this.character)
        if (this.vehicle) {
            zombie.setTargetVehicle(this.vehicle)
        }
        this.enemies.push(zombie)

        // console.log(`%c[Vague ${this.currentWave}] Zombie ${this.enemiesSpawned + 1}/${this.enemiesToSpawn}`, 'color: #00CCFF;')
    }

    getAliveEnemyCount() {
        return this.enemies.filter(e => !e.isDead).length
    }

    getAllEnemies() {
        return this.enemies
    }

    pauseWaves() {
        this.isPaused = true
        // Faire disparaître tous les ennemis en les tuant
        for (const enemy of this.enemies) {
            if (!enemy.isDead) {
                enemy.die()  
            }
        }
    }

    resumeWaves() {
        this.isPaused = false
    }

    setVehicle(vehicle) {
        this.vehicle = vehicle
        for (const enemy of this.enemies) {
            enemy.setTargetVehicle(vehicle)
        }
    }

    dispose() {
        for (const enemy of this.enemies) {
            enemy.dispose()
        }
        this.enemies = []
    }
}
