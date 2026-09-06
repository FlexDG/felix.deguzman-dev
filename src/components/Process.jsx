// Process section

import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { scrub } from '../hooks/useSmoothScroll'
import { HeroCta } from './Hero'
import ProcessModal from './ProcessModal'

gsap.registerPlugin(ScrollTrigger)

const IMG = `${import.meta.env.BASE_URL}images/process_images/`

const PROCESS_BG = `${IMG}process_bg.webp`

const DEVICES = [
  { file: 'macbook_mockup.webp', alt: 'Laptop showing a build in progress', dy: 1, tile: false },
  { file: 'iphone_mockup.webp', alt: 'The same build on a phone', dy: -1, tile: false },
  { file: 'sketchbook.webp', alt: 'A sketchbook of early layouts', dy: 1.6, tile: true },
]

const DEVICE_PILLS = [
  { label: 'The build', x: 12, y: 16 },
  { label: 'Mobile-ready', x: 46, y: 10 },
  { label: 'The blueprint', x: 79, y: 20 },
]

const POINTS = [
  { x: 5, y: 85 },
  { x: 23, y: 76 },
  { x: 41, y: 52 },
  { x: 59, y: 56 },
  { x: 77, y: 38 },
  { x: 95, y: 6 },
]

const BARS = [38, 62, 45, 78, 55, 92, 70]

export function Pill({ children, tone = 'accent', className = '', ...rest }) {
  return (
    <span
      {...rest}
      data-pr-pill={tone}
      className={`inline-flex w-fit shrink-0 items-center whitespace-nowrap rounded-md
                  px-[var(--pr-pill-px)] py-[var(--pr-pill-py)] font-body
                  text-[length:var(--pr-pill-size)] font-medium uppercase
                  leading-none tracking-[0.06em] ${className}`}
    >
      {children}
    </span>
  )
}

function ArrowDown() {
  return (
    <svg
      data-pr="arrow"
      viewBox="0 0 36 37"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="h-[var(--pr-arrow)] w-[var(--pr-arrow)] text-[var(--color-cta)]"
    >
      <path d="M18 33.5C26.28 33.5 33 26.78 33 18.5C33 10.21 26.28 3.5 18 3.5C9.71 3.5 3 10.21 3 18.5C3 26.78 9.71 33.5 18 33.5Z" />
      <path d="M12 18.5L18 24.5L24 18.5" />
      <path d="M18 12.5V24.5" />
    </svg>
  )
}

function Header({ eyebrow, eyebrows, heading, sub, arrow = false }) {
  const pills = eyebrows ?? (eyebrow ? [eyebrow] : [])

  return (
    <div className="mx-auto flex max-w-[var(--pr-head-w)] flex-col items-center text-center">
      <div
        data-pr="reveal"
        className="flex flex-wrap items-center justify-center gap-[var(--pr-pill-row-gap)]"
      >
        {pills.map((p) => (
          <Pill key={p}>{p}</Pill>
        ))}
      </div>

      <h2
        data-pr="reveal"
        className="m-0 mt-[var(--pr-head-gap)] font-heading text-[length:var(--pr-head-size)]
                   font-bold leading-[0.98] tracking-[-0.035em] text-white"
      >
        {heading}
      </h2>

      {sub && (
        <p
          data-pr="reveal"
          className="m-0 mt-[var(--pr-sub-gap)] max-w-[var(--pr-sub-w)] font-body
                     text-[length:var(--pr-sub-size)] font-light leading-[1.35] text-white"
        >
          {sub}
        </p>
      )}

      {arrow && (
        <span data-pr="reveal" className="mt-[var(--pr-arrow-gap)] block">
          <ArrowDown />
        </span>
      )}
    </div>
  )
}

function ActCopy({ eyebrow, lead, cta, onCta }) {
  return (
    <div className="flex w-[var(--pr-copy-w)] max-w-full flex-col items-start">
      <Pill data-pr="reveal">{eyebrow}</Pill>

      <p
        data-pr="reveal"
        className="m-0 mt-[var(--pr-head-gap)] font-body text-[length:var(--pr-lead-size)]
                   font-semibold leading-[1.3] tracking-[-0.02em] text-white"
      >
        {lead}
      </p>

      <div data-pr="reveal" data-pr-cta="" className="mt-[var(--pr-cta-gap)]">
        <HeroCta onClick={onCta}>{cta}</HeroCta>
      </div>
    </div>
  )
}

function GraphCard({ ...rest }) {
  const solid = POINTS.slice(0, 2)
    .map((p) => `${p.x},${p.y}`)
    .join(' ')
  const dashed = POINTS.slice(1)
    .map((p) => `${p.x},${p.y}`)
    .join(' ')

  return (
    <div data-pr="card-main" className="relative" {...rest}>
      <h3
        className="m-0 max-w-[16ch] font-heading text-[length:var(--pr-card-title)]
                   font-bold leading-[1.15] tracking-[-0.02em] text-white"
      >
        Measured, not guessed
      </h3>

      <p
        className="m-0 mt-[var(--pr-card-gap)] font-heading text-[length:var(--pr-figure)]
                   font-bold leading-none tracking-[-0.04em] text-white"
      >
        94<span className="text-[0.45em] align-top">%</span>
      </p>

      <p
        className="m-0 mt-[var(--pr-card-gap)] font-body text-[length:var(--pr-note-size)]
                   font-semibold uppercase leading-none tracking-[0.08em] text-white/55"
      >
        Average Performance
      </p>

      <div data-pr="plot" className="relative mt-[var(--pr-card-gap)] flex-1">
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
          className="absolute inset-0 h-full w-full overflow-visible"
        >
          <polyline
            data-pr="line"
            points={solid}
            fill="none"
            stroke="white"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
          <polyline
            data-pr="line"
            points={dashed}
            fill="none"
            stroke="white"
            strokeOpacity={0.6}
            strokeWidth={2}
            strokeDasharray="4 5"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        {POINTS.map((p, i) => (
          <span
            key={`dot-${p.x}`}
            data-pr="dot"
            data-lead={i === POINTS.length - 2 ? '' : undefined}
            style={{ '--x': `${p.x}%`, '--y': `${p.y}%` }}
          />
        ))}

        <Pill
          data-pr="gpill"
          style={{
            '--x': `${POINTS[POINTS.length - 2].x}%`,
            '--y': `${POINTS[POINTS.length - 2].y}%`,
          }}
        >
          Build
        </Pill>

        <Pill
          data-pr="gpill"
          data-last=""
          tone="light"
          style={{
            '--x': `${POINTS[POINTS.length - 1].x}%`,
            '--y': `${POINTS[POINTS.length - 1].y}%`,
          }}
        >
          Shipped and measured
        </Pill>
      </div>

      <p
        className="m-0 mt-[var(--pr-card-gap)] font-body text-[length:var(--pr-note-size)]
                   font-semibold uppercase leading-none tracking-[0.08em] text-white/55"
      >
        Across every build
      </p>
    </div>
  )
}

function StatCard({ ...rest }) {
  return (
    <div data-pr="card-stat" {...rest}>
      <div className="flex flex-col items-end text-right">
        <p
          className="m-0 font-heading text-[length:var(--pr-figure)] font-bold
                     leading-none tracking-[-0.04em] text-white"
        >
          <span data-pr="count">0</span>+
        </p>
        <p
          className="m-0 mt-[var(--pr-card-gap-sm)] font-body text-[length:var(--pr-note-size)]
                     font-semibold uppercase leading-none tracking-[0.08em] text-white/65"
        >
          Projects done
        </p>
      </div>

      <div className="flex items-end justify-between gap-4">
        <p
          className="m-0 font-body text-[length:var(--pr-note-size)] font-semibold
                     uppercase leading-none tracking-[0.08em] text-white/55"
        >
          Design + build
        </p>

        <div data-pr="bars" aria-hidden="true">
          {BARS.map((h, i) => (
            <span key={`bar-${i}`} style={{ '--h': `${h}%` }} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default function Process() {
  const rootRef = useRef(null)

  const [panel, setPanel] = useState(0)
  const [open, setOpen] = useState(false)
  const [alive, setAlive] = useState(false)

  const openPanel = (i) => {
    setPanel(i)
    setAlive(true)
    setOpen(true)
  }

  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    const mm = gsap.matchMedia()

    const build = () =>
      mm.add(
        {
          reduced: '(prefers-reduced-motion: reduce)',
          narrow: '(max-width: 1023px)',
          wide: '(min-width: 1024px)',
        },
        (self) => {
          const q = gsap.utils.selector(root)
          const stage = q('[data-pr="stage"]')[0]
          const count = q('[data-pr="count"]')[0]
          if (!stage) return

          if (self.conditions.reduced) {
            if (count) count.textContent = '20'
            return
          }

          const bg = q('[data-vis="bg"]')
          const devices = q('[data-vis="devices"] [data-el="device"]')
          const pills = q('[data-vis="devices"] [data-el="annot"]')
          const rig = q('[data-vis="rig"]')
          const unit = q('[data-vis="rig"] [data-el="unit"]')
          const cards = q('[data-vis="rig"] [data-el="card"]')
          const zoom = q('[data-vis="zoom"]')

          const countTo = { v: 0 }
          if (count) {
            gsap.to(countTo, {
              v: 20,
              duration: 1.6,
              ease: 'power2.out',
              snap: { v: 1 },
              onUpdate: () => {
                count.textContent = String(Math.round(countTo.v))
              },
              scrollTrigger: {
                trigger: count,
                start: 'top 92%',
                once: true,
              },
            })
          }

          if (self.conditions.narrow) {
            q('[data-pr="copy"], [data-vis]').forEach((block) => {
              gsap.from(block, {
                autoAlpha: 0,
                y: 34,
                duration: 0.8,
                ease: 'power2.out',
                scrollTrigger: {
                  trigger: block,
                  start: 'top 84%',
                  toggleActions: 'play none none reverse',
                },
              })
            })
            return
          }

          const ACT = 0.25

          gsap.set(bg, { autoAlpha: 1 })
          gsap.set([devices, pills, unit, cards], { autoAlpha: 0 })
          gsap.set(devices, { x: 70, y: 60 })
          gsap.set(pills, { y: 16 })
          gsap.set(unit, { x: 0, y: 140 })
          gsap.set(cards, { x: -50, y: 40 })
          gsap.set(zoom, { autoAlpha: 0, scale: 0.72, y: 100 })

          const tl = gsap.timeline({
            defaults: { ease: 'none' },
            scrollTrigger: {
              trigger: stage,
              start: 'top top',
              end: 'bottom bottom',
              scrub: scrub(1),
              invalidateOnRefresh: true,
            },
          })

          tl.to(bg, { autoAlpha: 0, duration: ACT * 0.55, ease: 'power1.in' }, ACT * 0.52)

          tl.to(
            devices,
            {
              autoAlpha: 1,
              x: 0,
              y: 0,
              duration: ACT * 0.5,
              ease: 'power2.out',
              stagger: ACT * 0.07,
            },
            ACT * 1.15,
          )

          tl.to(
            pills,
            {
              autoAlpha: 1,
              y: 0,
              duration: ACT * 0.3,
              ease: 'power2.out',
              stagger: ACT * 0.06,
            },
            ACT * 1.75,
          )

          tl.to(
            [pills, devices],
            { autoAlpha: 0, duration: ACT * 0.5, ease: 'power1.in' },
            ACT * 2.22,
          )

          tl.to(
            unit,
            { autoAlpha: 1, x: 0, y: 0, duration: ACT * 0.68, ease: 'power2.out' },
            ACT * 2.16,
          )
          tl.to(
            cards,
            {
              autoAlpha: 1,
              x: 0,
              y: 0,
              duration: ACT * 0.6,
              ease: 'power2.out',
              stagger: ACT * 0.12,
            },
            ACT * 2.4,
          )

          tl.to(
            cards,
            { autoAlpha: 0, duration: ACT * 0.34, ease: 'power1.in', stagger: ACT * 0.06 },
            ACT * 2.94,
          )
          tl.to(unit, { autoAlpha: 0, duration: ACT * 0.4, ease: 'power1.in' }, ACT * 3.1)

          tl.to(zoom, { autoAlpha: 1, y: 0, duration: ACT * 0.5, ease: 'power1.out' }, ACT * 3.6)
          tl.to(zoom, { scale: 1.18, duration: ACT * 1.2, ease: 'none' }, ACT * 3.4)

          tl.set({}, {}, 1)

          if (import.meta.env.DEV) window.__prTl = tl
        },
        root,
      )

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

  return (
    <section
      ref={rootRef}
      id="process"
      aria-label="My process"
      className="relative z-[4] w-full bg-black"
    >
      <div data-pr="stage" className="relative">
        <div data-pr="pane">
          <div data-pr="visual" data-vis="bg">
            <img src={PROCESS_BG} alt="" aria-hidden="true" loading="lazy" decoding="async" />
          </div>

          <div data-pr="visual" data-vis="devices">
            <div data-el="row">
              {DEVICES.map((d) => (
                <figure
                  key={d.file}
                  data-el="device"
                  data-tile={d.tile ? '' : undefined}
                  style={{ '--dy': d.dy }}
                >
                  <img src={`${IMG}${d.file}`} alt={d.alt} loading="lazy" decoding="async" />
                </figure>
              ))}

              {DEVICE_PILLS.map((p) => (
                <span
                  key={p.label}
                  data-el="annot"
                  aria-hidden="true"
                  style={{ '--x': `${p.x}%`, '--y': `${p.y}%` }}
                >
                  <span data-el="annot-inner">
                    <Pill data-el="pill">{p.label}</Pill>
                    <span data-el="marker">
                      <span data-el="marker-core" />
                    </span>
                  </span>
                </span>
              ))}
            </div>
          </div>

          <div data-pr="visual" data-vis="rig">
            <div data-el="rig-inner">
              <figure data-el="unit">
                <img
                  src={`${IMG}system_unit_white.webp`}
                  alt="The machine the work is built on"
                  loading="lazy"
                  decoding="async"
                />
              </figure>

              <div data-el="cards">
                <GraphCard data-el="card" data-slot="main" />
                <StatCard data-el="card" data-slot="stat" />
              </div>
            </div>
          </div>

          <div data-pr="visual" data-vis="zoom">
            <img src={PROCESS_BG} alt="" aria-hidden="true" loading="lazy" decoding="async" />
          </div>
        </div>

        <div data-pr="flow">
          <div data-pr="copy" data-copy="1">
            <Header
              eyebrow="My process"
              heading="From first sketch to shipped build"
              sub="Four stages, the same every time — research, design, build, refine. The discipline does not change with the budget, whether it is a landing page or a full product launch."
              arrow
            />
          </div>

          <div data-pr="copy" data-copy="2">
            <ActCopy
              eyebrow="Design & prototype"
              lead="Research becomes wireframes, wireframes become interfaces — every screen drawn, then tested on the devices it will actually live on."
              cta="More Design Insights"
              onCta={() => openPanel(0)}
            />
          </div>

          <div data-pr="copy" data-copy="3">
            <ActCopy
              eyebrow="Build & ship"
              lead="Code is written, reviewed and measured — then shipped, watched and maintained long after launch day."
              cta="More Development Insights"
              onCta={() => openPanel(1)}
            />
          </div>

          <div data-pr="copy" data-copy="4">
            <Header
              eyebrows={['The result', 'Battle-tested']}
              heading="Builds that perform a year later"
            />
          </div>
        </div>
      </div>

      {alive && (
        <ProcessModal
          panel={panel}
          open={open}
          onPanel={setPanel}
          onClose={() => setOpen(false)}
          onClosed={() => setAlive(false)}
        />
      )}
    </section>
  )
}
