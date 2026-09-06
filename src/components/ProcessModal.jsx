// Process section modal

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import gsap from 'gsap'
import { getLenis } from '../hooks/useSmoothScroll'

const SHOTS = `${import.meta.env.BASE_URL}images/process_images/modal/`

const shot = (name, alt) => ({
  main: `${SHOTS}${name}.webp`,
  thumb: `${SHOTS}${name}-thumb.webp`,
  alt,
})

const PANELS = [
  {
    id: 'design',
    tab: 'UI/UX Design',
    title: 'Design that earns every pixel',
    body: 'Every screen has a purpose. From wireframes to pixel-perfect UI, built to guide the visitor and land the business goal.',
    shots: [
      shot('prd_mockup', 'The PRD. property site across desktop and page layouts'),
      shot('ic_mobile', 'A wildlife conservation app running on a phone'),
      shot('design_system', 'The design system: type scale, colour, buttons, grid and cards'),
    ],
  },
  {
    id: 'build',
    tab: 'Software Development',
    title: 'Built to survive production',
    body: 'Typed, reviewed, measured. Responsive and production-ready, so the work ships faster without giving up any of the quality.',
    shots: [
      shot('dashboard', 'An analytics dashboard: sales reports, payment history and traffic'),
      shot('custom_code', 'Custom code in the editor, with a coding agent mid-task'),
      shot('elementor', 'The WordPress pages screen, editing a homepage with Elementor'),
    ],
  },
]

function Chevron({ back = false }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={back ? { transform: 'scaleX(-1)' } : undefined}
    >
      <path d="M9 5l7 7-7 7" />
    </svg>
  )
}

function Cross() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  )
}

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

export default function ProcessModal({ panel, open, onPanel, onClose, onClosed }) {
  const [active, setActive] = useState(0)

  const overlayRef = useRef(null)
  const shellRef = useRef(null)
  const closeRef = useRef(null)
  const frameRef = useRef(null)
  const footRef = useRef(null)
  const stripRef = useRef(null)
  const cardRef = useRef(null)
  const paintedRef = useRef(panel)

  const onClosedRef = useRef(onClosed)
  useEffect(() => {
    onClosedRef.current = onClosed
  }, [onClosed])

  const data = PANELS[panel]

  useLayoutEffect(() => {
    const overlay = overlayRef.current
    const shell = shellRef.current
    if (!overlay || !shell) return undefined

    const calm = reduced()
    gsap.killTweensOf([overlay, shell])

    if (open) {
      gsap.fromTo(
        overlay,
        { opacity: 0 },
        { opacity: 1, duration: calm ? 0 : 0.35, ease: 'power2.out' },
      )
      gsap.fromTo(
        shell,
        { opacity: 0, y: calm ? 0 : 26, scale: calm ? 1 : 0.985 },
        { opacity: 1, y: 0, scale: 1, duration: calm ? 0 : 0.55, ease: 'power3.out' },
      )
      return undefined
    }

    const out = gsap.timeline({ onComplete: () => onClosedRef.current?.() })
    out
      .to(
        shell,
        {
          opacity: 0,
          y: calm ? 0 : 14,
          scale: calm ? 1 : 0.99,
          duration: calm ? 0 : 0.26,
          ease: 'power2.in',
        },
        0,
      )
      .to(overlay, { opacity: 0, duration: calm ? 0 : 0.3, ease: 'power2.in' }, calm ? 0 : 0.04)
    return () => out.kill()
  }, [open])

  useEffect(() => {
    document.documentElement.setAttribute('data-scroll-locked', '')
    getLenis()?.stop()
    return () => {
      document.documentElement.removeAttribute('data-scroll-locked')
      getLenis()?.start()
    }
  }, [])

  useEffect(() => {
    const previous = document.activeElement
    closeRef.current?.focus({ preventScroll: true })
    return () => {
      if (previous instanceof HTMLElement) previous.focus({ preventScroll: true })
    }
  }, [])

  useEffect(() => {
    if (!open) return undefined
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose()
        return
      }
      if (e.key !== 'Tab') return
      const shell = shellRef.current
      if (!shell) return
      const items = [...shell.querySelectorAll('button:not([disabled]), [href]')].filter(
        (el) => el.offsetParent !== null,
      )
      if (!items.length) return
      const first = items[0]
      const last = items[items.length - 1]
      const here = document.activeElement
      const inside = shell.contains(here)
      if (e.shiftKey && (here === first || !inside)) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && (here === last || !inside)) {
        e.preventDefault()
        first.focus()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  useEffect(() => {
    const frame = frameRef.current
    if (!frame || reduced()) return
    gsap.fromTo(
      frame.firstElementChild,
      { opacity: 0, scale: 1.03 },
      { opacity: 1, scale: 1, duration: 0.5, ease: 'power2.out' },
    )
  }, [active, panel])

  useEffect(() => {
    const switched = paintedRef.current !== panel
    paintedRef.current = panel
    if (!switched || reduced()) return

    const card = cardRef.current
    const targets = [footRef.current, stripRef.current].filter((el) => el && card?.contains(el))
    if (!targets.length) return

    gsap.fromTo(
      targets,
      { opacity: 0, y: 12 },
      { opacity: 1, y: 0, duration: 0.45, ease: 'power3.out', stagger: 0.05 },
    )
  }, [panel])

  useEffect(() => {
    const strip = stripRef.current
    const thumb = strip?.children[active]
    if (!strip || !thumb) return
    strip.scrollTo({
      left: Math.max(0, thumb.offsetLeft - (strip.clientWidth - thumb.clientWidth) / 2),
      behavior: 'smooth',
    })
  }, [active, panel])

  useEffect(() => {
    PANELS[panel].shots.forEach((s) => {
      const img = new Image()
      img.src = s.main
    })
  }, [panel])

  const step = useCallback(
    (dir) => {
      const n = data.shots.length
      setActive((i) => (i + dir + n) % n)
    },
    [data.shots.length],
  )

  const titleId = `pm-title-${data.id}`

  return createPortal(
    <div
      data-pm="overlay"
      ref={overlayRef}
      style={{ opacity: 0 }}
      onPointerDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        data-pm="shell"
        ref={shellRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        style={{ opacity: 0 }}
      >
        <div data-pm="tabs" role="tablist" aria-label="Process detail">
          {PANELS.map((p, i) => (
            <button
              key={p.id}
              type="button"
              data-pm="tab"
              role="tab"
              id={`pm-tab-${p.id}`}
              aria-selected={panel === i}
              aria-controls={`pm-card-${p.id}`}
              tabIndex={panel === i ? 0 : -1}
              onClick={() => {
                onPanel(i)
                setActive(0)
              }}
            >
              {p.tab}
            </button>
          ))}
        </div>

        <div
          data-pm="card"
          ref={cardRef}
          role="tabpanel"
          id={`pm-card-${data.id}`}
          aria-labelledby={`pm-tab-${data.id}`}
        >
          <div data-pm="media">
            <div data-pm="frame" ref={frameRef}>
              <img src={data.shots[active].main} alt={data.shots[active].alt} decoding="async" />
            </div>
          </div>

          <div data-pm="body">
            <div data-pm="carousel">
              <button
                type="button"
                data-pm="step"
                onClick={() => step(-1)}
                aria-label="Previous image"
              >
                <Chevron back />
              </button>

              <div data-pm="strip" ref={stripRef}>
                {data.shots.map((s, i) => (
                  <button
                    key={s.main}
                    type="button"
                    data-pm="thumb"
                    aria-current={active === i}
                    aria-label={`Show image ${i + 1}`}
                    onClick={() => setActive(i)}
                  >
                    <img src={s.thumb} alt="" aria-hidden="true" decoding="async" />
                  </button>
                ))}
              </div>

              <button type="button" data-pm="step" onClick={() => step(1)} aria-label="Next image">
                <Chevron />
              </button>
            </div>

            <div data-pm="foot" ref={footRef}>
              <h3 id={titleId}>{data.title}</h3>
              <p>{data.body}</p>
            </div>
          </div>

          <button type="button" data-pm="close" ref={closeRef} onClick={onClose} aria-label="Close">
            <Cross />
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
