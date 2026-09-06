// Gaming PC WebGL scene

import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import * as THREE from 'three'
import { buildPCModel } from './buildPCModel'
import { createStudio } from './pcStudio'
import { createCloth } from './pcCloth'
import { createShot, createFx } from './pcTimeline'

const FRAG_CAP = 3.0e6

function pixelRatioFor(w, h, maxDpr) {
  const device = Math.min(window.devicePixelRatio || 1, maxDpr)
  return Math.min(device, Math.sqrt(FRAG_CAP / Math.max(1, w * h)))
}

function detectTier() {
  const cores = navigator.hardwareConcurrency || 4
  const coarse = typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches
  const small = window.innerWidth < 900
  if (coarse || small || cores <= 4) {
    return { high: false, quality: 0, shadowMap: 512, maxDpr: 1.6, shadowStride: 2 }
  }
  if (cores <= 8) {
    return { high: false, quality: 1, shadowMap: 1024, maxDpr: 1.75, shadowStride: 2 }
  }
  return { high: true, quality: 1, shadowMap: 2048, maxDpr: 1.9, shadowStride: 1 }
}

function detectWebgl() {
  if (typeof document === 'undefined') return false
  try {
    const probe = document.createElement('canvas')
    const gl = probe.getContext('webgl2') || probe.getContext('webgl')
    gl?.getExtension('WEBGL_lose_context')?.loseContext()
    return !!gl
  } catch {
    return false
  }
}

const HAS_WEBGL = detectWebgl()

const WORLD_UP = new THREE.Vector3(0, 1, 0)

export default function PCScene({ apiRef, onReady, modelUrl }) {
  const layerRef = useRef(null)
  const [epoch, setEpoch] = useState(0)

  useEffect(() => {
    const layer = layerRef.current
    if (!layer || !HAS_WEBGL) {
      onReady?.('none')
      return undefined
    }

    const tier = detectTier()
    let disposed = false

    const canvas = document.createElement('canvas')
    canvas.setAttribute('aria-hidden', 'true')
    canvas.style.cssText = 'display:block;width:100%;height:100%'
    layer.appendChild(canvas)

    let renderer
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: tier.high,
        powerPreference: 'high-performance',
        stencil: false,
      })
    } catch {
      renderer = null
    }
    if (!renderer || !renderer.getContext()) {
      renderer?.dispose()
      canvas.remove()
      onReady?.('none')
      return undefined
    }

    renderer.setClearColor(0x000000, 0)
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.18
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = tier.high ? THREE.VSMShadowMap : THREE.PCFShadowMap
    renderer.shadowMap.autoUpdate = tier.shadowStride === 1

    const scene = new THREE.Scene()

    const breath = new THREE.Group()
    breath.name = 'breath'
    const rig = new THREE.Group()
    rig.name = 'rig'
    breath.add(rig)
    scene.add(breath)

    const camera = new THREE.PerspectiveCamera(32, 1, 0.6, 90)
    scene.add(camera)

    const studio = createStudio({ scene, rig, renderer, tier })

    const shot = createShot()
    const fx = createFx()

    const finePointer = typeof matchMedia === 'function' && matchMedia('(pointer: fine)').matches

    const cloth = finePointer ? createCloth({ renderer }) : null

    let model = null
    let ready = false

    const hitBox = new THREE.Box3()
    let hitReady = false
    const _raycaster = new THREE.Raycaster()
    const _ndc = new THREE.Vector2()
    const _localRay = new THREE.Ray()
    const _invModel = new THREE.Matrix4()

    const mount = (built) => {
      if (disposed) {
        built.dispose()
        return
      }
      model = built
      rig.add(model.root)
      ready = true

      hitBox.makeEmpty()
      model.root.updateWorldMatrix(true, true)
      _invModel.copy(model.root.matrixWorld).invert()
      const meshBox = new THREE.Box3()
      const relative = new THREE.Matrix4()
      model.root.traverse((o) => {
        if (!o.isMesh || o.name === 'contactPool') return
        o.geometry.computeBoundingBox()
        if (!o.geometry.boundingBox) return
        relative.multiplyMatrices(_invModel, o.matrixWorld)
        meshBox.copy(o.geometry.boundingBox).applyMatrix4(relative)
        hitBox.union(meshBox)
      })
      hitReady = !hitBox.isEmpty()

      apiRef.current = {
        mode: 'webgl',
        shot,
        fx,
        rig,
        parts: model.parts,
        studio,
        tier,
        setActive,
        setFrozen,
        nudge,
        renderOnce,
      }

      if (import.meta.env.DEV) {
        window.__pcScene = {
          shot,
          fx,
          scene,
          camera,
          renderer,
          parts: model.parts,
          draw: renderOnce,
          cloth,
          hitBox,
          step: (dt = 0.016) => draw(dt),
        }
      }

      measure()
      collectSurfaces()
      renderOnce()
      onReady?.('webgl')
    }

    let width = 1
    let height = 1

    function measure() {
      const rect = layer.getBoundingClientRect()
      width = Math.max(1, Math.round(rect.width))
      height = Math.max(1, Math.round(rect.height))
      renderer.setPixelRatio(pixelRatioFor(width, height, tier.maxDpr))
      renderer.setSize(width, height, false)
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      cloth?.resize(width, height)
    }

    const _target = new THREE.Vector3()
    const _pos = new THREE.Vector3()
    const _fwd = new THREE.Vector3()
    const _right = new THREE.Vector3()
    const _up = new THREE.Vector3()
    let pointerX = 0
    let pointerY = 0
    let dampedX = 0
    let dampedY = 0

    function applyShot() {
      _target.set(shot.targetX, shot.targetY, shot.targetZ)
      _pos.setFromSphericalCoords(shot.distance, shot.polar, shot.azimuth).add(_target)

      _fwd.subVectors(_target, _pos).normalize()
      _right.crossVectors(_fwd, WORLD_UP).normalize()
      _up.crossVectors(_right, _fwd).normalize()

      _pos.addScaledVector(_right, -shot.shiftX).addScaledVector(_up, -shot.shiftY)
      _target.addScaledVector(_right, -shot.shiftX).addScaledVector(_up, -shot.shiftY)

      _pos.addScaledVector(_right, dampedX * shot.parallax)
      _pos.addScaledVector(_up, dampedY * shot.parallax * 0.55)

      camera.position.copy(_pos)
      camera.lookAt(_target)
      if (camera.fov !== shot.fov) {
        camera.fov = shot.fov
        camera.updateProjectionMatrix()
      }
      if (scene.fog) {
        scene.fog.near = shot.fogNear
        scene.fog.far = shot.fogFar
      }
      studio.glowLow.intensity = fx.glowLow
      studio.glowHigh.intensity = fx.glowHigh
    }

    let surfaces = []
    function collectSurfaces() {
      const host = layer.parentElement
      if (!host) return
      surfaces = Array.from(host.querySelectorAll('[data-gp-surface]')).map((el) => ({
        el,
        name: el.getAttribute('data-gp-surface'),
      }))
    }

    const _screen = new THREE.Matrix4()
    const _flip = new THREE.Matrix4()
    const _m = new THREE.Matrix4()

    function placeSurfaces() {
      if (!surfaces.length || !model) return
      _screen.set(width / 2, 0, 0, width / 2, 0, -height / 2, 0, height / 2, 0, 0, 1, 0, 0, 0, 0, 1)

      for (const surface of surfaces) {
        const object = model.parts.surfaces?.[surface.name]
        if (!object) continue
        const unit = object.userData.unit
        const [sw, sh] = object.userData.size

        _flip.makeScale(unit, -unit, unit)
        _m.multiplyMatrices(object.matrixWorld, _flip)
        _m.premultiply(camera.matrixWorldInverse)
        _m.premultiply(camera.projectionMatrix)
        _m.premultiply(_screen)

        const e = _m.elements
        const w0 = e[15]
        const wx = e[3] * sw
        const wy = e[7] * sh
        const near = Math.min(w0, w0 + wx, w0 + wy, w0 + wx + wy)

        let facing = 0
        if (near >= 0.08) {
          const x0 = e[12] / w0
          const y0 = e[13] / w0
          const x1 = (e[0] * sw + e[12]) / (w0 + wx)
          const y1 = (e[1] * sw + e[13]) / (w0 + wx)
          const x2 = (e[4] * sh + e[12]) / (w0 + wy)
          const y2 = (e[5] * sh + e[13]) / (w0 + wy)
          facing = (x1 - x0) * (y2 - y0) - (y1 - y0) * (x2 - x0)
        }

        const shown = near >= 0.08 && facing > 0
        if (shown) surface.el.style.transform = `matrix3d(${e.join(',')})`

        if (surface.shown !== shown) {
          surface.shown = shown
          surface.el.style.visibility = shown ? 'visible' : 'hidden'
        }
      }
    }

    let active = false
    let clock = 0
    let frame = 0
    let activity = 0

    let clientX = null
    let clientY = null
    let clothOn = false

    function setClothCursor(on) {
      if (on === clothOn) return
      clothOn = on
      if (on) layer.setAttribute('data-cursor', 'cloth')
      else layer.removeAttribute('data-cursor')
      cloth?.setActive(on)
    }

    function aimCloth(dt) {
      let hit = false
      if (hitReady && !frozen && clientX !== null) {
        const rect = layer.getBoundingClientRect()
        const lx = clientX - rect.left
        const ly = clientY - rect.top
        if (lx >= 0 && ly >= 0 && lx <= rect.width && ly <= rect.height) {
          cloth.setPointer(lx, ly)
          _ndc.set((lx / rect.width) * 2 - 1, -((ly / rect.height) * 2 - 1))
          _raycaster.setFromCamera(_ndc, camera)
          _invModel.copy(model.root.matrixWorld).invert()
          _localRay.copy(_raycaster.ray).applyMatrix4(_invModel)
          hit = _localRay.intersectsBox(hitBox)
        }
      }
      setClothCursor(hit)
      cloth.update(dt)
    }

    function draw(dt) {
      const gain = shot.idle * (1 - activity * 0.68)
      breath.position.y = Math.sin(clock * 0.5) * 0.012 * gain
      breath.rotation.y = Math.sin(clock * 0.33) * 0.005 * gain
      breath.rotation.x = Math.sin(clock * 0.41 + 1.1) * 0.002 * gain

      const ease = 1 - Math.exp(-dt * 3.4)
      dampedX += (pointerX - dampedX) * ease
      dampedY += (pointerY - dampedY) * ease

      applyShot()

      if (fx.spin > 0.001 && model) {
        const step = fx.spin * dt
        for (const rotor of model.parts.rotors) rotor.mesh.rotation.z += step * rotor.speed
      }

      if (!renderer.shadowMap.autoUpdate) {
        frame += 1
        if (frame % tier.shadowStride === 0) renderer.shadowMap.needsUpdate = true
      }
      renderer.render(scene, camera)

      if (cloth) {
        aimCloth(dt)
        cloth.render()
      }

      placeSurfaces()
    }

    function renderOnce() {
      if (!ready || disposed || renderer.getContext().isContextLost()) return
      renderer.shadowMap.needsUpdate = true
      draw(0)
    }

    const tick = (_time, deltaMs) => {
      if (!active || !ready || renderer.getContext().isContextLost()) return
      const dt = Math.min(deltaMs, 50) / 1000
      clock += dt
      activity *= Math.exp(-dt * 3.2)
      draw(dt)
    }
    gsap.ticker.add(tick)

    let frozen = false
    function setActive(next) {
      const wanted = frozen ? false : next
      if (wanted === active) return
      active = wanted
      if (wanted) {
        measure()
        collectSurfaces()
        return
      }
      setClothCursor(false)
    }
    function setFrozen(next) {
      frozen = next
      if (!next) return
      active = false
      setClothCursor(false)
      measure()
      collectSurfaces()
      renderOnce()
    }
    function nudge() {
      activity = 1
    }

    const onPointerMove = (event) => {
      const rect = layer.getBoundingClientRect()
      pointerX = ((event.clientX - rect.left) / rect.width) * 2 - 1
      pointerY = ((event.clientY - rect.top) / rect.height) * 2 - 1
      clientX = event.clientX
      clientY = event.clientY
    }
    if (finePointer) window.addEventListener('pointermove', onPointerMove, { passive: true })

    const onPress = () => cloth?.setPress(true)
    const onRelease = () => cloth?.setPress(false)
    if (cloth) {
      window.addEventListener('pointerdown', onPress, { passive: true })
      window.addEventListener('pointerup', onRelease, { passive: true })
      window.addEventListener('pointercancel', onRelease, { passive: true })
      window.addEventListener('blur', onRelease)
    }

    const resizeObserver = new ResizeObserver(() => {
      measure()
      if (!active) renderOnce()
    })
    resizeObserver.observe(layer)

    const io = new IntersectionObserver(([entry]) => setActive(entry.isIntersecting), {
      rootMargin: '25% 0px 25% 0px',
    })
    io.observe(layer)

    const onLost = (event) => {
      event.preventDefault()
      document.documentElement.setAttribute('data-gp-lost', '')
      apiRef.current = null
      onReady?.('none')
    }
    const onRestored = () => {
      document.documentElement.removeAttribute('data-gp-lost')
      setEpoch((e) => e + 1)
    }
    canvas.addEventListener('webglcontextlost', onLost)
    canvas.addEventListener('webglcontextrestored', onRestored)

    if (modelUrl) {
      import('./loadPCModel')
        .then((m) => m.loadPCModel({ url: modelUrl, tier }))
        .then(mount)
        .catch(() => {
          if (!disposed) mount(buildPCModel({ tier }))
        })
    } else {
      mount(buildPCModel({ tier }))
    }

    return () => {
      disposed = true
      gsap.ticker.remove(tick)
      io.disconnect()
      resizeObserver.disconnect()
      if (finePointer) window.removeEventListener('pointermove', onPointerMove)
      if (cloth) {
        window.removeEventListener('pointerdown', onPress)
        window.removeEventListener('pointerup', onRelease)
        window.removeEventListener('pointercancel', onRelease)
        window.removeEventListener('blur', onRelease)
      }
      canvas.removeEventListener('webglcontextlost', onLost)
      canvas.removeEventListener('webglcontextrestored', onRestored)
      document.documentElement.removeAttribute('data-gp-lost')
      if (import.meta.env.DEV) delete window.__pcScene
      setClothCursor(false)
      cloth?.dispose()
      model?.dispose()
      studio.dispose()
      renderer.dispose()
      if (!renderer.getContext().isContextLost()) renderer.forceContextLoss()
      canvas.remove()
      apiRef.current = null
    }
  }, [apiRef, onReady, modelUrl, epoch])

  return <div ref={layerRef} data-gp="canvas" aria-hidden="true" />
}
