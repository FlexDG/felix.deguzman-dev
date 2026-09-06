// Navbar morph on scroll

import { useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { MENU_ITEMS } from '../components/navMenu'

gsap.registerPlugin(ScrollTrigger)

export const MORPH_DISTANCE = 420

const SEL = {
  pane: '[data-hero-pane]',
  card: '[data-hero="card-nav"]',
  face: '[data-navcard-face]',
  shell: '[data-nav-shell]',
  pill: '[data-nav-pill]',
  logo: '[data-nav-logo]',
  cta: '[data-nav-cta]',
}

function inkRect(el) {
  const roll = el.querySelector('.hover-roll')
  if (roll) {
    const b = roll.getBoundingClientRect()
    const cs = getComputedStyle(roll)
    return {
      left: b.left,
      right: b.right,
      top: b.top + (parseFloat(cs.paddingTop) || 0),
      bottom: b.bottom - (parseFloat(cs.paddingBottom) || 0),
    }
  }
  const range = document.createRange()
  range.selectNodeContents(el)
  return range.getBoundingClientRect()
}

function makeLabel(source) {
  const cs = getComputedStyle(source)
  const span = document.createElement('span')
  span.textContent = source.textContent.trim()
  span.setAttribute('aria-hidden', 'true')
  span.style.cssText =
    `font-family:${cs.fontFamily};font-size:${cs.fontSize};` +
    `font-weight:${cs.fontWeight};font-style:${cs.fontStyle};` +
    `line-height:${cs.lineHeight};letter-spacing:${cs.letterSpacing};` +
    `text-transform:${cs.textTransform};color:${cs.color};` +
    'white-space:nowrap;pointer-events:none;'
  return span
}

const centreOf = (r) => ({ x: (r.left + r.right) / 2, y: (r.top + r.bottom) / 2 })

function makeFlyer(layer, child, centre) {
  const holder = document.createElement('div')
  holder.style.cssText =
    'position:absolute;left:0;top:0;width:0;height:0;display:flex;' +
    'align-items:center;justify-content:center;white-space:nowrap;'
  child.style.flex = '0 0 auto'
  holder.appendChild(child)
  layer.appendChild(holder)
  gsap.set(holder, { x: centre.x, y: centre.y })
  return holder
}

function createFlight() {
  const pane = document.querySelector(SEL.pane)
  const card = document.querySelector(SEL.card)
  const face = card?.querySelector(SEL.face)
  const shell = document.querySelector(SEL.shell)
  const pill = shell?.querySelector(SEL.pill)
  const logo = shell?.querySelector(SEL.logo)
  const cta = shell?.querySelector(SEL.cta)

  const pairs = MENU_ITEMS.map((item) => ({
    href: item.href,
    from: card?.querySelector(`[data-navcard-item="${item.href}"]`),
    icon: card?.querySelector(`[data-navcard-icon="${item.href}"]`),
    to: shell?.querySelector(`[data-nav-item="${item.href}"]`),
  }))

  if (!pane || !card || !face || !shell || !pill) return null
  if (pairs.some((p) => !p.from || !p.to || !p.icon)) return null

  const paneBox = pane.getBoundingClientRect()
  const atRest = (r) => ({ x: r.left - paneBox.left, y: r.top - paneBox.top })
  const restCentre = (r) => {
    const c = centreOf(r)
    return { x: c.x - paneBox.left, y: c.y - paneBox.top }
  }

  document.querySelectorAll('[data-nav-flight]').forEach((old) => old.remove())

  const layer = document.createElement('div')
  layer.setAttribute('data-nav-flight', '')
  layer.style.cssText =
    'position:fixed;inset:0;z-index:101;pointer-events:none;contain:layout style;'
  document.body.appendChild(layer)
  gsap.set(layer, { autoAlpha: 0 })

  const faceBox = face.getBoundingClientRect()
  const pillBox = pill.getBoundingClientRect()
  const pillStyle = getComputedStyle(pill)
  const faceStart = atRest(faceBox)

  const faceFlyer = face.cloneNode(false)
  faceFlyer.removeAttribute('data-navcard-face')
  faceFlyer.setAttribute('aria-hidden', 'true')
  faceFlyer.style.cssText =
    `position:absolute;left:0;top:0;margin:0;pointer-events:none;` +
    `width:${faceBox.width}px;height:${faceBox.height}px;`
  layer.appendChild(faceFlyer)
  gsap.set(faceFlyer, { x: faceStart.x, y: faceStart.y })

  const iconFlyers = []
  const labelFlyers = []
  const labelTargets = []

  pairs.forEach(({ from, icon, to }) => {
    const iconClone = icon.cloneNode(true)
    iconClone.removeAttribute('data-navcard-icon')
    iconFlyers.push(makeFlyer(layer, iconClone, restCentre(icon.getBoundingClientRect())))

    const labelClone = makeLabel(from)
    const holder = makeFlyer(layer, labelClone, restCentre(inkRect(from)))
    labelFlyers.push({ holder, label: labelClone })

    const end = centreOf(inkRect(to))
    const cs = getComputedStyle(to)
    labelTargets.push({
      x: end.x,
      y: end.y,
      fontSize: cs.fontSize,
      fontWeight: cs.fontWeight,
      color: cs.color,
    })
  })

  const links = pairs.map((p) => p.to)

  gsap.set(links, { opacity: 0 })

  const tl = gsap.timeline({ paused: true, defaults: { ease: 'none' } })

  tl.set(card, { autoAlpha: 0 }, 0.001).set(layer, { autoAlpha: 1 }, 0.001)

  tl.to(
    faceFlyer,
    {
      x: pillBox.left,
      y: pillBox.top,
      width: pillBox.width,
      height: pillBox.height,
      borderRadius: pillStyle.borderRadius,
      backgroundColor: pillStyle.backgroundColor,
      duration: 0.68,
      ease: 'power2.inOut',
    },
    0.04,
  ).to(faceFlyer, { opacity: 0, duration: 0.34, ease: 'power1.in' }, 0.46)

  iconFlyers.forEach((holder, i) => {
    tl.to(holder, { opacity: 0, scale: 0.55, duration: 0.16, ease: 'power2.in' }, 0.02 + i * 0.03)
  })

  labelFlyers.forEach(({ holder, label }, i) => {
    const end = labelTargets[i]
    const at = 0.06 + i * 0.045

    tl.to(holder, { y: end.y, duration: 0.5, ease: 'power2.inOut' }, at)
      .to(holder, { x: end.x, duration: 0.54, ease: 'power2.inOut' }, at + 0.05)
      .to(
        label,
        {
          fontSize: end.fontSize,
          fontWeight: end.fontWeight,
          color: end.color,
          duration: 0.5,
          ease: 'power2.inOut',
        },
        at,
      )
  })

  tl.to(shell, { opacity: 1, duration: 0.34, ease: 'power1.out' }, 0.52)
  if (logo) {
    tl.fromTo(
      logo,
      { y: -10, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.28, ease: 'power2.out' },
      0.58,
    )
  }
  if (cta) {
    tl.fromTo(
      cta,
      { y: -10, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.28, ease: 'power2.out' },
      0.64,
    )
  }

  tl.to(
    labelFlyers.map((f) => f.holder),
    { opacity: 0, duration: 0.09, stagger: 0.015 },
    0.87,
  )
    .to(links, { opacity: 1, duration: 0.09, stagger: 0.015 }, 0.87)
    .set(layer, { autoAlpha: 0 }, 0.995)

  const rollLinks = pairs.flatMap((p) => [p.from, p.to])

  const settle = () => {
    rollLinks.forEach((link) => {
      if (link.matches(':hover')) return
      const chars = link.querySelectorAll('.hover-roll > span')
      if (!chars.length) return
      if (gsap.getTweensOf(chars).length) return
      gsap.set(chars, { yPercent: 0 })
    })
  }

  pill.addEventListener('pointerleave', settle)
  card.addEventListener('pointerleave', settle)

  return {
    tl,
    settle,
    destroy() {
      pill.removeEventListener('pointerleave', settle)
      card.removeEventListener('pointerleave', settle)
      tl.revert()
      tl.kill()
      layer.remove()
      gsap.set(links, { clearProps: 'opacity' })
    },
  }
}

export function useNavMorph() {
  useEffect(() => {
    const mm = gsap.matchMedia()

    mm.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {
      let flight = null
      let trigger = null
      let building = false
      let disposed = false

      const teardown = () => {
        trigger?.kill()
        trigger = null
        flight?.destroy()
        flight = null
      }

      const build = () => {
        if (building || disposed) return
        building = true
        teardown()
        flight = createFlight()
        if (!flight) {
          gsap.set(document.querySelector(SEL.shell), { opacity: 1 })
          building = false
          return
        }
        trigger = ScrollTrigger.create({
          trigger: document.documentElement,
          start: 'top top',
          end: `+=${MORPH_DISTANCE}`,
          scrub: true,
          animation: flight.tl,
          onLeave: () => {
            flight?.settle()
            gsap.set(document.querySelector(SEL.shell), { opacity: 1 })
          },
          onLeaveBack: () => flight?.settle(),
        })
        flight.tl.progress(gsap.utils.clamp(0, 1, window.scrollY / MORPH_DISTANCE))
        building = false
      }

      let raf = 0
      let ready = false
      const start = () => {
        if (disposed) return
        raf = requestAnimationFrame(() => {
          ready = true
          build()
        })
      }
      if (document.fonts?.status === 'loaded') start()
      else (document.fonts?.ready ?? Promise.resolve()).then(start)

      const onRefresh = () => {
        if (ready && !building && !disposed) build()
      }
      ScrollTrigger.addEventListener('refresh', onRefresh)

      return () => {
        disposed = true
        cancelAnimationFrame(raf)
        ScrollTrigger.removeEventListener('refresh', onRefresh)
        teardown()
      }
    })

    return () => mm.revert()
  }, [])
}
