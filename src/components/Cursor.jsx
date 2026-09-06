// Custom cursor

import { useEffect, useState } from 'react'
import gsap from 'gsap'

const FOLLOW = 0.13
const EASE = 'power3'

const AWAY = 0.2
const AWAY_EASE = 'power2.out'

const FIELDS =
  'input:is([type="text"],[type="tel"],[type="email"],[type="url"],' +
  '[type="search"],[type="password"],[type="number"],:not([type])), ' +
  'textarea, [contenteditable="true"]'

const SCUBA = `${import.meta.env.BASE_URL}images/scuba_dance.gif`

function Arrow() {
  return (
    <svg data-cur="arrow" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M4 12h14M12.5 6l6 6-6 6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function Cursor() {
  const [fine, setFine] = useState(
    () => typeof matchMedia === 'function' && matchMedia('(pointer: fine)').matches,
  )

  useEffect(() => {
    if (typeof matchMedia !== 'function') return undefined
    const mq = matchMedia('(pointer: fine)')
    const onChange = () => setFine(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    if (!fine) return undefined

    const root = document.querySelector('[data-cur="root"]')
    if (!root) return undefined

    const html = document.documentElement
    html.setAttribute('data-cur-on', '')

    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
    const duration = reduced ? 0 : FOLLOW
    const setX = gsap.quickTo(root, 'x', { duration, ease: EASE })
    const setY = gsap.quickTo(root, 'y', { duration, ease: EASE })

    const fade = (to) =>
      gsap.to(root, {
        scale: to,
        duration: reduced ? 0 : AWAY,
        ease: AWAY_EASE,
        overwrite: 'auto',
      })

    let x = 0
    let y = 0
    let seen = false
    let dirty = false
    let state = 'default'

    const resolve = (el) => {
      if (!el) return 'default'
      if (el.closest(FIELDS)) return 'text'
      return el.closest('[data-cursor]')?.getAttribute('data-cursor') || 'default'
    }

    const settle = () => {
      if (!dirty) return
      dirty = false
      const next = resolve(document.elementFromPoint(x, y))
      if (next === state) return
      state = next
      root.setAttribute('data-state', next)
    }
    gsap.ticker.add(settle)

    const place = (event) => {
      x = event.clientX
      y = event.clientY
      dirty = true
      seen = true
      gsap.set(root, { x, y })
      root.setAttribute('data-seen', '')
      fade(1)
    }

    const leave = () => {
      if (!seen) return
      seen = false
      fade(0)
    }

    const onMove = (event) => {
      if (!seen) {
        place(event)
        return
      }
      x = event.clientX
      y = event.clientY
      dirty = true
      setX(x)
      setY(y)
    }

    const onScroll = () => {
      dirty = true
    }

    const press = (event) => {
      root.setAttribute('data-press', '')
      if (!seen) place(event)
    }
    const release = () => root.removeAttribute('data-press')

    const onOut = (event) => {
      if (event.relatedTarget) return
      leave()
    }

    const onHide = () => {
      if (document.hidden) leave()
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('scroll', onScroll, { passive: true, capture: true })
    window.addEventListener('pointerdown', press, { passive: true })
    window.addEventListener('pointerup', release, { passive: true })
    window.addEventListener('pointercancel', release, { passive: true })
    window.addEventListener('blur', release)
    window.addEventListener('blur', leave)
    document.addEventListener('visibilitychange', onHide)
    document.addEventListener('pointerout', onOut, { passive: true })

    return () => {
      gsap.ticker.remove(settle)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('scroll', onScroll, { capture: true })
      window.removeEventListener('pointerdown', press)
      window.removeEventListener('pointerup', release)
      window.removeEventListener('pointercancel', release)
      window.removeEventListener('blur', release)
      window.removeEventListener('blur', leave)
      document.removeEventListener('visibilitychange', onHide)
      document.removeEventListener('pointerout', onOut)
      html.removeAttribute('data-cur-on')
      root.removeAttribute('data-seen')
      root.removeAttribute('data-press')
      root.setAttribute('data-state', 'default')
      gsap.killTweensOf(root)
      gsap.set(root, { clearProps: 'transform' })
    }
  }, [fine])

  if (!fine) return null

  return (
    <div data-cur="root" data-state="default" aria-hidden="true">
      <div data-cur="lens">
        <div data-cur="veil" />
      </div>

      <div data-cur="label" data-for="hover">
        <span>Hover</span>
        <Arrow />
      </div>
      <div data-cur="label" data-for="project">
        <span>View</span>
        <span>Project</span>
      </div>

      <img
        data-cur="gif"
        src={SCUBA}
        alt=""
        draggable={false}
        onError={(event) =>
          event.currentTarget.closest('[data-cur="root"]')?.setAttribute('data-nogif', '')
        }
      />
    </div>
  )
}
