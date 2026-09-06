// Lenis smooth scroll setup

import { useEffect } from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { isLowPerf } from '../lib/perf'
gsap.registerPlugin(ScrollTrigger)

ScrollTrigger.config({ ignoreMobileResize: true })

let lenisInstance = null

export function getLenis() {
  return lenisInstance
}

const EASE = (t) => 1 - Math.pow(1 - t, 3)

const JUMP_MIN = 1.4
const JUMP_MAX = 3.4
const JUMP_PX_PER_SECOND = 1800
const JUMP_EASE = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

const TOUCH_SCRUB = 0.4

export function scrub(seconds) {
  const coarse = typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches
  return coarse ? Math.max(0.2, seconds * TOUCH_SCRUB) : seconds
}

function stickyAnchor(el) {
  return getComputedStyle(el).position === 'sticky' && el.parentElement ? el.parentElement : el
}

export function scrollToSection(href, { reduceMotion = false } = {}) {
  const found = typeof href === 'string' ? document.querySelector(href) : href
  if (!found) return false

  const target = stickyAnchor(found)

  const lenis = getLenis()

  if (!lenis || reduceMotion) {
    target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' })
    return true
  }

  const from = window.scrollY
  const to = target.getBoundingClientRect().top + from
  const seconds = Math.min(JUMP_MAX, Math.max(JUMP_MIN, Math.abs(to - from) / JUMP_PX_PER_SECOND))

  lenis.scrollTo(target, { offset: 0, duration: seconds, easing: JUMP_EASE })
  return true
}

export function useSmoothScroll() {
  useEffect(() => {
    let lenis
    let raf
    try {
      lenis = new Lenis({
        duration: isLowPerf() ? 1.05 : 1.45,
        easing: EASE,
        wheelMultiplier: 0.8,
        smoothWheel: true,
        syncTouch: false,
      })
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
      lenis.destroy()
      lenisInstance = null
    }
  }, [])
}
