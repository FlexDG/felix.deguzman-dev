// About Me section

import { Fragment, useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import AboutMedia from './AboutMedia'
import { Pill } from './Process'
import {
  CSharpMark,
  PlayStationMark,
  RunningShoeMark,
  SketchbookMark,
  SpotifyMark,
  TailwindMark,
  WordPressMark,
} from './AboutMarks'

gsap.registerPlugin(ScrollTrigger)

const EYEBROW = 'The person'

const COPY =
  "Hi — I'm Felix. A developer who cares about clean interfaces, thoughtful experiences, and the details nobody is meant to notice."

const ORBIT = [
  { Mark: SketchbookMark, label: 'Sketchbook', phrase: 'Everything starts here' },
  { Mark: TailwindMark, label: 'Tailwind CSS', phrase: 'Styling without leaving markup' },
  { Mark: PlayStationMark, label: 'PlayStation 5', phrase: 'Where evenings go' },
  { Mark: CSharpMark, label: 'C#', phrase: 'Where I started out' },
  { Mark: RunningShoeMark, label: 'Running', phrase: 'Debugging at sunrise' },
  { Mark: WordPressMark, label: 'WordPress', phrase: 'Client sites that last' },
  { Mark: SpotifyMark, label: 'Spotify', phrase: 'Always something playing' },
]

const SPIN_SECONDS = 22

const RAIL_SECONDS = 16

const ANGLES = ORBIT.map((_, i) => (360 / ORBIT.length) * i)

function words(text) {
  return text.split(' ').map((word, i) => (
    <Fragment key={`w-${i}`}>
      {i > 0 && ' '}
      <span data-me="word">{word}</span>
    </Fragment>
  ))
}

export default function AboutMe() {
  const rootRef = useRef(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    const mm = gsap.matchMedia()

    mm.add(
      {
        reduced: '(prefers-reduced-motion: reduce)',
        ok: '(prefers-reduced-motion: no-preference)',
        narrow: '(max-width: 1023px)',
      },
      (self) => {
        const { reduced, narrow } = self.conditions
        if (reduced) return

        const q = gsap.utils.selector(root)
        const stage = q('[data-me="stage"]')[0]
        const dome = q('[data-me="dome"]')[0]
        const portrait = q('[data-me="portrait"]')[0]
        const veil = q('[data-me="veil"]')[0]
        const eyebrow = q('[data-me="eyebrow"]')[0]
        const wordEls = q('[data-me="word"]')
        const pulse = q('[data-me="pulse"]')[0]
        if (!stage || !dome || !portrait || !veil) return

        gsap.set(dome, { yPercent: 75 })

        const hiddenYPercent = () => {
          const pane = portrait.closest('[data-me="pane"]')
          const box = portrait.getBoundingClientRect()
          if (!pane || !box.height) return 60
          return ((pane.getBoundingClientRect().bottom - box.top) / box.height) * 100 + 2
        }

        gsap.set(portrait, {
          yPercent: narrow ? hiddenYPercent() : 100,
          xPercent: narrow ? -26 : -22,
        })
        gsap.set(veil, { yPercent: 55 })
        gsap.set(eyebrow, { autoAlpha: 0, y: 16 })
        if (pulse) gsap.set(pulse, { '--me-pulse-gate': 0 })
        gsap.set(wordEls, { opacity: 'var(--me-ghost)' })

        const tlIn = gsap.timeline({ paused: true })

        let rechecked = false

        const play = () => tlIn.play()
        const land = () => tlIn.progress(1).pause()
        const arm = () => tlIn.pause(0)
        const armed = () => !tlIn.isActive() && tlIn.progress() === 0

        tlIn
          .to(dome, { yPercent: 0, duration: 1.15, ease: 'expo.out' }, 0)

          .to(portrait, { yPercent: 0, xPercent: 0, duration: 1.25, ease: 'expo.out' }, 0.35)

          .to(eyebrow, { autoAlpha: 1, y: 0, duration: 0.7, ease: 'power2.out' }, 0.5)

          .to(veil, { yPercent: 0, duration: 0.95, ease: 'expo.out' }, 0.85)

        if (pulse) {
          tlIn.to(pulse, { '--me-pulse-gate': 1, duration: 0.95, ease: 'power2.out' }, 0.85)
        }

        ScrollTrigger.create({
          trigger: stage,
          start: narrow ? 'top 57%' : 'top 35%',
          end: 'bottom top',

          onEnter: () => {
            const line = window.innerHeight * (narrow ? 0.57 : 0.35)
            if (!rechecked && stage.getBoundingClientRect().top > line + 1) {
              rechecked = true
              requestAnimationFrame(() => ScrollTrigger.refresh())
              return
            }
            play()
          },

          onEnterBack: () => armed() && land(),
          onLeave: () => armed() && land(),
          onRefresh: (self) => {
            if (self.progress > 0 && armed()) land()
          },
        })

        ScrollTrigger.create({
          trigger: stage,
          start: 'top bottom',
          end: 'bottom top',
          onLeaveBack: () => arm(),
        })

        const WINDOW = 0.78
        const step = WINDOW / Math.max(wordEls.length - 1, 1)

        const tlType = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: stage,
            start: 'top top',
            end: () =>
              `+=${Math.max(
                1,
                stage.offsetHeight -
                  window.innerHeight -
                  (parseFloat(getComputedStyle(root).getPropertyValue('--me-cover-tail')) || 0),
              )}`,
            scrub: true,
            invalidateOnRefresh: true,
          },
        })

        tlType
          .to(wordEls, { opacity: 1, duration: step * 1.35, stagger: step }, 0.06)

          .set({}, {}, 1)

        if (import.meta.env.DEV) {
          window.__meIn = tlIn
          window.__meType = tlType
        }
      },
      root,
    )

    return () => mm.revert()
  }, [])

  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    const mmw = gsap.matchMedia()

    mmw.add(
      {
        wide: '(min-width: 768px)',
        still: '(prefers-reduced-motion: reduce)',
        coarse: '(hover: none)',
      },
      (self) => {
        const { wide, still } = self.conditions
        if (!wide) return

        const q = gsap.utils.selector(root)
        const hot = q('[data-me="right"]')[0]
        const left = q('[data-me="left"]')[0]
        const dome = q('[data-me="dome"]')[0]
        const veil = q('[data-me="veil"]')[0]
        const veilHit = q('[data-me="veil-hit"]')[0]
        const portrait = q('[data-me="portrait"]')[0]
        const wrap = q('[data-me="orbit-wrap"]')[0]
        const orbit = q('[data-me="orbit"]')[0]
        const uprights = q('[data-orbit="upright"]')
        const nudges = q('[data-orbit="nudge"]')
        if (!hot || !left || !dome || !veil || !veilHit || !portrait || !wrap || !orbit) return

        const coarse = window.matchMedia('(hover: none)')

        gsap.set(uprights, { xPercent: -50, yPercent: -50, rotation: (i) => -ANGLES[i] })

        const spin = gsap.timeline({ repeat: still ? 0 : -1, paused: true })
        if (!still) {
          spin
            .to(orbit, { rotation: 360, duration: SPIN_SECONDS, ease: 'none' }, 0)
            .to(
              uprights,
              { rotation: (i) => -ANGLES[i] - 360, duration: SPIN_SECONDS, ease: 'none' },
              0,
            )
        }

        gsap.set(orbit, { autoAlpha: 0, scale: 0.86 })

        let open = false

        const show = () => {
          if (open) return
          open = true

          const cs = window.getComputedStyle(root)
          const leftX = parseFloat(cs.getPropertyValue('--me-hover-left-x')) || 0
          const domeX = parseFloat(cs.getPropertyValue('--me-hover-dome-x')) || 0
          const veilX = parseFloat(cs.getPropertyValue('--me-hover-veil-x')) || 0
          const mediaY = parseFloat(cs.getPropertyValue('--me-hover-media-y')) || 0

          gsap.to(left, { x: leftX, duration: 0.85, ease: 'power3.out', overwrite: 'auto' })
          gsap.to(dome, { x: domeX, duration: 0.85, ease: 'power3.out', overwrite: 'auto' })
          gsap.to(veil, { x: veilX, duration: 0.85, ease: 'power3.out', overwrite: 'auto' })
          gsap.to(portrait, { y: mediaY, duration: 0.85, ease: 'power3.out', overwrite: 'auto' })
          gsap.to(orbit, {
            autoAlpha: 1,
            scale: 1,
            duration: 0.5,
            ease: 'power3.out',
            overwrite: 'auto',
          })

          spin.play()
        }

        const hide = () => {
          if (!open) return
          open = false

          gsap.to([left, dome, veil], {
            x: 0,
            duration: 0.7,
            ease: 'power3.out',
            overwrite: 'auto',
          })
          gsap.to(portrait, { y: 0, duration: 0.7, ease: 'power3.out', overwrite: 'auto' })
          gsap.to(orbit, {
            autoAlpha: 0,
            scale: 0.86,
            duration: 0.32,
            ease: 'power2.in',
            overwrite: 'auto',
            onComplete: () => spin.pause(),
          })

          nudges.forEach((n) => n.removeAttribute('data-open'))
          gsap.to(spin, { timeScale: 1, duration: 0.3, overwrite: true })
        }

        const slow = () => gsap.to(spin, { timeScale: 0, duration: 0.45, overwrite: true })
        const resume = () => gsap.to(spin, { timeScale: 1, duration: 0.45, overwrite: true })

        const onNudgeClick = (event) => {
          if (!coarse.matches) return
          const nudge = event.currentTarget
          const wasOpen = nudge.hasAttribute('data-open')
          nudges.forEach((n) => n.removeAttribute('data-open'))
          if (!wasOpen) nudge.setAttribute('data-open', '')
        }

        const onHandleClick = () => {
          if (!coarse.matches) return
          if (open) hide()
          else show()
        }

        const inRegion = (node) => !!node && (hot.contains(node) || wrap.contains(node))

        const onLeave = (event) => {
          if (inRegion(event.relatedTarget)) return
          hide()
        }

        const onOutside = (event) => {
          if (coarse.matches && !inRegion(event.target)) hide()
        }
        const onKey = (event) => {
          if (event.key === 'Escape') hide()
        }

        let lastX = null
        let lastY = null
        let moved = false

        const track = (event) => {
          if (lastX !== null && (event.clientX !== lastX || event.clientY !== lastY)) moved = true
          lastX = event.clientX
          lastY = event.clientY
        }

        const onScrolled = () => {
          moved = false
        }

        const openIfMoved = (event) => {
          if (!coarse.matches) {
            track(event)
            if (!moved) return
          }
          show()
        }

        const handles = [portrait, veilHit]
        handles.forEach((el) => {
          el.addEventListener('pointerenter', openIfMoved)
          el.addEventListener('pointermove', openIfMoved)
          el.addEventListener('click', onHandleClick)
        })

        const region = [hot, wrap]
        region.forEach((el) => {
          el.addEventListener('pointerleave', onLeave)
          el.addEventListener('focusin', show)
        })

        ScrollTrigger.create({
          trigger: q('[data-me="stage"]')[0],
          start: 'top bottom',
          end: 'bottom top',
          onLeave: hide,
          onLeaveBack: hide,
        })

        nudges.forEach((n) => {
          n.addEventListener('pointerenter', slow)
          n.addEventListener('pointerleave', resume)
          n.addEventListener('focusin', slow)
          n.addEventListener('focusout', resume)
          n.addEventListener('click', onNudgeClick)
        })

        document.addEventListener('pointermove', track, { capture: true, passive: true })
        window.addEventListener('scroll', onScrolled, { passive: true })
        document.addEventListener('pointerdown', onOutside)
        document.addEventListener('keydown', onKey)

        const closeAll = () => {
          nudges.forEach((n) => n.removeAttribute('data-open'))
          hide()
        }

        const away = ScrollTrigger.create({
          trigger: q('[data-me="stage"]')[0] || root,
          start: 'top bottom',
          end: 'bottom top',
          onLeave: closeAll,
          onLeaveBack: closeAll,
        })

        if (import.meta.env.DEV) window.__meWheel = { show, hide, spin }

        return () => {
          away.kill()
          handles.forEach((el) => {
            el.removeEventListener('pointerenter', openIfMoved)
            el.removeEventListener('pointermove', openIfMoved)
            el.removeEventListener('click', onHandleClick)
          })
          region.forEach((el) => {
            el.removeEventListener('pointerleave', onLeave)
            el.removeEventListener('focusin', show)
          })
          nudges.forEach((n) => {
            n.removeEventListener('pointerenter', slow)
            n.removeEventListener('pointerleave', resume)
            n.removeEventListener('focusin', slow)
            n.removeEventListener('focusout', resume)
            n.removeEventListener('click', onNudgeClick)
          })
          document.removeEventListener('pointermove', track, { capture: true })
          window.removeEventListener('scroll', onScrolled)
          document.removeEventListener('pointerdown', onOutside)
          document.removeEventListener('keydown', onKey)
          spin.kill()
        }
      },
      root,
    )

    return () => mmw.revert()
  }, [])

  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    const mmr = gsap.matchMedia()

    mmr.add(
      {
        narrow: '(max-width: 767px) and (orientation: portrait)',
        still: '(prefers-reduced-motion: reduce)',
      },
      (self) => {
        const { narrow, still } = self.conditions
        if (!narrow) return

        const q = gsap.utils.selector(root)
        const rail = q('[data-me="rail"]')[0]
        const track = q('[data-rail="track"]')[0]
        const items = q('[data-rail="item"]')
        const chips = q('[data-rail="chip"]')
        const portrait = q('[data-me="portrait"]')[0]
        const region = q('[data-me="right"]')[0]
        const left = q('[data-me="left"]')[0]
        const dome = q('[data-me="dome"]')[0]
        const veil = q('[data-me="veil"]')[0]
        if (!rail || !track || !portrait || !region || !left || !dome || !veil) return

        gsap.set(rail, { autoAlpha: 0 })

        const loop = gsap.to(track, {
          xPercent: -50,
          duration: RAIL_SECONDS,
          ease: 'none',
          repeat: -1,
          paused: true,
        })

        let open = false

        const closeCards = () => items.forEach((i) => i.removeAttribute('data-open'))

        const show = () => {
          if (open) return
          open = true

          const cs = window.getComputedStyle(root)
          const leftX = parseFloat(cs.getPropertyValue('--me-hover-left-x')) || 0
          const domeX = parseFloat(cs.getPropertyValue('--me-hover-dome-x')) || 0
          const veilX = parseFloat(cs.getPropertyValue('--me-hover-veil-x')) || 0
          const mediaY = parseFloat(cs.getPropertyValue('--me-hover-media-y')) || 0

          gsap.to(left, { x: leftX, duration: 0.85, ease: 'power3.out', overwrite: 'auto' })
          gsap.to(dome, { x: domeX, duration: 0.85, ease: 'power3.out', overwrite: 'auto' })
          gsap.to(veil, { x: veilX, duration: 0.85, ease: 'power3.out', overwrite: 'auto' })
          gsap.to(portrait, { y: mediaY, duration: 0.85, ease: 'power3.out', overwrite: 'auto' })

          gsap.fromTo(
            rail,
            { autoAlpha: 0, y: 16 },
            { autoAlpha: 1, y: 0, duration: 0.5, ease: 'power3.out', overwrite: 'auto' },
          )
          if (!still) loop.play()
        }

        const hide = () => {
          if (!open) return
          open = false

          gsap.to([left, dome, veil], {
            x: 0,
            duration: 0.7,
            ease: 'power3.out',
            overwrite: 'auto',
          })
          gsap.to(portrait, { y: 0, duration: 0.7, ease: 'power3.out', overwrite: 'auto' })

          gsap.to(rail, {
            autoAlpha: 0,
            y: 10,
            duration: 0.28,
            ease: 'power2.in',
            overwrite: 'auto',
            onComplete: () => loop.pause(),
          })

          closeCards()
          gsap.to(loop, { timeScale: 1, duration: 0.3, overwrite: true })
        }

        const onToggle = () => {
          if (open) hide()
          else show()
        }

        const slow = () => gsap.to(loop, { timeScale: 0, duration: 0.45, overwrite: true })
        const resume = () => gsap.to(loop, { timeScale: 1, duration: 0.45, overwrite: true })
        const anyOpen = () => items.some((i) => i.hasAttribute('data-open'))

        const onChip = (event) => {
          const item = event.currentTarget.parentElement
          const wasOpen = item.hasAttribute('data-open')
          closeCards()
          if (wasOpen) {
            resume()
            return
          }
          item.setAttribute('data-open', '')
          slow()
        }

        const onChipKey = (event) => {
          if (event.detail === 0) onChip(event)
        }

        const onChipCancel = () => {
          closeCards()
          resume()
        }

        const fine = window.matchMedia('(hover: hover)')
        const onChipEnter = () => {
          if (fine.matches) slow()
        }
        const onChipLeave = () => {
          if (fine.matches && !anyOpen()) resume()
        }

        const onOutside = (event) => {
          if (region.contains(event.target) || rail.contains(event.target)) return
          hide()
        }

        portrait.addEventListener('click', onToggle)
        chips.forEach((c) => {
          c.addEventListener('pointerdown', onChip)
          c.addEventListener('pointercancel', onChipCancel)
          c.addEventListener('click', onChipKey)
          c.addEventListener('pointerenter', onChipEnter)
          c.addEventListener('pointerleave', onChipLeave)
        })
        document.addEventListener('pointerdown', onOutside)

        if (import.meta.env.DEV) window.__meRail = { show, hide, loop }

        return () => {
          portrait.removeEventListener('click', onToggle)
          chips.forEach((c) => {
            c.removeEventListener('pointerdown', onChip)
            c.removeEventListener('pointercancel', onChipCancel)
            c.removeEventListener('click', onChipKey)
            c.removeEventListener('pointerenter', onChipEnter)
            c.removeEventListener('pointerleave', onChipLeave)
          })
          document.removeEventListener('pointerdown', onOutside)
          closeCards()
          loop.kill()
        }
      },
      root,
    )

    return () => mmr.revert()
  }, [])

  return (
    <div ref={rootRef} className="contents">
      <section
        id="about-me"
        aria-label="About Felix"
        className="relative z-[2] mt-[var(--me-lead-pull)] w-full bg-white"
      >
        <div
          data-me="stage"
          className="relative h-[calc(100svh+var(--me-runway)+var(--me-cover-tail))]"
        >
          <div
            data-me="pane"
            data-cursor="hover"
            className="sticky top-0 h-svh w-full overflow-hidden"
          >
            <div data-me="left" className="absolute inset-0 z-[var(--me-z-left)]">
              <div data-me="dome" />

              <div data-me="copy">
                <div className="max-w-full">
                  <p data-me="eyebrow" className="m-0 mb-[clamp(12px,2.2svh,28px)]">
                    <Pill>{EYEBROW}</Pill>
                  </p>

                  <p
                    className="m-0 w-[var(--me-copy-w)] max-w-full font-heading
                             text-[length:var(--me-copy-size)] font-bold
                             leading-[1.28] tracking-[-0.02em] text-primary"
                  >
                    {words(COPY)}
                  </p>
                </div>
              </div>
            </div>

            <div
              data-me="right"
              data-cursor="default"
              className="absolute bottom-[var(--me-media-bottom)] left-[var(--me-media-left)]
                       z-[var(--me-z-right)] w-[var(--me-media-w)]
                       translate-x-[var(--me-media-tx)] aspect-[var(--me-media-ratio)]"
            >
              <span aria-hidden="true" className="absolute -inset-[var(--me-hot-pad)] z-0" />

              <figure data-me="portrait" className="absolute inset-0 z-[1] m-0 overflow-hidden">
                <AboutMedia />
              </figure>

              <div data-me="pulse" className="z-[2]" />

              <div data-me="veil-hit" className="z-[3]">
                <div data-me="veil" />
              </div>
            </div>

            <div data-me="rail" data-cursor="default">
              <div data-rail="track">
                {[0, 1].map((run) => (
                  <div data-rail="run" key={run}>
                    {ORBIT.map(({ Mark, label, phrase }) => (
                      <div data-rail="item" key={`${run}-${label}`}>
                        <button
                          type="button"
                          data-rail="chip"
                          {...(run === 0
                            ? { 'aria-label': `${label} — ${phrase}` }
                            : { 'aria-hidden': true, tabIndex: -1 })}
                        >
                          <Mark />
                        </button>
                        <span data-rail="card" aria-hidden="true">
                          {phrase}
                        </span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div data-me="orbit-wrap" data-cursor="default">
        <div data-me="orbit">
          {ORBIT.map(({ Mark, label, phrase }, i) => (
            <div key={label} data-orbit="slot" style={{ '--a': `${ANGLES[i]}deg` }}>
              <div data-orbit="upright">
                <div data-orbit="nudge">
                  <button type="button" data-orbit="item" aria-label={`${label} — ${phrase}`}>
                    <Mark />
                  </button>
                  <span data-orbit="card" aria-hidden="true">
                    {phrase}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
