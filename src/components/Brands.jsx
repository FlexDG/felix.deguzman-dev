// Brands strip inside Projects

import { Fragment, useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { scrub } from '../hooks/useSmoothScroll'
import { isLowPerf } from '../lib/perf'

gsap.registerPlugin(ScrollTrigger)

const LEAD =
  'I’ve had the privilege of collaborating with renowned brands, ' +
  'bringing innovative ideas to life and creating impactful designs.'

const SUB =
  'A small number of projects at a time, so each one gets the same attention — ' +
  'clear communication, honest timelines, and ownership of the work long after it ships.'

const BRANDS = [
  { name: 'GCRR', src: 'gcrr_logo.png', ar: 2.83, fit: 73, ink: [0.0717, 0.2583, 0.85, 0.5405] },
  { name: 'AL', src: 'al_logo_white.svg', ar: 10.07, fit: 82, ink: [0, 0, 1, 1] },
  { name: 'NA', src: 'NA_brand.png', ar: 2.8, fit: 73, ink: [0.1167, 0.2226, 0.7667, 0.5449] },
  { name: 'DF', src: 'df_logo.webp', ar: 1.32, fit: 57.9, ink: [0.015, 0.036, 0.97, 0.928] },
  { name: 'PRD', src: 'prd_brand.png', ar: 2.7, fit: 70, ink: [0.1454, 0.3691, 0.7092, 0.2617] },
  { name: 'DCO', src: 'dco_logo.png', ar: 4.69, fit: 82, ink: [0.0775, 0.188, 0.845, 0.6154] },
  {
    name: 'Highland',
    src: 'highland_brand_white.svg',
    ar: 2.65,
    fit: 82,
    ink: [0.105, 0.3508, 0.7917, 0.2983],
  },
  { name: 'SAS', src: 'sas_logo.png', ar: 1.4, fit: 69.1, ink: [0.06, 0.0956, 0.8817, 0.6673] },
  { name: 'RTE', src: 'rte_brand.png', ar: 2.85, fit: 70, ink: [0.1875, 0.395, 0.6075, 0.2125] },
  { name: 'AF', src: 'af_logo.png', ar: 13.81, fit: 82, ink: [0.05, 0.2917, 0.9, 0.4063] },
]

const BASE_SPEED = 0.8
const DRAG_SCALE = 0.75
const TILT_LIMIT = 15

function Logo({ brand, clone }) {
  return (
    <div
      data-bd="card"
      {...(clone ? { 'data-clone': '' } : null)}
      className="mx-[var(--bd-gap)] flex aspect-[0.93/1] w-[var(--bd-card-w)] shrink-0"
    >
      <div
        data-bd="face"
        className="flex h-full w-full items-center justify-center border
                   border-[var(--bd-card-line)] bg-[var(--bd-card-bg)]"
      >
        <div
          className="relative overflow-hidden"
          style={{ width: `${brand.fit}%`, aspectRatio: `${brand.ar}` }}
        >
          <img
            src={`${import.meta.env.BASE_URL}images/logo/brands/${brand.src}`}
            alt={clone ? '' : `${brand.name} logo`}
            loading="lazy"
            decoding="async"
            draggable="false"
            className="pointer-events-none absolute left-0 top-0 h-auto max-w-none"
            style={{
              width: `${(100 / brand.ink[2]).toFixed(3)}%`,
              transform: `translate(${(-brand.ink[0] * 100).toFixed(3)}%, ${(-brand.ink[1] * 100).toFixed(3)}%)`,
            }}
          />
        </div>
      </div>
    </div>
  )
}

export default function Brands() {
  const rootRef = useRef(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    const mm = gsap.matchMedia()

    mm.add(
      {
        reduced: '(prefers-reduced-motion: reduce)',
        motion: '(prefers-reduced-motion: no-preference)',
      },
      (self) => {
        if (self.conditions.reduced) return

        const q = gsap.utils.selector(root)
        const title = q('[data-bd="title"]')[0]
        const words = q('[data-bd="word"]')
        const sub = q('[data-bd="sub"]')[0]
        const strip = q('[data-bd="strip"]')[0]
        const track = q('[data-bd="track"]')[0]
        const cards = q('[data-bd="card"]')
        if (!title || !strip || !track || !cards.length) return

        gsap.set(words, { autoAlpha: 0, yPercent: 60 })

        gsap.to(words, {
          autoAlpha: 1,
          yPercent: 0,
          duration: 0.055,
          ease: 'power2.out',
          stagger: 0.4 / Math.max(words.length - 1, 1),
          scrollTrigger: {
            trigger: title,
            start: 'top 88%',
            end: 'bottom 55%',
            scrub: scrub(0.8),
            invalidateOnRefresh: true,
          },
        })

        if (sub) {
          gsap.fromTo(
            sub,
            { autoAlpha: 0, y: 26 },
            {
              autoAlpha: 1,
              y: 0,
              ease: 'power2.out',
              immediateRender: true,
              scrollTrigger: {
                trigger: sub,
                start: 'top 95%',
                end: 'top 70%',
                scrub: scrub(0.8),
                invalidateOnRefresh: true,
              },
            },
          )
        }

        const soft = isLowPerf() ? null : 'blur(12px)'

        gsap.set(cards, {
          autoAlpha: 0,
          y: () => window.innerHeight * 0.0488,
          ...(soft ? { filter: soft } : null),
        })

        gsap.to(cards, {
          autoAlpha: 1,
          y: 0,
          ...(soft ? { filter: 'blur(0px)' } : null),
          duration: 0.8,
          ease: 'power3.out',
          stagger: { each: 0.04, from: 'center' },
          scrollTrigger: {
            trigger: strip,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
        })

        let x = 0
        let target = 0
        let dragV = 0
        let boost = 0
        let dir = -1
        let tilt = 0
        let dragging = false
        let inView = false
        let half = 0
        let painted = ''

        const remeasure = () => {
          half = track.offsetWidth / 2
        }
        remeasure()

        ScrollTrigger.create({
          trigger: root,
          start: 'top 99%',
          end: 'bottom -100%',
          onToggle: (st) => {
            inView = st.isActive
          },
        })

        ScrollTrigger.create({
          trigger: document.body,
          start: 'top top',
          end: 'bottom bottom',
          onUpdate: (st) => {
            if (!st.direction || dragging || !inView) return
            dir = st.direction
            const narrow = window.innerWidth <= 1024
            const raw = 0.002 * st.getVelocity()
            const max = narrow ? 1.3 : 1.5
            boost += Math.abs(raw) > max ? max * Math.sign(raw) : raw
          },
        })

        const tick = (time, delta) => {
          if (!inView) return

          const r = Math.min(delta / 16.66, 3)
          const w = window.innerWidth
          const mobile = w <= 640
          const narrow = w <= 1024

          if (dragging) {
            x += (target - x) * 0.06 * r
            dragV += (target - x - dragV) * 0.1 * r
          } else {
            dragV *= Math.pow(0.96, r)
            boost *= Math.pow(0.94, r)
            const drift = (BASE_SPEED / (narrow ? 1.2 : 1)) * dir
            x += (dragV + (narrow ? boost * 0.85 : boost) + drift) * r
            target = x
          }

          if (half > 0) {
            if (x > 0) {
              x -= half
              target -= half
            } else if (x < -half) {
              x += half
              target += half
            }
          }

          const d = mobile ? 0.375 : narrow ? 0.75 : 1
          const goal = gsap.utils.clamp(
            -TILT_LIMIT,
            TILT_LIMIT,
            0.8 * ((dragV / w) * 100) * 0.4 * d + 0.8 * ((boost / w) * 100) * 10 * d,
          )
          tilt += (goal - tilt) * 0.06 * r

          gsap.set(track, { x })

          const next = tilt.toFixed(2)
          if (next !== painted) {
            painted = next
            strip.style.setProperty('--bd-tilt', next)
          }
        }

        gsap.ticker.add(tick)

        if (import.meta.env.DEV) {
          window.__bd = {
            tick,
            read: () => ({ x, target, dragV, boost, dir, tilt, dragging, inView, half }),
            push: (v) => {
              boost += v
            },
          }
        }

        let lastX = 0
        let pointer = null

        const press = (event) => {
          if (event.button > 0) return
          pointer = event.pointerId
          dragging = true
          boost = 0
          lastX = event.clientX
          target = x
          strip.setPointerCapture?.(pointer)
          gsap.to(cards, { scale: 0.98, duration: 0.5, ease: 'power2.out', overwrite: 'auto' })
        }

        const move = (event) => {
          if (!dragging || event.pointerId !== pointer) return
          const dx = event.clientX - lastX
          lastX = event.clientX
          if (!dx) return
          target += DRAG_SCALE * dx
          dir = dx > 0 ? 1 : -1
        }

        const release = (event) => {
          if (!dragging || (pointer !== null && event.pointerId !== pointer)) return
          dragging = false
          pointer = null
          dragV *= 0.15
          gsap.to(cards, { scale: 1, duration: 0.5, ease: 'back.out(1.4)', overwrite: 'auto' })
        }

        strip.addEventListener('pointerdown', press)
        strip.addEventListener('pointermove', move)
        strip.addEventListener('pointerup', release)
        strip.addEventListener('pointercancel', release)

        const ro = new ResizeObserver(remeasure)
        ro.observe(track)
        ScrollTrigger.addEventListener('refresh', remeasure)

        return () => {
          gsap.ticker.remove(tick)
          ro.disconnect()
          ScrollTrigger.removeEventListener('refresh', remeasure)
          strip.removeEventListener('pointerdown', press)
          strip.removeEventListener('pointermove', move)
          strip.removeEventListener('pointerup', release)
          strip.removeEventListener('pointercancel', release)
        }
      },
    )

    return () => mm.revert()
  }, [])

  return (
    <div
      ref={rootRef}
      data-bd="root"
      className="relative w-full pt-[var(--bd-lead)] pb-[var(--bd-tail)]"
    >
      <div className="w-full px-[var(--pj-gutter)]">
        <div className="mx-auto w-fit max-w-[var(--pj-max-w)]">
          <h2
            data-bd="title"
            className="m-0 max-w-[37ch] indent-[var(--bd-indent)] text-left font-heading
                       text-[length:var(--pj-head-size)] font-bold leading-[1.02]
                       tracking-[-0.03em] text-white"
          >
            {LEAD.split(' ').map((word, i) => (
              <Fragment key={`w-${i}`}>
                {i > 0 && ' '}
                <span data-bd="word" className="inline-block indent-0">
                  {word}
                </span>
              </Fragment>
            ))}
          </h2>

          <p
            data-bd="sub"
            className="m-0 mt-[var(--bd-sub-gap)] max-w-[var(--bd-sub-w)] text-left
                       font-body text-[length:var(--bd-sub-size)] font-light
                       leading-[1.45] text-white/65"
          >
            {SUB}
          </p>
        </div>
      </div>

      <div
        data-bd="strip"
        className="relative mt-[var(--bd-title-gap)] w-full cursor-grab select-none
                   overflow-hidden py-[var(--bd-strip-pad)] active:cursor-grabbing"
        aria-label="Brands"
      >
        <div data-bd="track" className="flex w-max items-center">
          {[0, 1].map((run) =>
            BRANDS.map((brand) => (
              <Logo key={`${run}-${brand.name}`} brand={brand} clone={run === 1} />
            )),
          )}
        </div>
      </div>
    </div>
  )
}
