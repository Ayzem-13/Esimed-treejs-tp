import * as THREE from 'three/webgpu'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'


export class NPCController {
    constructor(scene, npcPath, position = new THREE.Vector3(0, 0, 0), options = {}, collisionManager = null) {
        this.scene = scene
        this.npcPath = npcPath
        this.position = position.clone()
        this.body = null
        this.mesh = null
        this.isLoaded = false

        // Options
        this.scale = options.scale || 1
        this.rotation = options.rotation || 0
        this.meshYOffset = options.meshYOffset || 0

        // Animation
        this.mixer = null
        this.animations = []
        this.currentAction = null
        this.autoPlayAnimation = options.autoPlayAnimation ?? false

        // Collision
        this.collisionManager = collisionManager
        this.debugMesh = null
        this.width = options.width || 0.5
        this.height = options.height || 1.8
        this.length = options.length || 0.5

        this.loadNPCMesh()
    }

    loadNPCMesh() {
        const loader = new GLTFLoader()

        loader.load(
            this.npcPath,
            (gltf) => {
                // Créer le body (Group)
                this.body = new THREE.Group()
                this.body.position.copy(this.position)
                this.body.rotation.y = this.rotation
                this.scene.add(this.body)

                this.mesh = gltf.scene
                this.mesh.position.y = this.meshYOffset
                this.mesh.scale.set(this.scale, this.scale, this.scale)

                // Activer les ombres
                this.mesh.traverse((child) => {
                    if (child.isMesh) {
                        child.castShadow = true
                        child.receiveShadow = true
                    }
                })

                this.body.add(this.mesh)

                if (gltf.animations && gltf.animations.length > 0) {
                    this.animations = gltf.animations
                    this.mixer = new THREE.AnimationMixer(this.mesh)

                    if (this.autoPlayAnimation && this.animations.length > 0) {
                        this.playAnimation(0)
                    }

                    console.log(`NPC chargé avec ${this.animations.length} animation(s)`)
                }

                this.isLoaded = true
                console.log(`NPC chargé depuis: ${this.npcPath}`)
            },
            undefined,
            (error) => {
                console.error(`Erreur chargement NPC (${this.npcPath}):`, error)
            }
        )
    }

    /**
     * Jouer une animation par index
     * @param {number} animationIndex - Index de l'animation
     * @param {boolean} loop - Boucler l'animation (défaut: true)
     */
    playAnimation(animationIndex, loop = true) {
        if (!this.mixer || !this.animations[animationIndex]) return

        if (this.currentAction) {
            this.currentAction.stop()
        }

        this.currentAction = this.mixer.clipAction(this.animations[animationIndex])
        this.currentAction.loop = loop ? THREE.LoopRepeat : THREE.LoopOnce
        this.currentAction.play()
    }

    /**
     * Jouer une animation par son nom
     * @param {string} animationName - Nom de l'animation
     * @param {boolean} loop - Boucler l'animation
     */
    playAnimationByName(animationName, loop = true) {
        const clip = THREE.AnimationClip.findByName(this.animations, animationName)
        if (!clip) {
            console.warn(`Animation "${animationName}" non trouvée`)
            return
        }

        if (this.currentAction) {
            this.currentAction.stop()
        }

        this.currentAction = this.mixer.clipAction(clip)
        this.currentAction.loop = loop ? THREE.LoopRepeat : THREE.LoopOnce
        this.currentAction.play()
    }


    stopAnimation() {
        if (this.currentAction) {
            this.currentAction.stop()
            this.currentAction = null
        }
    }


    getAnimationNames() {
        return this.animations.map(anim => anim.name)
    }

    /**
     * Affiche la boîte de collision du NPC pour le debug (désactivé)
     */
    debugDrawBox() {
        // Debug désactivé
    }

    /**
     * Nettoie le mesh de debug
     */
    clearDebugBox() {
        if (this.debugMesh) {
            this.scene.remove(this.debugMesh)
            this.debugMesh.geometry.dispose()
            this.debugMesh.material.dispose()
            this.debugMesh = null
        }
    }

    update(deltaTime = 1 / 60) {
        if (this.mixer) {
            this.mixer.update(deltaTime)
        }

        // Synchroniser la position avec le body pour les collisions
        if (this.body) {
            this.position.copy(this.body.position)
        }

        // Nettoyer les debug meshes
        this.clearDebugBox()
    }


    setPosition(x, y, z) {
        if (this.body) {
            this.body.position.set(x, y, z)
        }
        this.position.set(x, y, z)
    }


    setRotation(y) {
        if (this.body) {
            this.body.rotation.y = y
        }
        this.rotation = y
    }


    getPosition() {
        return this.body ? this.body.position.clone() : this.position.clone()
    }


    dispose() {
        if (this.body && this.body.parent) {
            this.body.parent.remove(this.body)
        }
        if (this.mixer) {
            this.mixer.stopAllAction()
        }
    }
}