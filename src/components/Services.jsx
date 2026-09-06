// Services section

import { useEffect, useRef, lazy, Suspense } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Pill } from './Process'
const ScrollLine = lazy(() => import('./ScrollLine'))

gsap.registerPlugin(ScrollTrigger)

function CodeIcon() {
  return (
    <svg
      viewBox="0 0 126 129"
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M72.91 75.44 83.35 65.00 72.91 54.57" />
      <path d="M52.91 54.57 42.48 65.00 52.91 75.44" />
      <path d="M66.57 54.11 59.61 76.72" />
    </svg>
  )
}

function ChartIcon() {
  return (
    <svg
      viewBox="0 0 126 129"
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M51 78V71" />
      <path d="M59 78V67" />
      <path d="M67 78V60" />
      <path d="M75 78V51" />
    </svg>
  )
}

const CARDS = [
  {
    pill: 'Development',
    title: 'Interfaces built to ship and last',
    icon: <CodeIcon />,
  },
  {
    pill: 'Performance',
    title: 'Speed that holds on real devices',
    icon: <ChartIcon />,
  },
]

export default function Services() {
  const rootRef = useRef(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    const mm = gsap.matchMedia()

    const build = () =>
      mm.add(
        {
          reduced: '(prefers-reduced-motion: reduce)',
          motion: '(prefers-reduced-motion: no-preference)',
        },
        (self) => {
          if (self.conditions.reduced) return

          const q = gsap.utils.selector(root)
          const head = q('[data-sv="reveal"]')
          const cards = q('[data-sv="card"]')
          const grid = q('[data-sv="grid"]')[0]

          gsap.from(head, {
            autoAlpha: 0,
            y: 28,
            duration: 0.8,
            ease: 'power2.out',
            stagger: 0.1,
            scrollTrigger: {
              trigger: head[0]?.parentElement ?? root,
              start: 'top 84%',
              toggleActions: 'play none none reverse',
            },
          })

          if (grid) {
            gsap.from(cards, {
              autoAlpha: 0,
              y: 40,
              duration: 0.85,
              ease: 'power3.out',
              stagger: 0.14,
              scrollTrigger: {
                trigger: grid,
                start: 'top 88%',
                toggleActions: 'play none none reverse',
              },
            })
          }
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
      id="services"
      aria-labelledby="services-heading"
      className="relative z-[5] w-full bg-surface pb-[var(--section-padding-y)] pt-0"
    >
      <div
        className="mx-auto w-full max-w-[var(--max-content-width)]
                   px-[var(--page-padding-x)]"
      >
        <Suspense
          fallback={
            <div data-ln="root" aria-hidden="true">
              <div data-ln="mask" />
              <canvas data-ln="mouse" />
            </div>
          }
        >
          <ScrollLine />
        </Suspense>

        <div className="mx-auto flex max-w-[var(--sv-head-w)] flex-col items-center text-center">
          <h2
            id="services-heading"
            data-sv="reveal"
            className="m-0 font-heading text-[length:var(--sv-head-size)] font-bold
                       leading-[0.98] tracking-[-0.035em] text-primary"
          >
            What I bring to the build
          </h2>

          <p
            data-sv="reveal"
            className="m-0 mt-[var(--sv-sub-gap)] max-w-[var(--sv-sub-w)] font-body
                       text-[length:var(--sv-sub-size)] font-light leading-[1.35] text-primary/75"
          >
            Two halves of the same job — the interface people feel, and the engineering that keeps
            it standing.
          </p>
        </div>

        <div data-sv="row" className="mt-[var(--sv-grid-gap)]">
          <div data-sv="grid">
            {CARDS.map((card) => (
              <article key={card.pill} data-sv="card">
                <div data-sv="icon">{card.icon}</div>

                <div data-sv="body">
                  <Pill>{card.pill}</Pill>

                  <h3
                    className="m-0 font-heading text-[length:var(--sv-card-title)]
                               font-normal leading-[1.066] tracking-[-0.04em] text-primary"
                  >
                    {card.title}
                  </h3>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
