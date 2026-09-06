// Brands strip inside Projects

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { scrub } from '../hooks/useSmoothScroll'

gsap.registerPlugin(ScrollTrigger)

const BRANDS = [
  {
    name: 'GCRR',
    src: 'gcrr_logo.png',
    lean: 0.5,
    ar: 2.83,
    fit: 73,
    ink: [0.0717, 0.2583, 0.85, 0.5405],
  },
  { name: 'AL', src: 'al_logo_white.svg', lean: 0, ar: 10.07, fit: 82, ink: [0, 0, 1, 1] },
  {
    name: 'NA',
    src: 'NA_brand.png',
    lean: 1,
    ar: 2.8,
    fit: 73,
    ink: [0.1167, 0.2226, 0.7667, 0.5449],
  },
  {
    name: 'DF',
    src: 'df_logo.webp',
    lean: 0.38,
    ar: 1.32,
    fit: 57.9,
    ink: [0.015, 0.036, 0.97, 0.928],
  },
  {
    name: 'PRD',
    src: 'prd_brand.png',
    lean: 0.06,
    ar: 2.7,
    fit: 70,
    ink: [0.1454, 0.3691, 0.7092, 0.2617],
  },
  {
    name: 'DCO',
    src: 'dco_logo.png',
    lean: 0.94,
    ar: 4.69,
    fit: 82,
    ink: [0.0775, 0.188, 0.845, 0.6154],
  },
  {
    name: 'Highland',
    src: 'highland_brand_white.svg',
    lean: 0.28,
    ar: 2.65,
    fit: 82,
    ink: [0.105, 0.3508, 0.7917, 0.2983],
  },
  {
    name: 'SAS',
    src: 'sas_logo.png',
    lean: 0.62,
    ar: 1.4,
    fit: 69.1,
    ink: [0.06, 0.0956, 0.8817, 0.6673],
  },
  {
    name: 'RTE',
    src: 'rte_brand.png',
    lean: 0,
    ar: 2.85,
    fit: 70,
    ink: [0.1875, 0.395, 0.6075, 0.2125],
  },
  { name: 'AF', src: 'af_logo.png', lean: 1, ar: 13.81, fit: 82, ink: [0.05, 0.2917, 0.9, 0.4063] },
]

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

        q('[data-bd="logo"]').forEach((el) => {
          gsap.fromTo(
            el,
            { autoAlpha: 0, y: () => window.innerHeight * 0.0488, filter: 'blur(12px)' },
            {
              autoAlpha: 1,
              y: 0,
              filter: 'blur(0px)',
              ease: 'power2.out',
              immediateRender: true,
              scrollTrigger: {
                trigger: el,
                start: 'top 92%',
                end: 'top 62%',
                scrub: scrub(0.8),
                invalidateOnRefresh: true,
              },
            },
          )
        })

        gsap.fromTo(
          q('[data-bd="title"]'),
          { autoAlpha: 0, y: 26 },
          {
            autoAlpha: 1,
            y: 0,
            ease: 'power2.out',
            immediateRender: true,
            scrollTrigger: {
              trigger: root,
              start: 'top bottom',
              end: 'top 40%',
              scrub: scrub(0.8),
              invalidateOnRefresh: true,
            },
          },
        )
      },
    )

    return () => mm.revert()
  }, [])

  return (
    <div
      ref={rootRef}
      data-bd="root"
      className="relative w-full px-[var(--pj-gutter)] pt-[var(--bd-lead)] pb-[var(--bd-tail)]"
    >
      <div className="mx-auto w-full max-w-[var(--pj-max-w)]">
        <div data-bd="track" className="relative">
          <div className="pointer-events-none sticky top-[50svh] z-[2] h-0">
            <div className="-translate-y-1/2">
              <h2
                data-bd="title"
                className="m-0 mx-auto max-w-[var(--bd-title-w)] text-center font-heading
                           text-[length:var(--bd-title-size)] font-bold leading-[1.02]
                           tracking-[-0.03em] text-white"
              >
                Companies I’ve Worked With
              </h2>
            </div>
          </div>

          <ul
            className="relative z-[1] m-0 flex list-none flex-col gap-[var(--bd-gap)]
                       p-0 pt-[var(--bd-gap)]"
          >
            {BRANDS.map((b) => (
              <li key={b.name} className="flex w-full items-center">
                <div aria-hidden="true" style={{ flexGrow: b.lean }} />

                <div
                  data-bd="logo"
                  className="flex aspect-[0.93/1] w-[var(--bd-card-w)] shrink-0
                             items-center justify-center border
                             border-[var(--bd-card-line)] bg-[var(--bd-card-bg)]"
                >
                  <div
                    className="relative overflow-hidden"
                    style={{ width: `${b.fit}%`, aspectRatio: `${b.ar}` }}
                  >
                    <img
                      src={`${import.meta.env.BASE_URL}images/logo/brands/${b.src}`}
                      alt={`${b.name} logo`}
                      loading="lazy"
                      decoding="async"
                      draggable="false"
                      className="pointer-events-none absolute left-0 top-0 h-auto max-w-none"
                      style={{
                        width: `${(100 / b.ink[2]).toFixed(3)}%`,
                        transform: `translate(${(-b.ink[0] * 100).toFixed(3)}%, ${(-b.ink[1] * 100).toFixed(3)}%)`,
                      }}
                    />
                  </div>
                </div>

                <div aria-hidden="true" style={{ flexGrow: 1 - b.lean }} />
              </li>
            ))}
          </ul>

          <div aria-hidden="true" className="h-[var(--bd-hold-out)]" />
        </div>
      </div>
    </div>
  )
}
