// Hero WebGL portal transition (lazy)

import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import * as THREE from 'three'
import { PORTAL_FRAG, PORTAL_VERT } from '../shaders/heroPortal'
import { DUST_FRAG, DUST_VERT } from '../shaders/heroDust'
import { planDust, sampleDust } from '../lib/heroDust'
import { isLowPerf } from '../lib/perf'
import { onViewportResize } from '../hooks/onViewportResize'

const FOCAL = {
  desktop: [0.49, 0.62],
  mobile: [0.43, 0.55],
}

const ROOM_FROM = [0.8902, 0.8706, 0.9882]
const ROOM_TO = [0.128, 0.086, 0.161]

const LOCK_ZOOM = 2.4
const DUST_SPAN = 0.55
const DUST_ZOOM = LOCK_ZOOM * 1.25

const LOW = isLowPerf()

const MAX_DPR = LOW ? 1.4 : 1.75
const FRAG_CAP = LOW ? 1.9e6 : 3.2e6

const SLOW_FRAME_MS = 26
const SAMPLE_WINDOW = 45
const SLOW_BUDGET = 20
const WARMUP_FRAMES = 20
const MIN_RATIO_SCALE = 0.55

function pixelRatioFor(w, h, scale = 1) {
  const device = Math.min(window.devicePixelRatio || 1, MAX_DPR)
  return Math.min(device, Math.sqrt(FRAG_CAP / Math.max(1, w * h))) * scale
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

const GL_POINT_SIZE_RANGE = 0x846d

const HAS_WEBGL = detectWebgl()

function makeUniforms() {
  return {
    uTex: { value: null },
    uResolution: { value: new THREE.Vector2(1, 1) },
    uRect: { value: new THREE.Vector4(0, 0, 1, 1) },
    uFocalUv: { value: new THREE.Vector2(0.49, 0.38) },
    uZoom: { value: 1 },
    uCentering: { value: 0 },
    uBlur: { value: 0 },
    uAberration: { value: 0 },
    uCorrode: { value: 0 },
    uEdge: { value: 0.03 },
    uLock: { value: LOCK_ZOOM },
    uWhite: { value: 0 },
    uVignette: { value: 0 },
    uGrain: { value: 0 },
    uCover: { value: 0 },
    uSpan: { value: DUST_SPAN },
    uTail: { value: 0 },
    uCell: { value: 2 },
    uFlake: { value: 1 },
    uDpr: { value: 1 },
    uTime: { value: 0 },
    uBg: { value: new THREE.Vector3(...ROOM_FROM) },
  }
}

export default function HeroPortal({ apiRef, onReady }) {
  const layerRef = useRef(null)
  const fallbackRef = useRef(null)
  const [mode, setMode] = useState(HAS_WEBGL ? 'webgl' : 'css')

  useEffect(() => {
    if (mode !== 'webgl') return
    const layer = layerRef.current
    if (!layer) return

    const host = layer.closest('[data-hero-pane]')
    const img = document.querySelector('[data-hero-img]')
    if (!host || !img) return

    const canvas = document.createElement('canvas')
    canvas.setAttribute('aria-hidden', 'true')
    canvas.style.cssText = 'display:block;width:100%;height:100%'
    layer.appendChild(canvas)

    let renderer
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        premultipliedAlpha: true,
        antialias: false,
        powerPreference: 'high-performance',
      })
    } catch {
      renderer = null
    }
    if (!renderer || !renderer.getContext()) {
      renderer?.dispose()
      canvas.remove()
      queueMicrotask(() => setMode('css'))
      return
    }

    renderer.setClearColor(0x000000, 0)
    renderer.outputColorSpace = THREE.LinearSRGBColorSpace

    const uniforms = makeUniforms()
    const scene = new THREE.Scene()
    const camera = new THREE.Camera()
    const material = new THREE.ShaderMaterial({
      uniforms,
      defines: {
        TAPS: LOW ? 1 : 3,
        OCT: LOW ? 2 : 3,
        USE_CA: LOW ? false : 1,
      },
      vertexShader: PORTAL_VERT,
      fragmentShader: PORTAL_FRAG,
      transparent: true,
      blending: THREE.NoBlending,
      depthTest: false,
      depthWrite: false,
    })
    const geometry = new THREE.PlaneGeometry(2, 2)
    const quad = new THREE.Mesh(geometry, material)
    quad.renderOrder = 0
    scene.add(quad)

    let dust = null
    let dustCols = 0

    const disposeDust = () => {
      if (!dust) return
      scene.remove(dust.points)
      dust.geometry.dispose()
      dust.material.dispose()
      dust = null
      dustCols = 0
    }

    const paint = () => {
      if (!uniforms.uTex.value || renderer.getContext().isContextLost()) return
      renderer.render(scene, camera)
    }

    const loader = new THREE.TextureLoader()
    let loadedSrc = null
    let disposed = false
    let idle = 0
    let idleIsTimeout = false
    let dustSource = null
    let dustBlocked = false

    const buildDust = (image) => {
      if (disposed || !image) return

      if (dustBlocked) return

      const rect = uniforms.uRect.value
      if (rect.z < 24 || rect.w < 24) return

      if (renderer.getContext().getParameter(GL_POINT_SIZE_RANGE)[1] < 8) {
        dustBlocked = true
        return
      }

      const { cols, rows, flake } = planDust({
        boxW: rect.z,
        boxH: rect.w,
        zoom: DUST_ZOOM,
        low: LOW,
      })

      const grid = sampleDust(image, cols, rows)
      if (disposed) return
      if (!grid) {
        dustBlocked = true
        return
      }

      disposeDust()

      const dustGeometry = new THREE.BufferGeometry()
      dustGeometry.setAttribute('position', new THREE.BufferAttribute(grid.uv, 2))
      dustGeometry.setAttribute('aColor', new THREE.BufferAttribute(grid.color, 4, true))
      dustGeometry.setAttribute('aRnd', new THREE.BufferAttribute(grid.rnd, 4, true))
      dustGeometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(0.5, 0.5, 0), 1)

      const dustMaterial = new THREE.ShaderMaterial({
        uniforms,
        defines: { OCT: LOW ? 2 : 3 },
        vertexShader: DUST_VERT,
        fragmentShader: DUST_FRAG,
        transparent: true,
        blending: THREE.NormalBlending,
        premultipliedAlpha: true,
        depthTest: false,
        depthWrite: false,
      })

      const points = new THREE.Points(dustGeometry, dustMaterial)
      points.frustumCulled = false
      points.renderOrder = 1
      scene.add(points)

      dust = { points, geometry: dustGeometry, material: dustMaterial, count: grid.count }
      dustCols = grid.cols
      uniforms.uFlake.value = flake
      uniforms.uCell.value = rect.z / grid.cols
      paint()
    }

    const cancelDustBuild = () => {
      if (!idle) return
      if (idleIsTimeout) clearTimeout(idle)
      else window.cancelIdleCallback?.(idle)
      idle = 0
    }

    const scheduleDust = (image, timeout = 1500) => {
      dustSource = image
      if (dustBlocked) return
      cancelDustBuild()
      const run = () => {
        idle = 0
        buildDust(image)
      }
      if (window.requestIdleCallback) {
        idleIsTimeout = false
        idle = window.requestIdleCallback(run, { timeout })
      } else {
        idleIsTimeout = true
        idle = setTimeout(run, Math.min(timeout, 120))
      }
    }

    const loadTexture = (src) => {
      if (!src || src === loadedSrc) return
      loadedSrc = src
      loader.load(src, (tex) => {
        if (disposed) {
          tex.dispose()
          return
        }
        tex.colorSpace = THREE.NoColorSpace
        tex.premultiplyAlpha = true
        tex.generateMipmaps = true
        tex.minFilter = THREE.LinearMipmapLinearFilter
        tex.magFilter = THREE.LinearFilter
        tex.wrapS = THREE.ClampToEdgeWrapping
        tex.wrapT = THREE.ClampToEdgeWrapping
        tex.anisotropy = renderer.capabilities.getMaxAnisotropy()
        tex.needsUpdate = true
        uniforms.uTex.value?.dispose()
        uniforms.uTex.value = tex
        scheduleDust(tex.image, active ? 200 : 1500)
        paint()
      })
    }

    let ratioScale = 1

    const measure = () => {
      const pane = host.getBoundingClientRect()
      const box = img.getBoundingClientRect()
      const w = Math.max(1, Math.round(pane.width))
      const h = Math.max(1, Math.round(pane.height))

      renderer.setPixelRatio(pixelRatioFor(w, h, ratioScale))
      renderer.setSize(w, h, false)
      uniforms.uResolution.value.set(w, h)
      uniforms.uRect.value.set(
        box.left - pane.left,
        pane.bottom - box.bottom,
        Math.max(1, box.width),
        Math.max(1, box.height),
      )

      uniforms.uDpr.value = renderer.getPixelRatio()
      if (dustCols) uniforms.uCell.value = uniforms.uRect.value.z / dustCols
      if (!idle && !dust && !dustBlocked && dustSource && uniforms.uRect.value.z >= 24) {
        scheduleDust(dustSource, 400)
      }

      const src = img.currentSrc || img.src
      const focal = /mobile_hero/.test(src) ? FOCAL.mobile : FOCAL.desktop
      uniforms.uFocalUv.value.set(focal[0], 1 - focal[1])
      loadTexture(src)

      paint()
    }

    measure()

    const ro = new ResizeObserver(measure)
    ro.observe(host)
    ro.observe(img)
    const offResize = onViewportResize(measure)
    let cancelled = false
    document.fonts?.ready.then(() => {
      if (!cancelled && !disposed) measure()
    })

    const onContextLost = (event) => {
      event.preventDefault()
      document.documentElement.setAttribute('data-portal-lost', '')
    }

    const onContextRestored = () => {
      document.documentElement.removeAttribute('data-portal-lost')
      loadedSrc = null
      measure()
    }

    canvas.addEventListener('webglcontextlost', onContextLost)
    canvas.addEventListener('webglcontextrestored', onContextRestored)

    let active = null
    let warmup = 0
    let sampled = 0
    let slow = 0

    const render = (_time, deltaMs) => {
      if (!active || !uniforms.uTex.value || renderer.getContext().isContextLost()) return
      uniforms.uTime.value += Math.min(deltaMs, 50) / 1000
      renderer.render(scene, camera)

      if (warmup < WARMUP_FRAMES) {
        warmup += 1
        return
      }
      if (ratioScale <= MIN_RATIO_SCALE) return

      sampled += 1
      if (deltaMs > SLOW_FRAME_MS) slow += 1
      if (sampled < SAMPLE_WINDOW) return
      if (slow >= SLOW_BUDGET) {
        ratioScale = Math.max(MIN_RATIO_SCALE, ratioScale * 0.75)
        measure()
      }
      sampled = 0
      slow = 0
    }
    gsap.ticker.add(render)

    apiRef.current = {
      mode: 'webgl',
      uniforms,
      room: { from: ROOM_FROM, to: ROOM_TO },
      lockZoom: LOCK_ZOOM,
      layer,
      setActive: (next) => {
        if (next === active) return
        active = next
        if (next) {
          if (!dust && dustSource) scheduleDust(dustSource, 200)
          warmup = 0
          sampled = 0
          slow = 0
          measure()
        } else {
          paint()
        }
      },
    }

    if (import.meta.env.DEV) {
      window.__heroPortal = {
        uniforms,
        renderer,
        material,
        room: { from: ROOM_FROM, to: ROOM_TO },
        dust: () => dust?.count ?? 0,
        draw: () => renderer.render(scene, camera),
      }
    }

    onReady?.('webgl')

    return () => {
      disposed = true
      cancelled = true
      gsap.ticker.remove(render)
      ro.disconnect()
      offResize()
      canvas.removeEventListener('webglcontextlost', onContextLost)
      canvas.removeEventListener('webglcontextrestored', onContextRestored)
      document.documentElement.removeAttribute('data-portal-lost')
      cancelDustBuild()
      disposeDust()
      uniforms.uTex.value?.dispose()
      geometry.dispose()
      material.dispose()
      renderer.dispose()
      renderer.forceContextLoss()
      canvas.remove()
      apiRef.current = null
    }
  }, [mode, apiRef, onReady])

  useEffect(() => {
    if (mode !== 'css') return
    apiRef.current = { mode: 'css', el: fallbackRef.current }
    onReady?.('css')
    return () => {
      apiRef.current = null
    }
  }, [mode, apiRef, onReady])

  if (mode === 'css') {
    return (
      <div
        ref={fallbackRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[2] opacity-0"
        style={{
          background:
            'radial-gradient(circle at var(--hero-portal-fx, 50%) var(--hero-portal-fy, 60%), ' +
            '#fff 0%, #fff 38%, rgb(255 255 255 / 0) 72%)',
        }}
      />
    )
  }

  return (
    <div
      ref={layerRef}
      data-portal-layer
      aria-hidden="true"
      className="pointer-events-none invisible absolute inset-0 z-[2] opacity-0"
    />
  )
}
