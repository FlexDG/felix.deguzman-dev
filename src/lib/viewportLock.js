import { ScrollTrigger } from 'gsap/ScrollTrigger'

const KEYBOARD_SHARE = 0.25
const SETTLE_MS = 260
const TOUCH_ONLY = '(hover: none) and (pointer: coarse)'

function measure(unit) {
  const probe = document.createElement('div')
  probe.style.cssText =
    `position:absolute;top:0;left:0;width:0;height:100${unit};` +
    'visibility:hidden;pointer-events:none;'
  document.documentElement.appendChild(probe)
  const height = probe.getBoundingClientRect().height
  probe.remove()
  return height
}

export function lockViewportUnits() {
  if (typeof window === 'undefined') return
  if (!window.matchMedia?.(TOUCH_ONLY).matches) return

  const root = document.documentElement
  let width = window.innerWidth
  let small = measure('svh')
  let large = measure('lvh')
  let active = false
  let stale = false
  let settle = 0

  ScrollTrigger.addEventListener('refresh', () => {
    stale = false
  })

  window.addEventListener('resize', () => {
    if (window.innerWidth !== width) {
      width = window.innerWidth
      active = false
      root.style.removeProperty('--svh')
      root.style.removeProperty('--lvh')
      small = measure('svh')
      large = measure('lvh')
      return
    }

    const nowSmall = measure('svh')
    const nowLarge = measure('lvh')
    if (nowSmall < small * (1 - KEYBOARD_SHARE)) return

    if (!active) {
      const change = Math.abs(nowSmall - small)
      if (change < 1 || change > small * KEYBOARD_SHARE) return
      active = true
    } else if (nowSmall >= small && nowLarge <= large) {
      return
    }

    small = Math.min(small, nowSmall)
    large = Math.max(large, nowLarge)
    root.style.setProperty('--svh', `${small / 100}px`)
    root.style.setProperty('--lvh', `${large / 100}px`)

    stale = true
    clearTimeout(settle)
    settle = setTimeout(() => {
      if (stale) ScrollTrigger.refresh()
    }, SETTLE_MS)
  })
}
