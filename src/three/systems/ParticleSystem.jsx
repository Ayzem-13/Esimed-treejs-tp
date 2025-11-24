import * as THREE from 'three/webgpu'

export class ParticleSystem {
    constructor(scene) {
        this.scene = scene
        this.particles = []
    }

    // Créer une particule de fumée
    emit(position) {
        const geometry = new THREE.SphereGeometry(0.15, 8, 8)
        const material = new THREE.MeshBasicMaterial({
            color: 0xaaaaaa,
            transparent: true,
            opacity: 0.8
        })

        const particle = new THREE.Mesh(geometry, material)
        particle.position.copy(position)
        this.scene.add(particle)

        this.particles.push({
            mesh: particle,
            life: 0,
            maxLife: 1.0,
            velocity: new THREE.Vector3(
                (Math.random() - 0.5) * 0.5,
                0.5 + Math.random() * 0.3,
                (Math.random() - 0.5) * 0.5
            )
        })
    }

    // Mettre à jour les particules
    update(deltaTime) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i]
            p.life += deltaTime

            // Supprimer si morte
            if (p.life >= p.maxLife) {
                this.scene.remove(p.mesh)
                this.particles.splice(i, 1)
                continue
            }

            // Déplacer
            p.mesh.position.x += p.velocity.x * deltaTime
            p.mesh.position.y += p.velocity.y * deltaTime
            p.mesh.position.z += p.velocity.z * deltaTime

            // Grossir
            const scale = 1 + (p.life / p.maxLife) * 2
            p.mesh.scale.set(scale, scale, scale)

            // Disparaître
            p.mesh.material.opacity = 0.8 * (1 - p.life / p.maxLife)
        }
    }

    dispose() {
        for (const p of this.particles) {
            this.scene.remove(p.mesh)
        }
        this.particles = []
    }
}
