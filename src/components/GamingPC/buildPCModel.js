// Gaming PC procedural model

import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { SURFACES } from './pcContent'

const W = 2.35
const H = 5.0
const D = 4.8
const T = 0.06

const IN_X = W / 2 - T
const IN_Y = H - T
const IN_Z = D / 2 - T

const BOARD_X = 0.895

const _q = new THREE.Quaternion()
const _e = new THREE.Euler()
const _p = new THREE.Vector3()
const _one = new THREE.Vector3(1, 1, 1)

function at(x, y, z, rx = 0, ry = 0, rz = 0) {
  _e.set(rx, ry, rz)
  _q.setFromEuler(_e)
  _p.set(x, y, z)
  return new THREE.Matrix4().compose(_p, _q, _one)
}

function bin(material) {
  const queue = []
  return {
    material,
    add(geometry, matrix) {
      if (matrix) geometry.applyMatrix4(matrix)
      queue.push(geometry)
      return this
    },
    build(name, { cast = true, receive = true } = {}) {
      if (!queue.length) return null
      const merged = mergeGeometries(queue, false)
      queue.forEach((g) => g.dispose())
      queue.length = 0
      const mesh = new THREE.Mesh(merged, material)
      mesh.name = name
      mesh.castShadow = cast
      mesh.receiveShadow = receive
      return mesh
    },
  }
}

const PURPLE_EMISSIVE = 0x8353c4

function createMaterials(tier) {
  const Shell = tier.high ? THREE.MeshPhysicalMaterial : THREE.MeshStandardMaterial
  const shellExtras = tier.high ? { clearcoat: 0.45, clearcoatRoughness: 0.55 } : {}

  return {
    shell: new Shell({
      color: 0x0e0e12,
      roughness: 0.62,
      metalness: 0.28,
      envMapIntensity: 1.0,
      ...shellExtras,
    }),
    trim: new THREE.MeshStandardMaterial({
      color: 0x1c1d22,
      roughness: 0.34,
      metalness: 0.9,
      envMapIntensity: 1.15,
    }),
    liner: new THREE.MeshStandardMaterial({
      color: 0x08080b,
      roughness: 0.92,
      metalness: 0.05,
      envMapIntensity: 0.1,
      side: THREE.BackSide,
    }),
    pcb: new THREE.MeshStandardMaterial({
      color: 0x0c1014,
      roughness: 0.66,
      metalness: 0.12,
      envMapIntensity: 0.7,
    }),
    metal: new THREE.MeshStandardMaterial({
      color: 0x2f323a,
      roughness: 0.24,
      metalness: 0.98,
      envMapIntensity: 1.25,
    }),
    plastic: new THREE.MeshStandardMaterial({
      color: 0x141419,
      roughness: 0.78,
      metalness: 0.05,
      envMapIntensity: 0.55,
    }),
    steel: new THREE.MeshStandardMaterial({
      color: 0x43474f,
      roughness: 0.32,
      metalness: 1.0,
      envMapIntensity: 1.1,
    }),
    cable: new THREE.MeshStandardMaterial({
      color: 0x0b0b0e,
      roughness: 0.95,
      metalness: 0.0,
      envMapIntensity: 0.3,
    }),

    rgb: new THREE.MeshStandardMaterial({
      color: 0x0a0710,
      emissive: PURPLE_EMISSIVE,
      emissiveIntensity: 0,
      roughness: 0.5,
      metalness: 0,
      envMapIntensity: 0.2,
    }),
    vent: new THREE.MeshStandardMaterial({
      color: 0x06050a,
      emissive: PURPLE_EMISSIVE,
      emissiveIntensity: 0,
      roughness: 1,
      metalness: 0,
      envMapIntensity: 0,
    }),

    glass: new THREE.MeshPhysicalMaterial({
      color: 0x0a0a0e,
      roughness: 0.08,
      metalness: 0.1,
      transparent: true,
      opacity: 0.3,
      envMapIntensity: 1.7,
      side: THREE.DoubleSide,
    }),
    panelFrame: new THREE.MeshStandardMaterial({
      color: 0x1c1d22,
      roughness: 0.34,
      metalness: 0.9,
      envMapIntensity: 1.15,
      transparent: true,
      opacity: 1,
    }),
  }
}

function fanGeometry(size, blades = 9, quality = 1) {
  const bore = size * 0.82
  const frameW = (size - bore) / 2
  const depth = size * 0.21
  const hi = quality > 0

  const housing = []
  const bar = (w, h, x, y) =>
    housing.push(new THREE.BoxGeometry(w, h, depth).applyMatrix4(at(x, y, 0)))
  bar(size, frameW, 0, (size - frameW) / 2)
  bar(size, frameW, 0, -(size - frameW) / 2)
  bar(frameW, size - frameW * 2, (size - frameW) / 2, 0)
  bar(frameW, size - frameW * 2, -(size - frameW) / 2, 0)
  for (const sx of [-1, 1]) {
    for (const sy of [-1, 1]) {
      housing.push(
        new THREE.CylinderGeometry(
          size * 0.048,
          size * 0.048,
          depth * 1.06,
          hi ? 12 : 7,
        ).applyMatrix4(
          at((sx * (size - frameW * 1.6)) / 2, (sy * (size - frameW * 1.6)) / 2, 0, Math.PI / 2),
        ),
      )
    }
  }
  for (let i = 0; i < 4; i += 1) {
    const a = (i / 4) * Math.PI * 2 + Math.PI / 4
    housing.push(
      new THREE.BoxGeometry(size * 0.05, bore / 2, size * 0.05).applyMatrix4(
        at(
          Math.cos(a) * (bore / 4),
          Math.sin(a) * (bore / 4),
          -depth * 0.32,
          0,
          0,
          a - Math.PI / 2,
        ),
      ),
    )
  }

  const ring = new THREE.TorusGeometry(bore / 2 - size * 0.02, size * 0.022, 6, hi ? 40 : 20)
  ring.applyMatrix4(at(0, 0, depth * 0.42))

  const rotor = []
  rotor.push(
    new THREE.CylinderGeometry(size * 0.22, size * 0.23, depth * 0.62, hi ? 22 : 12).applyMatrix4(
      at(0, 0, 0, Math.PI / 2),
    ),
  )
  const bladeR = bore * 0.29
  for (let i = 0; i < blades; i += 1) {
    const a = (i / blades) * Math.PI * 2
    const blade = new THREE.BoxGeometry(bore * 0.38, bore * 0.27, size * 0.018)
    blade.applyMatrix4(at(0, 0, 0, 0, 0.62, 0))
    blade.applyMatrix4(at(Math.cos(a) * bladeR, Math.sin(a) * bladeR, 0, 0, 0, a))
    rotor.push(blade)
  }
  rotor.push(new THREE.TorusGeometry(bore * 0.46, size * 0.016, 5, hi ? 36 : 18))

  return {
    housing: mergeGeometries(housing, false),
    ring,
    rotor: mergeGeometries(rotor, false),
    depth,
  }
}

export function buildPCModel({ tier = { high: true, quality: 1 } } = {}) {
  const q = tier.quality ?? 1
  const hi = q > 0
  const materials = createMaterials(tier)
  const loose = []
  const track = (g) => {
    loose.push(g)
    return g
  }

  const root = new THREE.Group()
  root.name = 'pc'

  const shell = bin(materials.shell)
  const trim = bin(materials.trim)
  const pcb = bin(materials.pcb)
  const metal = bin(materials.metal)
  const plastic = bin(materials.plastic)
  const steel = bin(materials.steel)
  const cable = bin(materials.cable)
  const rgb = bin(materials.rgb)

  shell.add(new THREE.BoxGeometry(W, T, D), at(0, T / 2, 0))
  shell.add(new THREE.BoxGeometry(T, H - T * 2, D), at(W / 2 - T / 2, H / 2, 0))
  shell.add(new THREE.BoxGeometry(W, H - T * 2, T), at(0, H / 2, -D / 2 + T / 2))

  const topInset = 0.26
  shell.add(new THREE.BoxGeometry(W, T, topInset), at(0, H - T / 2, D / 2 - topInset / 2))
  shell.add(new THREE.BoxGeometry(W, T, topInset), at(0, H - T / 2, -D / 2 + topInset / 2))
  shell.add(new THREE.BoxGeometry(topInset, T, D), at(W / 2 - topInset / 2, H - T / 2, 0))
  shell.add(new THREE.BoxGeometry(topInset, T, D), at(-W / 2 + topInset / 2, H - T / 2, 0))

  const frontZ = D / 2 - T / 2
  const frontRail = 0.2
  shell.add(new THREE.BoxGeometry(W, frontRail, T), at(0, H - frontRail / 2, frontZ))
  shell.add(new THREE.BoxGeometry(W, frontRail, T), at(0, frontRail / 2, frontZ))
  shell.add(new THREE.BoxGeometry(frontRail, H, T), at(W / 2 - frontRail / 2, H / 2, frontZ))
  shell.add(new THREE.BoxGeometry(frontRail, H, T), at(-W / 2 + frontRail / 2, H / 2, frontZ))

  const slatPitch = 0.14
  const frontSlatW = W - frontRail * 2 + 0.06
  for (let y = frontRail + slatPitch * 0.6; y < H - frontRail; y += slatPitch) {
    shell.add(new THREE.BoxGeometry(frontSlatW, 0.1, T * 1.5), at(0, y, frontZ, -0.42))
  }
  const topSlatW = W - topInset * 2 + 0.06
  for (let z = -D / 2 + topInset + 0.09; z < D / 2 - topInset; z += slatPitch) {
    shell.add(new THREE.BoxGeometry(topSlatW, 0.1, T * 1.4), at(0, H - T / 2, z, -0.42))
  }
  for (let y = 2.72; y < 3.9; y += 0.12) {
    shell.add(new THREE.BoxGeometry(1.16, 0.07, T), at(0.25, y, -D / 2 + T / 2 - 0.006, -0.35))
  }

  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      shell.add(
        new THREE.BoxGeometry(0.34, 0.12, 0.5),
        at(sx * (W / 2 - 0.28), -0.06, sz * (D / 2 - 0.42)),
      )
    }
  }

  for (const sx of [-1, 1]) {
    trim.add(
      new THREE.BoxGeometry(0.05, H - 0.1, 0.07),
      at(sx * (W / 2 - 0.02), H / 2, D / 2 - 0.02),
    )
  }
  trim.add(new THREE.BoxGeometry(0.7, 0.05, 0.16), at(-0.55, H - T - 0.01, D / 2 - 0.34))
  steel.add(
    new THREE.CylinderGeometry(0.05, 0.05, 0.05, 14),
    at(-0.85, H - T + 0.012, D / 2 - 0.34),
  )
  for (let i = 0; i < 2; i += 1) {
    steel.add(
      new THREE.BoxGeometry(0.14, 0.04, 0.07),
      at(-0.55 + i * 0.2, H - T + 0.006, D / 2 - 0.34),
    )
  }

  const liner = new THREE.Mesh(
    track(new THREE.BoxGeometry(IN_X * 2, IN_Y - T, IN_Z * 2)),
    materials.liner,
  )
  liner.position.set(0, (IN_Y + T) / 2, 0)
  liner.receiveShadow = true
  liner.name = 'interior'
  root.add(liner)

  const BOARD_Y0 = 1.15
  const BOARD_Y1 = 4.2
  const BOARD_Z0 = -IN_Z + 0.32
  const boardCY = (BOARD_Y0 + BOARD_Y1) / 2
  const boardCZ = BOARD_Z0 + 1.22

  pcb.add(
    new THREE.BoxGeometry(0.05, BOARD_Y1 - BOARD_Y0, 2.44),
    at(BOARD_X + 0.025, boardCY, boardCZ),
  )

  metal.add(new THREE.BoxGeometry(0.17, 0.5, 1.0), at(0.79, 3.98, -1.3))
  metal.add(new THREE.BoxGeometry(0.17, 0.95, 0.32), at(0.79, 3.5, BOARD_Z0 + 0.2))
  metal.add(new THREE.BoxGeometry(0.15, 0.66, 0.72), at(0.8, 1.72, -0.7))
  metal.add(new THREE.BoxGeometry(0.11, 0.26, 1.5), at(0.82, 2.16, -0.62))
  metal.add(new THREE.BoxGeometry(0.11, 0.26, 1.5), at(0.82, 1.32, -0.62))
  for (let i = 0; i < 6; i += 1) {
    plastic.add(new THREE.BoxGeometry(0.19, 0.5, 0.03), at(0.79, 3.98, -1.72 + i * 0.17))
  }

  steel.add(new THREE.BoxGeometry(0.3, 0.46, 0.09), at(0.79, 3.98, BOARD_Z0 - 0.04))
  for (let i = 0; i < 5; i += 1) {
    steel.add(
      new THREE.BoxGeometry(0.14, 0.1, 0.06),
      at(0.74, 3.86 + (i % 3) * 0.14, BOARD_Z0 - 0.08),
    )
  }
  for (let i = 0; i < 7; i += 1) {
    steel.add(
      new THREE.BoxGeometry(0.05, 0.16, 0.36),
      at(BOARD_X + 0.03, 2.6 - i * 0.2, -D / 2 + 0.14),
    )
  }
  for (let i = 0; i < 4; i += 1) {
    plastic.add(new THREE.BoxGeometry(0.12, 0.07, 1.0), at(0.84, 2.56 - i * 0.4, -0.85))
  }
  plastic.add(new THREE.BoxGeometry(0.14, 0.1, 0.5), at(0.84, 2.98, 0.28))

  plastic.add(new THREE.BoxGeometry(1.5, 0.86, 1.6), at(0, 0.51, -1.4))
  metal.add(new THREE.BoxGeometry(1.44, 0.06, 0.06), at(0, 0.94, -0.62))
  shell.add(new THREE.BoxGeometry(IN_X * 2, T, 3.64), at(0, 0.98, -0.52))
  shell.add(new THREE.BoxGeometry(IN_X * 2, 0.92, T), at(0, 0.51, 1.27))
  trim.add(new THREE.BoxGeometry(IN_X * 2 - 0.1, 0.03, 0.03), at(0, 1.015, 1.285))
  rgb.add(new THREE.BoxGeometry(2.0, 0.025, 0.025), at(-0.05, 0.955, 1.262))

  const tube = (points, r) =>
    new THREE.TubeGeometry(
      new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p))),
      hi ? 26 : 14,
      r,
      hi ? 9 : 5,
      false,
    )
  cable.add(
    tube(
      [
        [0.62, 1.0, 0.6],
        [0.5, 1.9, 0.85],
        [0.66, 2.7, 0.62],
        [0.8, 2.96, 0.32],
      ],
      0.09,
    ),
  )
  cable.add(
    tube(
      [
        [0.62, 1.0, 0.3],
        [0.42, 1.7, 0.05],
        [0.3, 2.1, 0.28],
        [0.28, 2.28, 0.44],
      ],
      0.075,
    ),
  )
  cable.add(
    tube(
      [
        [0.68, 1.0, -0.1],
        [0.5, 2.4, -1.9],
        [0.62, 3.6, -2.0],
        [0.8, 4.1, -1.86],
      ],
      0.07,
    ),
  )
  cable.add(
    tube(
      [
        [0.55, 1.0, 0.72],
        [0.36, 1.42, 0.95],
        [0.55, 1.8, 0.8],
      ],
      0.05,
    ),
  )

  const fan120 = fanGeometry(1.2, 9, q)
  const rotors = []
  const placeFan = (x, y, z, rx, ry, spin) => {
    plastic.add(fan120.housing.clone(), at(x, y, z, rx, ry))
    rgb.add(fan120.ring.clone(), at(x, y, z, rx, ry))
    const rotor = new THREE.Mesh(fan120.rotor, materials.plastic)
    rotor.castShadow = true
    rotor.position.set(x, y, z)
    rotor.rotation.set(rx, ry, 0)
    rotors.push({ mesh: rotor, speed: spin })
    root.add(rotor)
  }

  for (let i = 0; i < 3; i += 1) placeFan(0, 1.3 + i * 1.25, 2.075, 0, 0, 1)
  for (let i = 0; i < 3; i += 1) placeFan(0.15, 4.545, -1.6 + i * 1.2, -Math.PI / 2, 0, -1)
  placeFan(0.25, 3.3, -D / 2 + 0.19, 0, Math.PI, -1)

  const ventGlow = new THREE.Mesh(track(new THREE.PlaneGeometry(1.9, 4.2)), materials.vent)
  ventGlow.position.set(0, 2.5, 1.9)
  ventGlow.name = 'ventGlow'
  root.add(ventGlow)

  const gpu = new THREE.Group()
  gpu.name = 'gpu'
  const gpuL = 3.04
  const gpuH = 1.37
  const gpuT = 0.61
  const gpuCX = BOARD_X - gpuH / 2
  const gpuCZ = BOARD_Z0 + gpuL / 2 - 0.02
  const gpuTop = 2.6
  const gpuBin = {
    pcb: bin(materials.pcb),
    metal: bin(materials.metal),
    plastic: bin(materials.plastic),
    rgb: bin(materials.rgb),
  }
  gpuBin.pcb.add(new THREE.BoxGeometry(gpuH, 0.03, gpuL), at(gpuCX, gpuTop - 0.03, gpuCZ))
  gpuBin.metal.add(
    new THREE.BoxGeometry(gpuH + 0.04, 0.02, gpuL + 0.04),
    at(gpuCX, gpuTop + 0.01, gpuCZ),
  )
  gpuBin.plastic.add(
    new THREE.BoxGeometry(gpuH, gpuT, 0.3),
    at(gpuCX, gpuTop - gpuT / 2, gpuCZ + gpuL / 2 - 0.15),
  )
  gpuBin.plastic.add(new THREE.BoxGeometry(gpuH, gpuT, 0.26), at(gpuCX, gpuTop - gpuT / 2, gpuCZ))
  gpuBin.plastic.add(
    new THREE.BoxGeometry(gpuH, gpuT, 0.3),
    at(gpuCX, gpuTop - gpuT / 2, gpuCZ - gpuL / 2 + 0.15),
  )
  for (const sx of [-1, 1]) {
    gpuBin.plastic.add(
      new THREE.BoxGeometry(0.06, gpuT, gpuL),
      at(gpuCX + (sx * (gpuH - 0.06)) / 2, gpuTop - gpuT / 2, gpuCZ),
    )
  }
  const gpuFan = fanGeometry(1.05, 11, q)
  for (const dz of [gpuL / 2 - 0.72, -gpuL / 2 + 0.72]) {
    for (let i = 0; i < 9; i += 1) {
      gpuBin.metal.add(
        new THREE.BoxGeometry(gpuH - 0.14, 0.2, 0.03),
        at(gpuCX, gpuTop - 0.17, gpuCZ + dz - 0.36 + i * 0.09),
      )
    }
    gpuBin.rgb.add(gpuFan.ring.clone(), at(gpuCX, gpuTop - gpuT + 0.02, gpuCZ + dz, Math.PI / 2))
    const rotor = new THREE.Mesh(gpuFan.rotor, materials.plastic)
    rotor.castShadow = true
    rotor.position.set(gpuCX, gpuTop - gpuT + 0.06, gpuCZ + dz)
    rotor.rotation.x = Math.PI / 2
    rotors.push({ mesh: rotor, speed: 1.35 })
    gpu.add(rotor)
  }
  gpuBin.plastic.add(
    new THREE.BoxGeometry(0.12, 0.13, 0.34),
    at(gpuCX + 0.2, gpuTop + 0.08, gpuCZ + gpuL / 2 - 0.55),
  )
  gpuBin.rgb.add(
    new THREE.BoxGeometry(0.03, 0.05, gpuL - 0.5),
    at(gpuCX - gpuH / 2 - 0.006, gpuTop - 0.18, gpuCZ),
  )
  for (const k of ['pcb', 'metal', 'plastic', 'rgb']) {
    const mesh = gpuBin[k].build(`gpu.${k}`, { cast: k !== 'rgb', receive: k !== 'rgb' })
    if (mesh) gpu.add(mesh)
  }
  root.add(gpu)

  const cpuBlock = new THREE.Group()
  cpuBlock.name = 'cpuBlock'
  const cpuZ = -1.15
  const cpuY = 3.45
  const cpuBin = {
    metal: bin(materials.metal),
    plastic: bin(materials.plastic),
    rgb: bin(materials.rgb),
  }
  cpuBin.metal.add(new THREE.BoxGeometry(0.1, 0.8, 0.8), at(BOARD_X - 0.05, cpuY, cpuZ))
  cpuBin.plastic.add(
    new THREE.CylinderGeometry(0.36, 0.38, 0.3, hi ? 30 : 16),
    at(0.7, cpuY, cpuZ, 0, 0, Math.PI / 2),
  )
  cpuBin.rgb.add(
    new THREE.CylinderGeometry(0.3, 0.3, 0.035, hi ? 30 : 16),
    at(0.53, cpuY, cpuZ, 0, 0, Math.PI / 2),
  )
  cpuBin.metal.add(
    new THREE.TorusGeometry(0.33, 0.03, 6, hi ? 32 : 16),
    at(0.55, cpuY, cpuZ, 0, Math.PI / 2),
  )
  for (const sz of [-1, 1]) {
    cpuBin.metal.add(
      new THREE.CylinderGeometry(0.075, 0.075, 0.22, 12),
      at(0.72, cpuY + 0.38, cpuZ + sz * 0.22),
    )
  }
  for (const k of ['metal', 'plastic', 'rgb']) {
    const mesh = cpuBin[k].build(`cpu.${k}`, { cast: k !== 'rgb', receive: k !== 'rgb' })
    if (mesh) cpuBlock.add(mesh)
  }
  root.add(cpuBlock)

  const ram = new THREE.Group()
  ram.name = 'ram'
  const ramBin = {
    pcb: bin(materials.pcb),
    metal: bin(materials.metal),
    plastic: bin(materials.plastic),
    rgb: bin(materials.rgb),
  }
  for (let i = 0; i < 4; i += 1) {
    const z = -0.36 + i * 0.09
    ramBin.plastic.add(new THREE.BoxGeometry(0.36, 0.09, 0.075), at(0.71, 2.72, z))
    ramBin.pcb.add(new THREE.BoxGeometry(0.31, 1.3, 0.045), at(0.735, 3.4, z))
    ramBin.metal.add(new THREE.BoxGeometry(0.3, 1.16, 0.07), at(0.74, 3.36, z))
    ramBin.rgb.add(new THREE.BoxGeometry(0.29, 0.05, 0.062), at(0.74, 4.0, z))
  }
  for (const k of ['pcb', 'metal', 'plastic', 'rgb']) {
    const mesh = ramBin[k].build(`ram.${k}`, { cast: k !== 'rgb', receive: k !== 'rgb' })
    if (mesh) ram.add(mesh)
  }
  root.add(ram)

  const radiator = new THREE.Group()
  radiator.name = 'radiator'
  const radBin = {
    metal: bin(materials.metal),
    plastic: bin(materials.plastic),
    cable: bin(materials.cable),
  }
  const radZ0 = -2.2
  const radLen = 3.97
  radBin.plastic.add(new THREE.BoxGeometry(1.2, 0.27, radLen), at(0.15, 4.805, radZ0 + radLen / 2))
  for (const dz of [0.07, radLen - 0.07]) {
    radBin.metal.add(new THREE.BoxGeometry(1.22, 0.29, 0.16), at(0.15, 4.805, radZ0 + dz))
  }
  for (let i = 0; i < 24; i += 1) {
    radBin.metal.add(
      new THREE.BoxGeometry(0.04, 0.23, 0.055),
      at(-0.47, 4.805, radZ0 + 0.3 + i * 0.14),
    )
  }
  radBin.cable.add(
    tube(
      [
        [0.6, 3.85, -1.05],
        [0.35, 4.2, -0.2],
        [0.2, 4.55, 0.6],
        [0.15, 4.68, 1.2],
      ],
      0.085,
    ),
  )
  radBin.cable.add(
    tube(
      [
        [0.66, 3.85, -1.32],
        [0.45, 4.15, -0.5],
        [0.3, 4.5, 0.4],
        [0.24, 4.68, 1.05],
      ],
      0.085,
    ),
  )
  for (const k of ['metal', 'plastic', 'cable']) {
    const mesh = radBin[k].build(`rad.${k}`)
    if (mesh) radiator.add(mesh)
  }
  root.add(radiator)

  const sidePanel = new THREE.Group()
  sidePanel.name = 'sidePanel'
  const px = -W / 2 + 0.02
  const hingeZ = -(D / 2 - 0.06)

  sidePanel.position.set(px, 0, hingeZ)
  sidePanel.userData.hinge = [px, 0, hingeZ]

  const glass = new THREE.Mesh(track(new THREE.PlaneGeometry(D - 0.24, H - 0.24)), materials.glass)
  glass.rotation.y = -Math.PI / 2
  glass.position.set(0, H / 2, -hingeZ)
  sidePanel.add(glass)
  const frameBin = bin(materials.panelFrame)
  frameBin.add(new THREE.BoxGeometry(0.05, 0.12, D), at(0, H - 0.06, -hingeZ))
  frameBin.add(new THREE.BoxGeometry(0.05, 0.12, D), at(0, 0.06, -hingeZ))
  frameBin.add(new THREE.BoxGeometry(0.05, H, 0.12), at(0, H / 2, D / 2 - 0.06 - hingeZ))
  frameBin.add(new THREE.BoxGeometry(0.05, H, 0.12), at(0, H / 2, 0))
  const frame = frameBin.build('sidePanel.frame', { receive: false })
  sidePanel.add(frame)
  root.add(sidePanel)

  const chassis = shell.build('chassis')
  const built = [
    chassis,
    trim.build('trim'),
    pcb.build('boards'),
    metal.build('heatsinks'),
    plastic.build('plastics'),
    steel.build('steel'),
    cable.build('cables'),
    rgb.build('rgb', { cast: false, receive: false }),
  ]
  for (const mesh of built) if (mesh) root.add(mesh)

  const surfaces = {}
  for (const [name, spec] of Object.entries(SURFACES)) {
    const o = new THREE.Object3D()
    o.name = `surface:${name}`
    o.position.set(...spec.origin)
    o.rotation.set(...spec.rotation)
    o.userData.size = spec.size
    o.userData.unit = spec.unit
    root.add(o)
    surfaces[name] = o
  }

  const poolTexture = makeContactTexture()
  const pool = new THREE.Mesh(
    track(new THREE.PlaneGeometry(W * 1.85, D * 1.4)),
    new THREE.MeshBasicMaterial({
      map: poolTexture,
      transparent: true,
      opacity: 0.6,
      depthWrite: false,
      fog: false,
    }),
  )
  pool.rotation.x = -Math.PI / 2
  pool.position.y = 0.004
  pool.renderOrder = -1
  pool.name = 'contactPool'
  root.add(pool)

  const parts = {
    root,
    chassis,
    sidePanel,
    sidePanelGlass: glass,
    sidePanelFrame: frame,
    interior: liner,
    ventGlow,
    gpu,
    cpuBlock,
    ram,
    radiator,
    rotors,
    surfaces,
    materials,
  }

  const dispose = () => {
    root.traverse((o) => {
      if (o.isMesh) o.geometry?.dispose()
    })
    loose.forEach((g) => g.dispose())
    for (const set of [fan120, gpuFan]) {
      set.housing.dispose()
      set.ring.dispose()
      set.rotor.dispose()
    }
    poolTexture.dispose()
    pool.material.dispose()
    Object.values(materials).forEach((m) => m.dispose())
  }

  return { root, parts, materials, dispose }
}

function makeContactTexture(size = 256) {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  g.addColorStop(0, 'rgba(28,20,34,0.95)')
  g.addColorStop(0.3, 'rgba(28,20,34,0.6)')
  g.addColorStop(0.58, 'rgba(28,20,34,0.16)')
  g.addColorStop(0.82, 'rgba(28,20,34,0.03)')
  g.addColorStop(1, 'rgba(28,20,34,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, size, size)
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}
