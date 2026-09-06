// About portrait WebGL layer (lazy)

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import * as THREE from 'three'
import { PORTRAIT_FRAG, PORTRAIT_VERT, SHRUG } from '../shaders/aboutPortrait'

const MAX_DPR = 1.75

export default function AboutPortraitGL({ videoRef, onReady, onFail }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const video = videoRef.current
    if (!canvas || !video) return

    THREE.ColorManagement.enabled = false

    let renderer
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: false,
        premultipliedAlpha: false,
        powerPreference: 'low-power',
      })
    } catch {
      onFail?.()
      return
    }

    renderer.setClearColor(0x000000, 0)

    const texture = new THREE.VideoTexture(video)
    texture.minFilter = THREE.LinearFilter
    texture.magFilter = THREE.LinearFilter
    texture.generateMipmaps = false

    const uniforms = {
      uMap: { value: texture },
      uShrug: { value: 0 },
      uAmp: { value: SHRUG.amp },
      uTop: { value: SHRUG.top },
      uPeak: { value: SHRUG.peak },
      uBottom: { value: SHRUG.bottom },
      uCollar: { value: SHRUG.collar },
    }

    const geometry = new THREE.PlaneGeometry(1, 1)
    const material = new THREE.ShaderMaterial({
      vertexShader: PORTRAIT_VERT,
      fragmentShader: PORTRAIT_FRAG,
      uniforms,
      transparent: true,
      depthTest: false,
      depthWrite: false,
    })

    const scene = new THREE.Scene()
    scene.add(new THREE.Mesh(geometry, material))
    const camera = new THREE.Camera()

    const resize = () => {
      const box = canvas.parentElement
      if (!box) return
      const w = box.clientWidth
      const h = box.clientHeight
      if (!w || !h) return

      const painted = canvas.getBoundingClientRect()
      const zoom = painted.width && w ? painted.width / w : 1

      const dpr = Math.min((window.devicePixelRatio || 1) * zoom, MAX_DPR)
      renderer.setPixelRatio(dpr)
      renderer.setSize(w, h, false)

      renderer.render(scene, camera)
    }
    resize()

    const ro = new ResizeObserver(resize)
    if (canvas.parentElement) ro.observe(canvas.parentElement)

    const tl = gsap.timeline({ repeat: -1 })
    tl.to(uniforms.uShrug, { value: 1, duration: 0.42, ease: 'power2.out' })
      .to(uniforms.uShrug, { value: 0, duration: 1.25, ease: 'power2.inOut' }, '+=0.18')
      .to({}, { duration: 3.4 })
      .to(uniforms.uShrug, { value: 0.55, duration: 0.5, ease: 'power2.out' })
      .to(uniforms.uShrug, { value: 0, duration: 1.4, ease: 'power2.inOut' }, '+=0.1')
      .to({}, { duration: 4.6 })

    const pixel = new Uint8Array(4)
    const readAlphaAt = (fx, fyFromTop) => {
      const gl = renderer.getContext()
      const w = renderer.domElement.width
      const h = renderer.domElement.height
      if (!w || !h) return -1
      const x = Math.min(w - 1, Math.max(0, Math.round(w * fx)))
      const y = Math.min(h - 1, Math.max(0, Math.round(h * (1 - fyFromTop))))
      gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel)
      return pixel[3]
    }

    let frame = 0
    let painted = false
    let tries = 0

    let onScreen = true
    const io = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting
        if (painted) {
          if (onScreen) tl.resume()
          else tl.pause()
        }
      },
      { rootMargin: '25% 0px 25% 0px' },
    )
    io.observe(canvas)

    const MIN_FRAME_MS = 1000 / 33
    let lastDraw = 0

    const draw = (now = 0) => {
      frame = requestAnimationFrame(draw)
      if (document.hidden || (painted && !onScreen)) return
      if (painted && now - lastDraw < MIN_FRAME_MS) return
      lastDraw = now
      renderer.render(scene, camera)

      if (painted) return

      const subject = readAlphaAt(0.5, 0.6)
      const backdrop = readAlphaAt(0.01, 0.02)

      if (subject > 240 && backdrop < 16) {
        painted = true
        if (!onScreen) tl.pause()
        onReady?.()
        return
      }

      if (subject > 240 && backdrop > 240) {
        painted = true
        onFail?.()
        return
      }

      if (++tries > 60) {
        painted = true
        onFail?.()
      }
    }
    frame = requestAnimationFrame(draw)

    const onLost = (e) => {
      e.preventDefault()
      onFail?.()
    }
    canvas.addEventListener('webglcontextlost', onLost)

    return () => {
      cancelAnimationFrame(frame)
      canvas.removeEventListener('webglcontextlost', onLost)
      io.disconnect()
      ro.disconnect()
      tl.kill()
      texture.dispose()
      geometry.dispose()
      material.dispose()
      renderer.dispose()
    }
  }, [videoRef, onReady, onFail])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="absolute inset-0 h-full w-full select-none"
    />
  )
}
