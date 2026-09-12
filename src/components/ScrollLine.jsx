// Services scroll line

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import * as THREE from 'three'

gsap.registerPlugin(ScrollTrigger)

const DROP = 205

export default function ScrollLine() {
  const rootRef = useRef(null)
  const glRef = useRef(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return undefined

    const mm = gsap.matchMedia()

    const build = () =>
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const bar = root.querySelector('[data-ln="bar"]')
        const mask = root.querySelector('[data-ln="mask"]')
        const mouse = root.querySelector('[data-ln="mouse"]')
        const coarse = window.matchMedia('(pointer: coarse)').matches

        gsap.fromTo(
          bar,
          { y: -DROP },
          {
            y: 0,
            ease: 'none',
            scrollTrigger: {
              trigger: mask,
              start: 'top 88%',
              end: 'top 42%',
              scrub: coarse ? 0.3 : true,
            },
          },
        )

        gsap.from(mouse, {
          autoAlpha: 0,
          y: -10,
          duration: 0.5,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: mask,
            start: 'bottom 62%',
            toggleActions: 'play none none reverse',
          },
        })

        gsap.set(root, { transformOrigin: '50% 0%' })
        gsap.fromTo(
          root,
          { rotate: -1.5 },
          {
            rotate: 1.5,
            duration: 2.9,
            ease: 'sine.inOut',
            yoyo: true,
            repeat: -1,
          },
        )
      })

    let done = false
    const run = () => {
      if (done) return
      done = true
      build()
    }

    let raf = requestAnimationFrame(() => {
      raf = requestAnimationFrame(() => {
        raf = 0
        run()
      })
    })
    const timer = setTimeout(run, 300)

    return () => {
      if (raf) cancelAnimationFrame(raf)
      clearTimeout(timer)
      mm.revert()
    }
  }, [])

  useEffect(() => {
    const canvas = glRef.current
    if (!canvas) return undefined

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
    })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 20)
    camera.position.set(0, 2.2, 3.5)
    camera.lookAt(0, 0.1, 0)

    scene.add(new THREE.AmbientLight(0xffffff, 0.6))
    const key = new THREE.DirectionalLight(0xffffff, 1.2)
    key.position.set(2, 3.5, 2)
    scene.add(key)

    const rig = new THREE.Group()
    scene.add(rig)

    const shell = new THREE.MeshStandardMaterial({
      color: 0x3c3c41,
      roughness: 0.5,
      metalness: 0.08,
    })

    const body = new THREE.Mesh(
      new THREE.SphereGeometry(1, 40, 24, 0, Math.PI * 2, 0, Math.PI * 0.5),
      shell,
    )
    body.scale.set(0.52, 0.44, 1)
    rig.add(body)

    const base = new THREE.Mesh(new THREE.CircleGeometry(1, 40), shell)
    base.rotation.x = Math.PI * 0.5
    base.scale.set(0.52, 1, 1)
    rig.add(base)

    const wheel = new THREE.Mesh(
      new THREE.CylinderGeometry(0.17, 0.17, 0.08, 20),
      new THREE.MeshStandardMaterial({ color: 0xcaa1e3, roughness: 0.35 }),
    )
    wheel.rotation.z = Math.PI * 0.5
    wheel.position.set(0, 0.34, 0.44)
    rig.add(wheel)

    const size = () => {
      const w = canvas.clientWidth || 44
      renderer.setSize(w, w, false)
    }
    size()

    let active = false
    const tick = () => {
      rig.rotation.z = Math.sin(gsap.ticker.time * 1.15) * 0.11
      renderer.render(scene, camera)
    }

    const start = () => {
      if (active) return
      active = true
      gsap.ticker.add(tick)
    }
    const stop = () => {
      if (!active) return
      active = false
      gsap.ticker.remove(tick)
    }

    let st = null
    let raf = requestAnimationFrame(() => {
      raf = 0
      st = ScrollTrigger.create({
        trigger: canvas,
        start: 'top bottom',
        end: 'bottom top',
        onToggle: (self) => (self.isActive ? start() : stop()),
      })
    })

    renderer.render(scene, camera)

    const onResize = () => {
      size()
      renderer.render(scene, camera)
    }
    window.addEventListener('resize', onResize)

    return () => {
      stop()
      if (raf) cancelAnimationFrame(raf)
      st?.kill()
      window.removeEventListener('resize', onResize)
      body.geometry.dispose()
      base.geometry.dispose()
      wheel.geometry.dispose()
      shell.dispose()
      wheel.material.dispose()
      renderer.dispose()
    }
  }, [])

  return (
    <div ref={rootRef} data-ln="root" aria-hidden="true">
      <div data-ln="mask">
        <div data-ln="bar" />
      </div>
      <canvas ref={glRef} data-ln="mouse" />
    </div>
  )
}
