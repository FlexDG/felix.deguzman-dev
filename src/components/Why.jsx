// Why section

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Pill } from './Process'

gsap.registerPlugin(ScrollTrigger)

const ROWS = [
  {
    title: 'Design and code, one person',
    note: 'The person drawing the interface is the one building it, so nothing is lost in a handover.',
  },
  {
    title: 'Custom or CMS, your call',
    note: 'Hand-written code where it earns its place, a CMS where you need to run the site yourself.',
  },
  {
    title: 'Responsive by default',
    note: 'Phones, tablets and laptops are designed in the same pass as the desktop, not retrofitted after it.',
  },
  {
    title: 'Motion with intent',
    note: 'Nothing moves unless the movement carries meaning — and every transition has a reduced-motion path.',
  },
  {
    title: 'Shipped, then maintained',
    note: 'Deploys, updates and the quiet fixes after launch are part of the job, not a separate invoice.',
  },
]

export default function Why() {
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
          const head = q('[data-wy="reveal"]')
          const rows = q('[data-wy="row"]')
          const list = q('[data-wy="list"]')[0]

          gsap.from(head, {
            autoAlpha: 0,
            y: 26,
            duration: 0.8,
            ease: 'power2.out',
            stagger: 0.1,
            scrollTrigger: {
              trigger: head[0]?.parentElement ?? root,
              start: 'top 84%',
              toggleActions: 'play none none reverse',
            },
          })

          if (list) {
            gsap.from(rows, {
              autoAlpha: 0,
              y: 18,
              duration: 0.7,
              ease: 'power2.out',
              stagger: 0.09,
              scrollTrigger: {
                trigger: list,
                start: 'top 86%',
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
      id="why"
      aria-labelledby="why-heading"
      className="relative z-[6] w-full bg-surface pb-[var(--section-padding-y)]
                 pt-[var(--wy-top-gap)]"
    >
      <div
        className="mx-auto w-full max-w-[var(--max-content-width)]
                   px-[var(--page-padding-x)]"
      >
        <div className="flex max-w-[var(--wy-head-w)] flex-col items-start text-left">
          <span data-wy="reveal">
            <Pill>The difference</Pill>
          </span>

          <h2
            id="why-heading"
            data-wy="reveal"
            className="m-0 mt-[var(--wy-pill-gap)] font-heading
                       text-[length:var(--wy-head-size)] font-bold leading-[0.98]
                       tracking-[-0.035em] text-primary"
          >
            Why the work holds up after launch day
          </h2>
        </div>

        <ol data-wy="list" className="m-0 mt-[var(--wy-list-gap)] list-none p-0">
          {ROWS.map((row, i) => (
            <li key={row.title} data-wy="row">
              <span data-wy="num" aria-hidden="true">
                {String(i + 1).padStart(2, '0')}
              </span>

              <h3
                className="m-0 font-heading text-[length:var(--wy-title-size)]
                           font-semibold leading-[1.15] tracking-[-0.02em] text-primary"
              >
                {row.title}
              </h3>

              <p
                className="m-0 font-body text-[length:var(--wy-note-size)] font-light
                           leading-[1.4] tracking-[-0.01em] text-primary/75"
              >
                {row.note}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
