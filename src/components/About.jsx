// About section

import { Fragment, useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Pill } from './Process'

gsap.registerPlugin(ScrollTrigger)

const HEADING = 'I build both halves of the product.'

const BODY = [
  'I write custom code,',
  { card: 0 },
  'design the interface it wears, ship it on whatever',
  { card: 1 },
  'stack suits you — then keep the whole',
  { card: 2 },
  'thing running long after launch. End to end.',
]

const CARDS = [
  {
    Mark: VSCodeMark,
    label: 'Visual Studio Code',
    title: 'Engineering',
    body: 'Custom code where it earns its place, WordPress or a CMS where it saves you time.',
  },
  {
    Mark: InterfaceMark,
    label: 'Interface design',
    title: 'Interface',
    body: 'Research, wireframes, then UI drawn to the pixel — the UX decided before a line exists.',
  },
  {
    Mark: GearMark,
    label: 'Operations',
    title: 'Operations',
    body: 'Deploys, handover and the ongoing care that decides whether it is still up in a year.',
  },
]

const PERSPECTIVE = 1200
const zForScale = (scale) => PERSPECTIVE * (1 - 1 / scale)

function VSCodeMark(props) {
  return (
    <svg
      viewBox="-1.3 -1.3 26.6 26.6"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <path d="M23.15 2.587 18.21.21a1.494 1.494 0 0 0-1.705.29l-9.46 8.63-4.12-3.128a.999.999 0 0 0-1.276.057L.327 7.261A1 1 0 0 0 .326 8.74L3.899 12 .326 15.26a1 1 0 0 0 .001 1.479L1.65 17.94a.999.999 0 0 0 1.276.057l4.12-3.128 9.46 8.63a1.492 1.492 0 0 0 1.704.29l4.942-2.377A1.5 1.5 0 0 0 24 20.06V3.939a1.5 1.5 0 0 0-.85-1.352zm-5.146 14.861L10.826 12l7.178-5.448v10.896z" />
    </svg>
  )
}

function InterfaceMark(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <rect x="2.6" y="3.4" width="11" height="11" rx="3" />
      <path d="M5.9 7.2h4.4M5.9 10.4h2.6" />
      <path d="m13.1 12.9 8.4 3.6-3.9 1.4-1.4 3.9z" fill="currentColor" stroke="none" />
    </svg>
  )
}

function GearMark(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
        <rect
          key={angle}
          x="10.8"
          y="2.2"
          width="2.4"
          height="3.2"
          rx="1.2"
          fill="currentColor"
          stroke="none"
          transform={`rotate(${angle} 12 12)`}
        />
      ))}
      <circle cx="12" cy="12" r="7.1" />
      <circle cx="12" cy="12" r="2.5" fill="currentColor" stroke="none" />
    </svg>
  )
}

function Caret(props) {
  return (
    <svg viewBox="0 0 8 6" aria-hidden="true" focusable="false" {...props}>
      <path d="M0 0h8L4 6z" fill="currentColor" />
    </svg>
  )
}

function InlineCard({ Mark, label, title, body }) {
  return (
    <span data-about="bword" data-card="wrap">
      <button type="button" aria-label={`${title} — ${label}`} aria-expanded="false">
        <Mark data-card="mark" />
        <Caret data-card="caret" />
      </button>

      <span data-card="panel">
        <span data-card="head">
          <Mark data-card="mark" />
          <Caret data-card="caret" />
        </span>

        <span data-card="text">
          <span role="heading" aria-level={3} data-card="title">
            {title}
          </span>
          <span data-card="body">{body}</span>
        </span>
      </span>
    </span>
  )
}

function words(text, name, className) {
  return text.split(' ').map((word, i) => (
    <Fragment key={`${name}-${i}`}>
      {i > 0 && ' '}
      <span data-about={name} className={className}>
        {word}
      </span>
    </Fragment>
  ))
}

const BODY_TOKENS = BODY.flatMap((part) =>
  typeof part === 'string'
    ? part.split(' ').map((word) => ({ word }))
    : [{ card: CARDS[part.card] }],
)

export default function About() {
  const rootRef = useRef(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    const mm = gsap.matchMedia()

    mm.add(
      {
        reduced: '(prefers-reduced-motion: reduce)',
        narrow: '(max-width: 1023px)',
        wide: '(min-width: 1024px)',
      },
      (self) => {
        const { reduced, narrow } = self.conditions
        if (reduced) return

        const q = gsap.utils.selector(root)
        const stage = q('[data-about="stage"]')[0]
        const rig = q('[data-about="rig"]')[0]
        const group = q('[data-about="group"]')[0]
        const heading = q('[data-about="heading"]')[0]
        const plane = q('[data-about="eyebrow"], [data-about="hword"]')
        const bWords = q('[data-about="bword"]')
        if (!stage || !rig || !group || !heading) return

        gsap.fromTo(
          rig,
          { y: () => -window.innerHeight },
          {
            y: 0,
            ease: 'none',
            scrollTrigger: {
              trigger: stage,
              start: 'top bottom',
              end: 'top top',
              scrub: true,
              invalidateOnRefresh: true,
            },
          },
        )

        const startScale = narrow ? 3.4 : 5.5
        const blur = narrow ? 10 : 20
        const fringe = narrow ? 2 : 6

        const settle = () => gsap.utils.clamp(20, 64, window.innerHeight * 0.06)

        gsap.set(group, {
          z: zForScale(startScale),
          rotateX: narrow ? 4 : 7,
          filter: `blur(${blur}px)`,
        })
        gsap.set(plane, { opacity: 0 })
        gsap.set(bWords, { autoAlpha: 0, yPercent: 60 })

        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: stage,
            start: 'top bottom',
            end: 'bottom bottom',
            scrub: true,
            invalidateOnRefresh: true,
          },
        })

        tl.to(group, { z: 0, duration: 0.46, ease: 'power1.inOut' }, 0.05)
          .to(group, { rotateX: 0, duration: 0.46, ease: 'power1.out' }, 0.05)

          .to(plane, { opacity: 1, duration: 0.05, stagger: 0.014 }, 0.05)

          .to(group, { filter: 'blur(0px)', duration: 0.3, ease: 'power2.out' }, 0.06)
          .set(group, { filter: 'none' }, 0.4)

          .fromTo(
            heading,
            { '--about-fringe': `${fringe}px` },
            {
              '--about-fringe': '0px',
              duration: 0.18,
              ease: 'power2.out',
              immediateRender: true,
            },
            0.34,
          )

          .fromTo(
            group,
            { y: settle },
            { y: 0, duration: 0.14, ease: 'power2.out', immediateRender: true },
            0.46,
          )

          .to(
            bWords,
            {
              autoAlpha: 1,
              yPercent: 0,
              duration: 0.055,
              ease: 'power2.out',
              stagger: 0.4 / Math.max(bWords.length - 1, 1),
            },
            0.5,
          )

          .set({}, {}, 1)

        if (import.meta.env.DEV) window.__aboutTl = tl
      },
      root,
    )

    return () => mm.revert()
  }, [])

  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    const wraps = [...root.querySelectorAll('[data-card="wrap"]')]
    const MARGIN = 16
    const coarse = window.matchMedia('(hover: none)')

    const place = (wrap) => {
      const styles = window.getComputedStyle(wrap)
      const cardW = parseFloat(styles.getPropertyValue('--about-card-w'))
      const cardH = parseFloat(styles.getPropertyValue('--about-card-h'))
      if (!cardW || !cardH) return

      const chip = wrap.getBoundingClientRect()
      const midX = chip.left + chip.width / 2
      const midY = chip.top + chip.height / 2

      const overLeft = MARGIN - (midX - cardW / 2)
      const overRight = midX + cardW / 2 - (window.innerWidth - MARGIN)
      const overTop = MARGIN - (midY - cardH / 2)
      const overBottom = midY + cardH / 2 - (window.innerHeight - MARGIN)

      const dx = overLeft > 0 ? overLeft : Math.min(0, -overRight)
      const dy = overTop > 0 ? overTop : Math.min(0, -overBottom)

      wrap.style.setProperty('--about-card-dx', `${Math.round(dx)}px`)
      wrap.style.setProperty('--about-card-dy', `${Math.round(dy)}px`)
    }

    const close = (wrap) => {
      wrap.removeAttribute('data-open')
      const button = wrap.querySelector('button')
      button?.setAttribute('aria-expanded', 'false')
      button?.blur()
    }

    const closeAll = () => wraps.forEach(close)

    const onEnter = (event) => place(event.currentTarget)

    const onClick = (event) => {
      if (!coarse.matches) return
      const wrap = event.currentTarget
      const wasOpen = wrap.hasAttribute('data-open')
      closeAll()
      if (wasOpen) return
      place(wrap)
      wrap.setAttribute('data-open', '')
      wrap.querySelector('button')?.setAttribute('aria-expanded', 'true')
    }

    const onOutside = (event) => {
      if (!event.target.closest?.('[data-card="wrap"]')) closeAll()
    }

    const onKey = (event) => {
      if (event.key === 'Escape') closeAll()
    }

    wraps.forEach((wrap) => {
      wrap.addEventListener('pointerenter', onEnter)
      wrap.addEventListener('focusin', onEnter)
      wrap.addEventListener('click', onClick)
    })
    document.addEventListener('pointerdown', onOutside)
    document.addEventListener('keydown', onKey)

    return () => {
      wraps.forEach((wrap) => {
        wrap.removeEventListener('pointerenter', onEnter)
        wrap.removeEventListener('focusin', onEnter)
        wrap.removeEventListener('click', onClick)
      })
      document.removeEventListener('pointerdown', onOutside)
      document.removeEventListener('keydown', onKey)
    }
  }, [])

  return (
    <section ref={rootRef} id="about" aria-label="About" className="relative z-[1] w-full bg-white">
      <div data-about="stage" className="relative h-[calc(100svh+var(--about-runway))]">
        <div className="initial-about-mobile-height sticky top-0 h-svh w-full">
          <div data-about="rig" className="absolute inset-0 overflow-hidden">
            <div
              className="absolute inset-0 grid place-items-center page-x"
              style={{ perspective: `${PERSPECTIVE}px` }}
            >
              <div
                data-about="group"
                className="w-full max-w-[var(--max-content-width)] text-center"
              >
                <p data-about="eyebrow" className="m-0 mb-[clamp(16px,2.6svh,36px)]">
                  <Pill>About</Pill>
                </p>

                <h2
                  data-about="heading"
                  className="mx-auto m-0 max-w-[17ch] font-heading
                             text-[length:var(--about-heading-size)] font-bold
                             leading-[1.02] tracking-[-0.03em] text-primary"
                >
                  {words(HEADING, 'hword', 'inline-block')}
                </h2>

                <p
                  className="mx-auto m-0 mt-[clamp(20px,3.6svh,48px)] max-w-[32ch]
                             font-heading text-[length:var(--about-body-size)] font-bold
                             leading-[1.32] tracking-[-0.02em] text-primary"
                >
                  {BODY_TOKENS.map((token, i) => (
                    <Fragment key={`t-${i}`}>
                      {i > 0 && ' '}
                      {token.card ? (
                        <InlineCard {...token.card} />
                      ) : (
                        <span data-about="bword" className="relative z-[1] inline-block">
                          {token.word}
                        </span>
                      )}
                    </Fragment>
                  ))}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
