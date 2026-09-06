// FAQ section

import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Pill } from './Process'
import { HeroCta } from './Hero'
import { BOOKING } from './booking'

gsap.registerPlugin(ScrollTrigger)

const TABS = [
  {
    id: 'general',
    label: 'General',
    items: [
      {
        q: 'What kind of work do you take on?',
        a: 'End-to-end web builds — marketing sites, web apps, and the interface layer over an existing backend. Designed and developed by the same person, so nothing is lost between the two.',
      },
      {
        q: 'Custom build or WordPress — which one do I need?',
        a: 'Whichever one you will actually be able to live with. Custom code gives you exactly what was designed; a CMS gives you speed and a dashboard you can edit without me. I will tell you honestly which fits.',
      },
      {
        q: 'How long does a typical project take?',
        a: 'A focused marketing site runs three to five weeks. A full product build with custom motion and 3D work is usually eight to twelve, scoped properly before anything starts.',
      },
      {
        q: 'What does a project cost?',
        a: 'Fixed price per phase, agreed before work begins. You get the number after a short call — I would rather scope it properly than quote a range that means nothing.',
      },
    ],
  },
  {
    id: 'design',
    label: 'UI/UX Design',
    items: [
      {
        q: 'Are you a designer or a developer?',
        a: 'Both, and that is the whole point. The UI/UX is designed before it is built, by the person who then builds it — so nothing gets drawn that cannot ship, and nothing ships that was never drawn.',
      },
      {
        q: 'Do you design from scratch or work from my files?',
        a: 'Either. If you have a design system I build to it faithfully. If you have a rough idea and a logo, I take it from wireframe through to a finished, responsive design.',
      },
      {
        q: 'Will the design work on every screen size?',
        a: 'Every layout is drawn at mobile, tablet, laptop and desktop before a line of it is built. Responsive is not a pass at the end — it is part of the original decision.',
      },
      {
        q: 'Do you handle motion and interaction design?',
        a: 'Yes, and it is the part I care most about. Scroll behaviour, hover states, page transitions and 3D scenes are designed alongside the layout rather than bolted on after.',
      },
    ],
  },
  {
    id: 'process',
    label: 'Development Process',
    items: [
      {
        q: 'What stack do you build on?',
        a: 'Django and Python behind it, React on the front, Tailwind and Sass for the styling, GSAP and Three.js where motion earns its place. WordPress or a CMS when you need to manage the content yourself.',
      },
      {
        q: 'Do you use AI in your workflow?',
        a: 'Yes — Claude sits in the workflow as a reviewer and a second pair of hands on the unglamorous parts. It makes the work faster; every decision that reaches your build is still mine.',
      },
      {
        q: 'How do you keep me updated while building?',
        a: 'A live staging URL from week one and a short written update at the end of each week. You watch the thing get built instead of waiting for a reveal.',
      },
      {
        q: 'What happens after launch?',
        a: 'Thirty days of included support for anything that surfaces once real traffic arrives, then an optional retainer if you want ongoing changes handled by the person who built it.',
      },
    ],
  },
]

function PlusIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      aria-hidden="true"
      className="h-[var(--fq-icon-glyph)] w-[var(--fq-icon-glyph)]"
    >
      <path d="M4 12h16" />
      <path data-fq="bar" d="M12 4v16" />
    </svg>
  )
}

export default function Faq() {
  const [tab, setTab] = useState(0)
  const [open, setOpen] = useState(null)
  const rootRef = useRef(null)

  const active = TABS[tab]

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
          const head = q('[data-fq="reveal"]')
          const cols = q('[data-fq="rise"]')
          const rows = q('[data-fq="row"]')
          const grid = q('[data-fq="grid"]')[0]
          const panel = q('[data-fq="panel"]')[0]

          gsap.from(head, {
            autoAlpha: 0,
            y: 26,
            duration: 0.8,
            ease: 'power2.out',
            stagger: 0.1,
            scrollTrigger: {
              trigger: head[0]?.parentElement?.parentElement ?? root,
              start: 'top 84%',
              toggleActions: 'play none none reverse',
            },
          })

          if (grid) {
            gsap.from(cols, {
              autoAlpha: 0,
              y: 26,
              duration: 0.8,
              ease: 'power2.out',
              stagger: 0.1,
              scrollTrigger: {
                trigger: grid,
                start: 'top 84%',
                toggleActions: 'play none none reverse',
              },
            })
          }

          if (panel) {
            gsap.from(rows, {
              autoAlpha: 0,
              y: 18,
              duration: 0.7,
              ease: 'power2.out',
              stagger: 0.09,
              scrollTrigger: {
                trigger: panel,
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
      id="faq"
      aria-labelledby="faq-heading"
      className="relative z-[7] w-full bg-surface pb-[var(--section-padding-y)]
                 pt-[var(--wy-top-gap)]"
    >
      <div className="mx-auto w-full max-w-[var(--max-content-width)] page-x">
        <header
          className="flex w-full flex-col items-start gap-[clamp(8px,1.4svh,16px)]
                     md:flex-row md:items-end md:justify-between md:gap-8"
        >
          <div className="flex flex-col items-start gap-[var(--pj-eyebrow-gap)]">
            <Pill data-fq="reveal">FAQ</Pill>

            <h2
              data-fq="reveal"
              id="faq-heading"
              className="m-0 max-w-[15ch] font-heading text-[length:var(--pj-head-size)]
                         font-bold leading-[1.02] tracking-[-0.03em] text-primary"
            >
              Questions, Answered Upfront
            </h2>
          </div>

          <p
            data-fq="reveal"
            className="m-0 max-w-[38ch] font-body text-[length:var(--pj-sub-size)]
                       font-light leading-[1.3] text-primary/65 md:max-w-[24ch]
                       md:text-right lg:max-w-[var(--fq-sub-w)]"
          >
            The things worth knowing before we start — scope, process, and what happens after
            launch.
          </p>
        </header>

        <div
          data-fq="grid"
          className="mt-[var(--fq-grid-top)] grid w-full grid-cols-1
                     gap-[var(--fq-gap)] lg:grid-cols-[35fr_65fr]
                     lg:items-stretch lg:gap-x-[var(--fq-col-gap)]"
        >
          <div className="flex flex-col gap-[var(--fq-gap)]">
            <div
              role="tablist"
              aria-label="FAQ categories"
              data-fq="rise"
              className="flex flex-col gap-[var(--fq-tab-gap)]
                         lg:max-w-[var(--fq-left-w)]"
            >
              {TABS.map((t, i) => (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  id={'faq-tab-' + t.id}
                  aria-selected={i === tab}
                  aria-controls={'faq-panel-' + t.id}
                  data-fq="tab"
                  data-active={i === tab ? '' : undefined}
                  onClick={() => {
                    setTab(i)
                    setOpen(null)
                  }}
                  className="w-full cursor-pointer rounded-md border-none text-left
                             font-body font-bold leading-none
                             text-[length:var(--fq-tab-size)]
                             px-[var(--fq-tab-px)] py-[var(--fq-tab-py)]
                             lg:text-center"
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div
              data-fq="rise"
              className="mt-auto flex flex-col items-start rounded-md bg-white
                         p-[var(--fq-card-p)] lg:max-w-[var(--fq-left-w)]"
            >
              <h3
                className="m-0 font-heading font-semibold leading-[1.1]
                           tracking-[-0.02em] text-primary
                           text-[length:var(--fq-card-title)]"
              >
                Got any questions?
              </h3>

              <p
                className="m-0 mt-[var(--fq-card-gap)] max-w-[38ch] font-body font-light
                           leading-[1.5] text-primary/70
                           text-[length:var(--fq-card-body)]"
              >
                Not seeing your question here? A thirty-minute call is the fastest way to get a
                straight answer on scope, timeline and cost — bring the rough idea and the deadline,
                and you will leave knowing exactly where you stand.
              </p>

              <div className="mt-[var(--fq-card-cta-gap)]">
                <HeroCta {...BOOKING}>Book a Call Now</HeroCta>
              </div>
            </div>
          </div>

          <div
            role="tabpanel"
            data-fq="panel"
            id={'faq-panel-' + active.id}
            aria-labelledby={'faq-tab-' + active.id}
            className="flex flex-col gap-[var(--fq-row-gap)]"
          >
            {active.items.map((item, i) => {
              const isOpen = open === i
              return (
                <div
                  key={item.q}
                  data-fq="row"
                  data-open={isOpen ? '' : undefined}
                  className="w-full rounded-md bg-white"
                >
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="flex w-full cursor-pointer items-center justify-between
                               gap-[var(--fq-q-gap)] border-none bg-transparent text-left
                               p-[var(--fq-row-p)]"
                  >
                    <h4
                      className="m-0 font-heading font-semibold leading-[1.25]
                                 tracking-[-0.02em] text-primary
                                 text-[length:var(--fq-q-size)]"
                    >
                      {item.q}
                    </h4>

                    <span data-fq="icon" aria-hidden="true">
                      <PlusIcon />
                    </span>
                  </button>

                  <div data-fq="answer">
                    <div className="overflow-hidden">
                      <p
                        className="m-0 max-w-[62ch] font-body font-light leading-[1.55]
                                   text-primary/70 text-[length:var(--fq-a-size)]
                                   px-[var(--fq-row-p)] pb-[var(--fq-row-p)]"
                      >
                        {item.a}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
