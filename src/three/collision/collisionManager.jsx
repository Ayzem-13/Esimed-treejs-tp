import * as THREE from 'three/webgpu'
import { computeBoundsTree, disposeBoundsTree, acceleratedRaycast } from 'three-mesh-bvh'

THREE.Mesh.prototype.raycast = acceleratedRaycast
THREE.BufferGeometry.prototype.computeBoundsTree = computeBoundsTree
THREE.BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree

const DEBUG = false

export class CollisionManager {
    constructor(scene) {
        this.scene = scene
        this.debugVisuals = []
        this.characterDimensions = {
            halfSize: 0.15,
            height: 1.8,
            bottomMargin: 0.6
        }
    }


    setupBVH() {
        this.scene.traverse((object) => {
            if (object.isMesh && object.userData?.isSelectable && object.geometry) {
                try {
                    if (!object.geometry.boundsTree) {
                        object.geometry.computeBoundsTree()
                    }
                } catch (e) {
                    console.warn(`BVH failed for ${object.name}`, e)
                }
            }
        })
    }


    createCharacterBox(position) {
        const { halfSize, height, bottomMargin } = this.characterDimensions
        return new THREE.Box3(
            new THREE.Vector3(position.x - halfSize, position.y - height / 2 + bottomMargin, position.z - halfSize),
            new THREE.Vector3(position.x + halfSize, position.y + height / 2, position.z + halfSize)
        )
    }

    /**
     * Crée une boîte pour un objet avec dimensions
     */
    createObjectBox(object) {
        const halfWidth = object.width / 2
        const halfLength = object.length / 2

        return new THREE.Box3(
            new THREE.Vector3(
                object.position.x - halfWidth,
                object.position.y - object.height / 2,
                object.position.z - halfLength
            ),
            new THREE.Vector3(
                object.position.x + halfWidth,
                object.position.y + object.height / 2,
                object.position.z + halfLength
            )
        )
    }


    debugDrawBox(box, color = 0xff0000) {
        if (!DEBUG) return

        const size = new THREE.Vector3()
        box.getSize(size)
        const center = new THREE.Vector3()
        box.getCenter(center)

        const geometry = new THREE.BoxGeometry(size.x, size.y, size.z)
        const material = new THREE.MeshBasicMaterial({
            color,
            wireframe: true,
            transparent: true,
            opacity: 0.7
        })
        const mesh = new THREE.Mesh(geometry, material)
        mesh.position.copy(center)
        this.scene.add(mesh)
        this.debugVisuals.push(mesh)
    }


    clearDebug() {
        this.debugVisuals.forEach(mesh => {
            this.scene.remove(mesh)
            mesh.geometry.dispose()
            mesh.material.dispose()
        })
        this.debugVisuals = []
    }


    testCollisionWithMesh(testBox, mesh) {
        if (!mesh.isMesh || !mesh.userData?.isSelectable) return false

        // Ignorer les petits objets décoratifs
        const meshBox = new THREE.Box3().setFromObject(mesh)
        const size = new THREE.Vector3()
        meshBox.getSize(size)

        if (size.x < 0.5 && size.z < 0.5) {
            return false
        }

        // Pour les petites boîtes 
        if (size.x < 1.5 && size.z < 1.5) {
            const geometry = mesh.geometry
            if (geometry) {
                const geoBox = new THREE.Box3()

                if (!geometry.boundingBox) {
                    geometry.computeBoundingBox()
                }

                if (geometry.boundingBox) {
                    geoBox.copy(geometry.boundingBox)
                    geoBox.applyMatrix4(mesh.matrixWorld)

                    if (DEBUG) {
                        this.debugDrawBox(geoBox, 0xffa500)
                    }
                    return geoBox.intersectsBox(testBox)
                }
            }
        }

        if (mesh.geometry.boundsTree) {
            if (DEBUG) {
                this.debugDrawBox(meshBox, 0xffff00)
            }
            return meshBox.intersectsBox(testBox)
        }

        if (DEBUG) {
            this.debugDrawBox(meshBox, 0xffa500)
        }
        return meshBox.intersectsBox(testBox)
    }


    checkVehicleCollisionBox(vBox, npcs = [], vehicleBody = null) {
        if (DEBUG) {
            this.clearDebug()
        }

        if (!vBox) {
            return false
        }

        if (DEBUG) {
            this.debugDrawBox(vBox, 0x0000ff)
        }

        if (npcs && npcs.length > 0) {
            for (const npc of npcs) {
                if (!npc.body) continue
                npc.position.copy(npc.body.position)
                const nBox = this.createObjectBox(npc)
                if (DEBUG) {
                    this.debugDrawBox(nBox, 0x00ff00)
                }
                if (vBox.intersectsBox(nBox)) {
                    return true
                }
            }
        }

        let isColliding = false
        this.scene.traverse((object) => {
            if (isColliding) return
            if (vehicleBody && object === vehicleBody) return
            if (!object.isMesh || !object.userData?.isSelectable) return

            if (this.testCollisionWithMesh(vBox, object)) {
                isColliding = true
            }
        })

        return isColliding
    }


    checkCollision({
        newPos,
        vehicle = null,
        inVehicle = false,
        ignoreVehicleCollision = false,
        npcs = [],
        characterMesh = null,
        characterBody = null
    }) {
        if (DEBUG) {
            this.clearDebug()
        }

        const charBox = this.createCharacterBox(newPos)

        if (DEBUG) {
            this.debugDrawBox(charBox, 0xff00ff)
        }

        if (vehicle && !inVehicle && !ignoreVehicleCollision) {
            const vBox = vehicle.mesh ? new THREE.Box3().setFromObject(vehicle.mesh) : this.createObjectBox(vehicle)
            if (DEBUG) {
                this.debugDrawBox(vBox, 0x0000ff)
            }
            if (charBox.intersectsBox(vBox)) {
                return true
            }
        }

        if (npcs && npcs.length > 0) {
            for (const npc of npcs) {
                if (!npc.body) continue
                npc.position.copy(npc.body.position)
                const nBox = this.createObjectBox(npc)
                if (DEBUG) {
                    this.debugDrawBox(nBox, 0x00ff00)
                }
                if (charBox.intersectsBox(nBox)) {
                    return true
                }
            }
        }

        // Collision environnement 
        let isColliding = false
        this.scene.traverse((object) => {
            if (isColliding) return
            if (object === characterMesh || object === characterBody) return
            if (vehicle && object === vehicle.mesh) return
            if (!object.isMesh || !object.userData?.isSelectable) return

            if (this.testCollisionWithMesh(charBox, object)) {
                isColliding = true
            }
        })

        return isColliding
    }


    dispose() {
        this.clearDebug()
        this.scene.traverse((object) => {
            if (object.geometry && object.geometry.boundsTree) {
                object.geometry.disposeBoundsTree()
            }
        })
    }
}
