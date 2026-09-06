// Gaming PC lighting and room

import * as THREE from 'three'

function emit(r, g, b, gain) {
  const c = new THREE.Color()
  c.setRGB(r * gain, g * gain, b * gain, THREE.LinearSRGBColorSpace)
  return new THREE.MeshBasicMaterial({ color: c, side: THREE.DoubleSide })
}

function buildRoom() {
  const room = new THREE.Scene()
  const geometries = []
  const materials = []
  const keep = (g, m) => {
    geometries.push(g)
    materials.push(m)
    return new THREE.Mesh(g, m)
  }

  const shellGeo = new THREE.BoxGeometry(22, 15, 22)
  const shellMat = new THREE.MeshBasicMaterial({
    color: new THREE.Color().setRGB(0.72, 0.71, 0.69, THREE.LinearSRGBColorSpace),
    side: THREE.BackSide,
  })
  room.add(keep(shellGeo, shellMat))

  const panel = (w, h, mat, x, y, z, rx, ry) => {
    const mesh = keep(new THREE.PlaneGeometry(w, h), mat)
    mesh.position.set(x, y, z)
    mesh.rotation.set(rx, ry, 0)
    room.add(mesh)
  }

  panel(11, 11, emit(1, 0.97, 0.93, 4.2), -3.5, 7.2, 4.5, Math.PI / 2, 0)
  panel(8, 9, emit(0.86, 0.9, 1, 1.05), 9, 1.5, 1.5, 0, -Math.PI / 2)
  panel(7, 5, emit(0.58, 0.34, 0.88, 0.95), -8.5, -1.5, 2.5, 0, Math.PI / 2)
  panel(22, 22, emit(0.34, 0.33, 0.31, 1), 0, -7.4, 0, -Math.PI / 2, 0)
  panel(12, 10, emit(0.07, 0.07, 0.09, 1), 0, 1, -10.8, 0, 0)

  return {
    room,
    dispose() {
      geometries.forEach((g) => g.dispose())
      materials.forEach((m) => m.dispose())
    },
  }
}

export function createStudio({ scene, rig, renderer, tier }) {
  const built = buildRoom()
  const pmrem = new THREE.PMREMGenerator(renderer)
  const target = pmrem.fromScene(built.room, 0.03, 0.1, 120)
  built.dispose()
  pmrem.dispose()

  scene.environment = target.texture
  scene.environmentIntensity = 1.0

  scene.fog = new THREE.Fog(0xf5f4f2, 16, 34)

  const hemi = new THREE.HemisphereLight(0xf5f4f2, 0x241c2c, 0.5)
  scene.add(hemi)

  const key = new THREE.DirectionalLight(0xfff4e8, 2.4)
  key.position.set(6, 9.5, 8)
  key.target.position.set(0, 2.4, 0)
  key.castShadow = tier.shadows !== false
  key.shadow.camera.left = -6.2
  key.shadow.camera.right = 6.2
  key.shadow.camera.top = 5.4
  key.shadow.camera.bottom = -3.2
  key.shadow.camera.near = 4
  key.shadow.camera.far = 26
  key.shadow.mapSize.set(tier.shadowMap, tier.shadowMap)
  key.shadow.bias = -0.0006
  key.shadow.normalBias = 0.035
  key.shadow.radius = 4
  key.shadow.blurSamples = 10
  scene.add(key)
  scene.add(key.target)

  const fill = new THREE.DirectionalLight(0xdfe6ff, 0.72)
  fill.position.set(-7.5, 3.2, 5)
  scene.add(fill)

  const back = new THREE.DirectionalLight(0xffffff, 0.85)
  back.position.set(-3.5, 7, -9)
  scene.add(back)

  const glowLow = new THREE.PointLight(0x9a6ad0, 0, 7, 2)
  glowLow.position.set(-0.15, 2.35, 0.15)
  rig.add(glowLow)

  const glowHigh = new THREE.PointLight(0x7f52b8, 0, 6, 2)
  glowHigh.position.set(0.15, 4.25, -0.55)
  rig.add(glowHigh)

  const groundGeo = new THREE.PlaneGeometry(46, 46)
  const groundMat = new THREE.ShadowMaterial({ color: 0x2a2033, opacity: 0.26, fog: false })
  const ground = new THREE.Mesh(groundGeo, groundMat)
  ground.rotation.x = -Math.PI / 2
  ground.receiveShadow = tier.shadows !== false
  ground.visible = tier.shadows !== false
  ground.name = 'ground'
  scene.add(ground)

  return {
    key,
    fill,
    back,
    hemi,
    glowLow,
    glowHigh,
    ground,
    dispose() {
      scene.environment = null
      scene.fog = null
      target.dispose()
      groundGeo.dispose()
      groundMat.dispose()
      scene.remove(hemi, key, key.target, fill, back, ground)
      rig.remove(glowLow, glowHigh)
      glowLow.dispose()
      glowHigh.dispose()
    },
  }
}
