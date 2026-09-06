// Gaming PC GLTF loader

import * as THREE from 'three'
import { SURFACES } from './pcContent'

const TARGET_HEIGHT = 5.0

export async function loadPCModel({ url, tier, fit = true }) {
  const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js')
  const loader = new GLTFLoader()
  const gltf = await loader.loadAsync(url)
  const root = gltf.scene
  root.name = 'pc'

  if (fit) {
    const box = new THREE.Box3().setFromObject(root)
    const size = box.getSize(new THREE.Vector3())
    if (size.y > 0) {
      const s = TARGET_HEIGHT / size.y
      root.scale.setScalar(s)
      box.setFromObject(root)
      const centre = box.getCenter(new THREE.Vector3())
      root.position.x -= centre.x
      root.position.z -= centre.z
      root.position.y -= box.min.y
    }
  }

  const named = {}
  const surfaces = {}
  const rgbMaterials = new Set()
  const rotors = []

  root.traverse((node) => {
    if (node.name.startsWith('surface:')) {
      surfaces[node.name.slice(8)] = node
      return
    }
    if (node.name) named[node.name] = named[node.name] ?? node

    if (node.isMesh) {
      node.castShadow = true
      node.receiveShadow = true
      if (/^fan/i.test(node.name)) rotors.push({ mesh: node, speed: rotors.length % 2 ? -1 : 1 })
      if (/rgb|accent|glow/i.test(node.name)) {
        const list = Array.isArray(node.material) ? node.material : [node.material]
        list.forEach((m) => m && rgbMaterials.add(m))
      }
      if (!tier.high && node.material?.isMeshPhysicalMaterial) {
        node.material.clearcoat = 0
      }
    }
  })

  for (const [name, spec] of Object.entries(SURFACES)) {
    if (surfaces[name]) {
      surfaces[name].userData.size = surfaces[name].userData.size ?? spec.size
      surfaces[name].userData.unit = surfaces[name].userData.unit ?? spec.unit
      continue
    }
    const o = new THREE.Object3D()
    o.name = `surface:${name}`
    o.position.set(...spec.origin)
    o.rotation.set(...spec.rotation)
    o.userData.size = spec.size
    o.userData.unit = spec.unit
    root.add(o)
    surfaces[name] = o
  }

  const rgbProxy = {
    set emissiveIntensity(v) {
      rgbMaterials.forEach((m) => {
        m.emissiveIntensity = v
      })
    },
    get emissiveIntensity() {
      return rgbMaterials.values().next().value?.emissiveIntensity ?? 0
    },
  }

  const parts = {
    root,
    chassis: named.chassis ?? null,
    sidePanel: named.sidePanel ?? null,
    sidePanelGlass: named.sidePanelGlass ?? named.sidePanel ?? null,
    sidePanelFrame: named.sidePanelFrame ?? null,
    interior: named.interior ?? null,
    ventGlow: named.ventGlow ?? null,
    gpu: named.gpu ?? null,
    cpuBlock: named.cpuBlock ?? null,
    ram: named.ram ?? null,
    radiator: named.radiator ?? null,
    rotors,
    surfaces,
    materials: { rgb: rgbProxy, vent: named.ventGlow?.material ?? rgbProxy },
  }

  const dispose = () => {
    root.traverse((node) => {
      if (!node.isMesh) return
      node.geometry?.dispose()
      const list = Array.isArray(node.material) ? node.material : [node.material]
      list.forEach((m) => {
        if (!m) return
        Object.values(m).forEach((v) => v?.isTexture && v.dispose())
        m.dispose()
      })
    })
  }

  return { root, parts, materials: parts.materials, dispose }
}
