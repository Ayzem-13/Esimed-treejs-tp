import * as THREE from 'three/webgpu'

export class WheelController {
    constructor(vehiclePosition, wheelPosition, wheelRadius = 0.3) {
        this.vehiclePosition = vehiclePosition
        this.wheelPosition = wheelPosition 
        this.wheelRadius = wheelRadius
        this.rotation = 0

        const geometry = new THREE.CylinderGeometry(
            wheelRadius,
            wheelRadius,
            0.2,
            32
        )
        const material = new THREE.MeshStandardMaterial({
            color: 0x333333,
            metalness: 0.6,
            roughness: 0.4
        })
        this.mesh = new THREE.Mesh(geometry, material)
        this.mesh.rotation.z = Math.PI / 2
        this.mesh.castShadow = true
        this.mesh.receiveShadow = true

        this.updatePosition()
    }

    updatePosition() {
        this.mesh.position.copy(this.vehiclePosition).add(this.wheelPosition)
    }

    rotate(angle) {
        this.rotation += angle
        this.mesh.rotation.x = this.rotation
    }

    setPosition(vehiclePosition, vehicleRotation) {
        const rotatedOffset = this.wheelPosition.clone()
        rotatedOffset.applyAxisAngle(new THREE.Vector3(0, 1, 0), vehicleRotation)
        this.mesh.position.copy(vehiclePosition).add(rotatedOffset)
    }

    getMesh() {
        return this.mesh
    }

    dispose() {
        if (this.mesh.parent) {
            this.mesh.parent.remove(this.mesh)
        }
    }
}
