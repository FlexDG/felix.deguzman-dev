// Hero WebGL portal transition (lazy)

import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import * as THREE from 'three'
import { PORTAL_FRAG, PORTAL_VERT } from '../shaders/heroPortal'
import { onViewportResize } from '../hooks/onViewportResize'

const FOCAL = {
  desktop: [0.49, 0.62],
  mobile: [0.43, 0.55],
}

const ROOM_FROM = [0.8902, 0.8706, 0.9882]
const ROOM_TO = [0.251, 0.169, 0.314]

const MAX_DPR = 1.75
const FRAG_CAP = 3.2e6

function pixelRatioFor(w, h) {
  const device = Math.min(window.devicePixelRatio || 1, MAX_DPR)
  return Math.min(device, Math.sqrt(FRAG_CAP / Math.max(1, w * h)))
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
    uEdge: { value: 0.05 },
    uWarp: { value: 0 },
    uRim: { value: 0 },
    uWhite: { value: 0 },
    uVignette: { value: 0 },
    uGrain: { value: 0 },
    uCover: { value: 0 },
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
      vertexShader: PORTAL_VERT,
      fragmentShader: PORTAL_FRAG,
      transparent: true,
      blending: THREE.NoBlending,
      depthTest: false,
      depthWrite: false,
    })
    const geometry = new THREE.PlaneGeometry(2, 2)
    scene.add(new THREE.Mesh(geometry, material))

    const paint = () => {
      if (!uniforms.uTex.value || renderer.getContext().isContextLost()) return
      renderer.render(scene, camera)
    }

    const loader = new THREE.TextureLoader()
    let loadedSrc = null
    let disposed = false

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
        paint()
      })
    }

    const measure = () => {
      const pane = host.getBoundingClientRect()
      const box = img.getBoundingClientRect()
      const w = Math.max(1, Math.round(pane.width))
      const h = Math.max(1, Math.round(pane.height))

      renderer.setPixelRatio(pixelRatioFor(w, h))
      renderer.setSize(w, h, false)
      uniforms.uResolution.value.set(w, h)
      uniforms.uRect.value.set(
        box.left - pane.left,
        pane.bottom - box.bottom,
        Math.max(1, box.width),
        Math.max(1, box.height),
      )

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

    let active = false
    const render = (_time, deltaMs) => {
      if (!active || !uniforms.uTex.value || renderer.getContext().isContextLost()) return
      uniforms.uTime.value += Math.min(deltaMs, 50) / 1000
      renderer.render(scene, camera)
    }
    gsap.ticker.add(render)

    apiRef.current = {
      mode: 'webgl',
      uniforms,
      room: { from: ROOM_FROM, to: ROOM_TO },
      layer,
      setActive: (next) => {
        active = next
        if (next) measure()
      },
    }

    if (import.meta.env.DEV) {
      window.__heroPortal = {
        uniforms,
        renderer,
        room: { from: ROOM_FROM, to: ROOM_TO },
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
