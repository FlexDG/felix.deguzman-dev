// Lenis smooth scroll setup

import { useEffect } from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { isLowPerf } from '../lib/perf'
import { runNavCurtain } from '../lib/navCurtain'
gsap.registerPlugin(ScrollTrigger)

ScrollTrigger.config({ ignoreMobileResize: true })

let lenisInstance = null

export function getLenis() {
  return lenisInstance
}

const EASE = (t) => 1 - Math.pow(1 - t, 3)

const SAME_PLACE = 4

const TOUCH_ONLY = '(hover: none) and (pointer: coarse)'

export function scrub(seconds) {
  const coarse = typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches
  return coarse ? true : seconds
}

function holdTouch(lenis) {
  const block = (event) => {
    if (event.cancelable) event.preventDefault()
  }
  const letGo = () => {
    window.removeEventListener('touchmove', block)
    window.removeEventListener('wheel', block)
  }
  const stop = lenis.stop.bind(lenis)
  const start = lenis.start.bind(lenis)

  lenis.stop = () => {
    window.addEventListener('touchmove', block, { passive: false })
    window.addEventListener('wheel', block, { passive: false })
    stop()
  }
  lenis.start = () => {
    letGo()
    start()
  }

  return letGo
}

function stickyAnchor(el) {
  return getComputedStyle(el).position === 'sticky' && el.parentElement ? el.parentElement : el
}

export function scrollToSection(href, { reduceMotion = false } = {}) {
  const found = typeof href === 'string' ? document.querySelector(href) : href
  if (!found) return false

  const target = stickyAnchor(found)
  const lenis = getLenis()

  const land = () => {
    if (lenis) lenis.scrollTo(target, { offset: 0, immediate: true, force: true })
    else target.scrollIntoView({ behavior: 'auto' })
    ScrollTrigger.update()
    window.dispatchEvent(new Event('nav:jump'))
  }

  if (reduceMotion) {
    land()
    return true
  }

  const reach = Math.max(0, document.documentElement.scrollHeight - window.innerHeight)
  const to = Math.min(Math.max(0, target.getBoundingClientRect().top + window.scrollY), reach)
  if (Math.abs(to - window.scrollY) < SAME_PLACE) return true

  const root = document.documentElement

  const started = runNavCurtain({
    onCovered: land,
    onDone: () => {
      root.removeAttribute('data-scroll-locked')
      lenis?.start()
    },
  })

  if (started) {
    root.setAttribute('data-scroll-locked', '')
    lenis?.stop()
  }

  return true
}

export function useSmoothScroll() {
  useEffect(() => {
    let lenis
    let raf
    let letGo = null
    try {
      const touchOnly = matchMedia(TOUCH_ONLY).matches
      lenis = new Lenis({
        duration: isLowPerf() ? 1.05 : 1.45,
        easing: EASE,
        wheelMultiplier: 0.8,
        smoothWheel: true,
        syncTouch: false,
        ...(touchOnly ? { eventsTarget: document.createElement('div') } : null),
      })
      if (touchOnly) letGo = holdTouch(lenis)
      lenisInstance = lenis
      if (import.meta.env.DEV) window.__lenis = lenis
      lenis.on('scroll', ScrollTrigger.update)
      raf = (time) => lenis.raf(time * 1000)
      gsap.ticker.add(raf)
      gsap.ticker.lagSmoothing(200, 24)
    } catch (err) {
      console.error(
        '[useSmoothScroll] Lenis failed to initialise — falling back to native scroll.',
        err,
      )
      lenisInstance = null
      return undefined
    }
    return () => {
      gsap.ticker.remove(raf)
      letGo?.()
      lenis.destroy()
      lenisInstance = null
    }
  }, [])
}
