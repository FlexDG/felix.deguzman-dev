// Hover fill effect

import { useEffect } from 'react'
import gsap from 'gsap'

const SELECTOR = '[data-hover-fill],[data-hover-roll]'
const FILL_CLASS = 'hover-fill'
const ROLL_CLASS = 'hover-roll'

const REST = '100%'
const COVER = '0%'
const EXIT = '-100%'
const TRAVEL = 0.45
const EASE = 'power2.inOut'

const ROLL_LIFT = -125
const ROLL_DUR = 0.45
const ROLL_EASE = 'power2.out'
const ROLL_STAGGER = 0.35

const INK_IN = 0.2
const INK_OUT = 0.25
const INK_OUT_DELAY = 0.2

const bound = new WeakMap()

function splitLabels(el) {
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT)
  const targets = []
  while (walker.nextNode()) {
    const node = walker.currentNode
    if (!node.nodeValue.trim()) continue
    if (node.parentElement?.closest(`.${ROLL_CLASS}`)) continue
    targets.push(node)
  }

  return targets.map((node) => {
    const text = node.nodeValue.trim()
    const roll = document.createElement('span')
    roll.className = ROLL_CLASS
    roll.setAttribute('aria-label', text)

    const chars = [...text].map((ch) => {
      const span = document.createElement('span')
      span.setAttribute('aria-hidden', 'true')
      span.textContent = ch === ' ' ? ' ' : ch
      roll.appendChild(span)
      return span
    })

    node.replaceWith(roll)
    return { roll, text, chars }
  })
}

function bind(el, reduce) {
  const wantsFill = el.hasAttribute('data-hover-fill')

  const existing = bound.get(el)
  if (existing) {
    const rollsOk = el.querySelectorAll(`.${ROLL_CLASS}`).length === existing.rolls
    const fillOk = !wantsFill || el.querySelector(`:scope > .${FILL_CLASS}`)
    if (rollsOk && fillOk) return
    existing.teardown()
    bound.delete(el)
  }

  const labels = splitLabels(el)

  let fill = null
  if (wantsFill) {
    fill = document.createElement('span')
    fill.className = FILL_CLASS
    fill.setAttribute('aria-hidden', 'true')
    el.appendChild(fill)
  }

  const restingInk = getComputedStyle(el).color
  const hoverInk = () => getComputedStyle(el).getPropertyValue('--hf-ink').trim() || '#ffffff'

  const travel = reduce ? 0 : TRAVEL
  const roll = reduce ? 0 : ROLL_DUR
  const inkIn = reduce ? 0 : INK_IN
  const inkOut = reduce ? 0 : INK_OUT
  const inkOutAt = reduce ? 0 : INK_OUT_DELAY

  if (fill) gsap.set(fill, { y: REST })
  labels.forEach(({ chars }) => gsap.set(chars, { yPercent: 0 }))

  const wave = (chars) => (chars.length ? (roll / chars.length) * ROLL_STAGGER : 0)

  let hovered = false

  const enter = () => {
    hovered = true
    const tl = gsap.timeline()
    if (fill) {
      tl.to(fill, { y: COVER, duration: travel, ease: EASE, overwrite: 'auto' }).to(
        el,
        { color: hoverInk(), duration: inkIn, ease: 'power2.in', overwrite: 'auto' },
        0,
      )
    }
    labels.forEach(({ chars }) => {
      tl.to(
        chars,
        {
          yPercent: ROLL_LIFT,
          duration: roll,
          ease: ROLL_EASE,
          stagger: wave(chars),
          overwrite: 'auto',
        },
        0,
      )
    })
  }

  const leave = () => {
    if (!hovered) return
    hovered = false
    const tl = gsap.timeline()
    if (fill) {
      tl.to(fill, {
        y: EXIT,
        duration: travel,
        ease: EASE,
        overwrite: 'auto',
        onComplete: () => {
          if (!hovered) gsap.set(fill, { y: REST })
        },
      }).to(
        el,
        {
          color: restingInk,
          duration: inkOut,
          ease: 'power2.in',
          overwrite: 'auto',
          onComplete: () => {
            if (!hovered) gsap.set(el, { clearProps: 'color' })
          },
        },
        inkOutAt,
      )
    }
    labels.forEach(({ chars }) => {
      tl.to(
        chars,
        { yPercent: 0, duration: roll, ease: ROLL_EASE, stagger: wave(chars), overwrite: 'auto' },
        0,
      )
    })
  }

  el.addEventListener('mouseenter', enter)
  el.addEventListener('mouseleave', leave)

  const teardown = () => {
    el.removeEventListener('mouseenter', enter)
    el.removeEventListener('mouseleave', leave)
    gsap.killTweensOf([el, ...labels.flatMap(({ chars }) => chars), ...(fill ? [fill] : [])])
    gsap.set(el, { clearProps: 'color' })
    fill?.remove()
    labels.forEach(({ roll: node, text }) => node.replaceWith(document.createTextNode(text)))
  }

  bound.set(el, { teardown, rolls: labels.length })
}

export function useHoverFill() {
  useEffect(() => {
    if (!window.matchMedia('(hover: hover)').matches) return undefined

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const scan = () => {
      document.querySelectorAll(SELECTOR).forEach((el) => bind(el, reduce))
    }

    scan()

    const ours = (n) =>
      n.nodeType === Node.ELEMENT_NODE &&
      (n.classList.contains(FILL_CLASS) || n.classList.contains(ROLL_CLASS))

    const observer = new MutationObserver((records) => {
      for (const record of records) {
        for (const node of record.addedNodes) {
          if (ours(node)) continue
          scan()
          return
        }
      }
    })
    observer.observe(document.body, { childList: true, subtree: true })

    return () => {
      observer.disconnect()
      document.querySelectorAll(SELECTOR).forEach((el) => {
        bound.get(el)?.teardown()
        bound.delete(el)
      })
    }
  }, [])
}
