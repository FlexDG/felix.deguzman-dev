// Hero section stage

import { Suspense, lazy, useCallback, useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Hero from './Hero'

gsap.registerPlugin(ScrollTrigger)

const HeroPortal = lazy(() => import('./HeroPortal'))

const SEL = {
  title: '[data-hero="title"]',
  tech: '[data-hero="tech"]',
  figure: '[data-hero="figure"]',
  headlineLines: '[data-hero="headline"] > span',
  cardStat: '[data-hero="card-stat"]',
  cardTraits: '[data-hero="card-traits"]',
  cta: '[data-hero="cta"]',
  notes: '[data-hero="notes"]',
  img: '[data-hero-img]',
}

const REDUCED =
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

export default function HeroStage() {
  const stageRef = useRef(null)
  const portalApi = useRef(null)
  const [portalMode, setPortalMode] = useState(null)

  const handleReady = useCallback((mode) => setPortalMode(mode), [])

  useEffect(() => {
    if (!portalMode) return
    const stage = stageRef.current
    if (!stage) return

    const api = portalApi.current
    if (!api) return

    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(stage)

      const tl = gsap.timeline({ defaults: { ease: 'none' } })

      tl.to(q(SEL.notes), { opacity: 0, y: 34, duration: 0.1 }, 0)
        .to(q(SEL.cta), { opacity: 0, y: 34, duration: 0.1 }, 0.015)
        .to(q(SEL.tech), { opacity: 0, y: 24, duration: 0.11 }, 0.03)
        .to(q(SEL.cardStat), { opacity: 0, xPercent: -16, duration: 0.11 }, 0.02)
        .to(q(SEL.cardTraits), { opacity: 0, xPercent: 16, duration: 0.11 }, 0.02)
        .to(
          q(SEL.headlineLines),
          { yPercent: -160, duration: 0.13, ease: 'power2.in', stagger: 0.022 },
          0.04,
        )
        .to(
          q(SEL.headlineLines),
          { opacity: 0, duration: 0.09, ease: 'power1.in', stagger: 0.022 },
          0.04,
        )
        .to(q(SEL.title), { opacity: 0, scale: 1.14, y: -40, duration: 0.14 }, 0.03)

      if (api.mode === 'webgl') buildWebgl(tl, q, api)
      else buildCss(tl, q, api)

      if (import.meta.env.DEV) window.__heroTl = tl

      ScrollTrigger.create({
        trigger: stage,
        start: 'top top',
        end: 'bottom bottom',
        scrub: true,
        animation: tl,
        invalidateOnRefresh: true,
        onToggle: (self) => api.setActive?.(self.progress < 1),
        onRefresh: (self) => api.setActive?.(self.progress < 1),
      })
    }, stage)

    const img = document.querySelector(SEL.img)
    const refresh = () => ScrollTrigger.refresh()
    if (img && !img.complete) img.addEventListener('load', refresh, { once: true })
    document.fonts?.ready.then(refresh)

    return () => {
      img?.removeEventListener('load', refresh)
      ctx.revert()
    }
  }, [portalMode])

  return (
    <div
      ref={stageRef}
      data-hero-stage
      className="relative h-[calc(100svh+var(--hero-portal-runway))]"
    >
      <Hero
        portal={
          REDUCED ? null : (
            <Suspense fallback={null}>
              <HeroPortal apiRef={portalApi} onReady={handleReady} />
            </Suspense>
          )
        }
      />
    </div>
  )
}

function buildWebgl(tl, q, api) {
  const u = api.uniforms
  const [r, g, b] = api.room.to

  tl.set(q(SEL.figure), { autoAlpha: 0 }, 0.004).set(api.layer, { autoAlpha: 1 }, 0.004)

  tl.to(u.uCover, { value: 1, duration: 0.14, ease: 'power1.in' }, 0.1).to(
    u.uBg.value,
    { x: r, y: g, z: b, duration: 0.4, ease: 'power1.inOut' },
    0.14,
  )

  tl.to(u.uZoom, { value: 1.35, duration: 0.18, ease: 'power1.out' }, 0.02)
    .to(u.uZoom, { value: 8, duration: 0.48, ease: 'power1.in' }, 0.2)
    .to(u.uCentering, { value: 1, duration: 0.4, ease: 'power2.out' }, 0.16)
    .to(u.uGrain, { value: 1, duration: 0.16 }, 0.16)
    .to(u.uVignette, { value: 1, duration: 0.3, ease: 'power1.out' }, 0.22)
    .to(u.uBlur, { value: 0.34, duration: 0.36, ease: 'power2.in' }, 0.3)
    .to(u.uAberration, { value: 0.05, duration: 0.34, ease: 'power2.in' }, 0.32)

  tl.to(u.uCorrode, { value: 1, duration: 0.39, ease: 'none' }, 0.54)

    .to(u.uWarp, { value: 74, duration: 0.13, ease: 'power1.in' }, 0.55)
    .to(u.uWarp, { value: 0, duration: 0.09 }, 0.84)

    .to(u.uEdge, { value: 0.13, duration: 0.26, ease: 'power1.in' }, 0.66)

    .to(u.uRim, { value: 0.42, duration: 0.09 }, 0.55)
    .to(u.uRim, { value: 0, duration: 0.1 }, 0.82)

    .to(u.uZoom, { value: 30, duration: 0.26, ease: 'power3.in' }, 0.68)
    .to(u.uBlur, { value: 0.62, duration: 0.24, ease: 'power2.in' }, 0.66)
    .to(u.uVignette, { value: 0, duration: 0.14 }, 0.72)

    .to(u.uAberration, { value: 0, duration: 0.12 }, 0.78)
    .to(u.uGrain, { value: 0, duration: 0.12 }, 0.8)

    .to(u.uWhite, { value: 1, duration: 0.05 }, 0.93)
}

function buildCss(tl, q, api) {
  const figure = q(SEL.figure)[0]
  const img = document.querySelector(SEL.img)
  const mobile = /mobile_hero/.test(img?.currentSrc || img?.src || '')
  const [fx, fy] = mobile ? [43, 55] : [49, 62]

  if (figure) {
    gsap.set(figure, { xPercent: -50, transformOrigin: `${fx}% ${fy}%` })
    tl.to(figure, { scale: 9, duration: 0.55, ease: 'power2.in' }, 0.16)
      .to(figure, { scale: 22, duration: 0.26, ease: 'power3.in' }, 0.66)
      .to(figure, { filter: 'blur(26px)', duration: 0.3, ease: 'power2.in' }, 0.6)
  }

  const el = api.el
  if (el) {
    el.style.setProperty('--hero-portal-fx', `${fx}%`)
    el.style.setProperty('--hero-portal-fy', `${fy}%`)
    gsap.set(el, { transformOrigin: `${fx}% ${fy}%`, scale: 0.25 })
    tl.to(el, { opacity: 1, duration: 0.2 }, 0.58)
      .to(el, { scale: 6, duration: 0.3, ease: 'power2.in' }, 0.58)
      .to(el, { backgroundColor: '#ffffff', duration: 0.14 }, 0.78)
  }
}
