// Hero section stage

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import Hero from './Hero'
import { scrub } from '../hooks/useSmoothScroll'

gsap.registerPlugin(ScrollTrigger, SplitText)

const SEL = {
  pane: '[data-hero-pane]',
  frame: '[data-hero-frame]',
  canvas: '[data-hero-canvas]',
  title: '[data-hero="title"]',
  wordF: '[data-hero="wordF"]',
  wordRest: '[data-hero="wordRest"]',
  tech: '[data-hero="tech"]',
  headline: '[data-hero="headline"]',
  cardStat: '[data-hero="card-stat"]',
  note: '[data-hero-note]',
  ctaPrimary: '[data-hero-cta="primary"]',
  ctaSecondary: '[data-hero-cta="secondary"]',
  img: '[data-hero-img]',
  figure: '[data-hero="figure"]',
  sign: '[data-hero-sign]',
  signPath: '[data-hero-sign-path]',
  slot: '[data-about="slot"]',
  rig: '[data-about="rig"]',
  navLogo: '[data-nav-logo] img',
  navCta: '[data-nav-cta]',
}

const SIGN_INK_LEFT = 0.354
const SIGN_INK_RIGHT = 0.08
const SIGN_INK_TOP = 0.08

const BAR_SETTLE_MS = 200

const GLYPH_F = {
  left: 0.0126,
  top: 0.0092,
  right: 0.9832,
  bottom: 0.9787,
  stem: 0.3132,
  arm: 0.1862,
  barTop: 0.4136,
  barBottom: 0.577,
  barRight: 0.8931,
  radius: 0.0368,
}

const LOGO_F = {
  left: 0.095,
  top: 0.1005,
  right: 0.5005,
  bottom: 0.909,
  stem: 0.2685,
  arm: 0.273,
  barTop: 0.3315,
  barBottom: 0.5045,
  barRight: 0.5005,
}

const LOGO_RING = { x: 0.5, y: 0.5042, mid: 0.3187 }

const AT = {
  notes: [0.05, 0.1],
  tech: [0.02, 0.12],
  headline: [0.04, 0.14],
  stat: [0.05, 0.27],
  statFade: [0.17, 0.27],
  rest: [0.0, 0.22],
  flight: [0.0, 0.36],
  morph: [0.14, 0.36],
  sweep: [0.4, 0.58],
  ctaMerge: [0.05, 0.2],
  ctaFlight: [0.2, 0.44],
}

let inkCtx = null

function letterInk(el, letter) {
  const cs = getComputedStyle(el)
  const size = parseFloat(cs.fontSize)
  if (!size) return null

  const spec = `${cs.fontWeight} ${size}px ${cs.fontFamily}`
  if (document.fonts?.check && !document.fonts.check(spec)) return null

  if (!inkCtx) inkCtx = document.createElement('canvas').getContext('2d')
  inkCtx.font = spec
  const m = inkCtx.measureText(letter)
  if (!m.actualBoundingBoxAscent) return null

  const range = document.createRange()
  range.selectNodeContents(el)
  const box = range.getBoundingClientRect()
  if (!box.height) return null

  const baseline = box.top + m.fontBoundingBoxAscent
  return {
    left: box.left - m.actualBoundingBoxLeft,
    top: baseline - m.actualBoundingBoxAscent,
    width: m.actualBoundingBoxRight + m.actualBoundingBoxLeft,
    height: m.actualBoundingBoxAscent + m.actualBoundingBoxDescent,
  }
}

function activeSlot() {
  const slots = document.querySelectorAll(SEL.slot)
  for (let i = 0; i < slots.length; i += 1) {
    if (slots[i].getBoundingClientRect().width > 0) return slots[i]
  }
  return null
}

function slotRect(slot, rig) {
  const box = slot.getBoundingClientRect()
  const origin = rig.getBoundingClientRect()
  return {
    left: box.left - origin.left,
    top: box.top - origin.top,
    width: box.width,
    height: box.height,
  }
}

function layoutKey(pane) {
  const rig = document.querySelector(SEL.rig)
  const slot = activeSlot()
  if (!pane || !rig || !slot) return ''
  const r = slotRect(slot, rig)
  const figure = document.querySelector(SEL.figure)
  return [
    pane.offsetWidth,
    pane.offsetHeight,
    Math.round(r.left),
    Math.round(r.top),
    Math.round(r.width),
    Math.round(r.height),
    figure ? Math.round(figure.offsetTop) : -1,
  ].join(':')
}

function buildShrink(tl, q, pane) {
  const frames = q(SEL.frame)
  const canvas = q(SEL.canvas)[0]
  const figure = q(SEL.figure)[0]
  const slot = activeSlot()
  const rig = document.querySelector(SEL.rig)
  if (!frames.length || !canvas || !slot || !rig) return null

  const paneW = pane.offsetWidth
  const paneH = pane.offsetHeight
  const target = slotRect(slot, rig)
  if (!paneW || !paneH || !target.width || !target.height) return null

  const sx = target.width / paneW
  const sy = target.height / paneH
  const fit = Math.max(sx, sy)
  const dx = target.left + target.width / 2 - paneW / 2
  const dy = target.top + target.height / 2 - paneH / 2

  // Where the card's crop window sits over the pane once it has settled. A tall
  // portrait needs the window lifted to the figure's head, or bottom-anchoring
  // it crops the head off.
  const windowH = target.height / fit
  const slack = Math.max(0, paneH - windowH)
  const headroom = windowH * 0.06
  const figureTop = figure ? figure.offsetTop : paneH - windowH
  const restTop = gsap.utils.clamp(0, slack, figureTop - headroom)

  const sign = document.querySelector(SEL.sign)
  if (sign && sign.viewBox.baseVal.width) {
    const vb = sign.viewBox.baseVal
    const path = sign.querySelector(SEL.signPath)
    const bb = path ? path.getBBox() : null
    const ink = bb && bb.width > 0 && bb.height > 0 ? bb : { x: 0, y: 0, width: vb.width, height: vb.height }
    const span = 1 + SIGN_INK_LEFT + SIGN_INK_RIGHT
    const unit = (target.width * span) / ink.width
    sign.style.width = `${vb.width * unit}px`
    sign.style.height = `${vb.height * unit}px`
    sign.style.left = `${target.left - target.width * SIGN_INK_LEFT - ink.x * unit}px`
    sign.style.top = `${target.top - target.height * SIGN_INK_TOP - ink.y * unit}px`
  }

  frames.forEach((frame) => {
    frame.style.transformOrigin = '50% 50%'
  })
  canvas.style.transformOrigin = '50% 50%'

  const state = { p: 0 }

  // Both frame layers carry the same window transform; the canvas cancels the
  // window's anisotropy so the artwork inside only ever scales uniformly, and
  // pans so the window lands on restTop.
  const render = () => {
    const p = state.p
    const wx = 1 + (sx - 1) * p
    const wy = 1 + (sy - 1) * p
    const k = 1 + (fit - 1) * p
    const top = Math.min(restTop * p, Math.max(0, paneH - (paneH * wy) / k))
    const ty = (-(paneH * wy) / 2 - k * (top - paneH / 2)) / wy
    const matrix = `translate(${dx * p}px,${dy * p}px) scale(${wx},${wy})`
    for (let i = 0; i < frames.length; i += 1) frames[i].style.transform = matrix
    canvas.style.transform = `translate(0px,${ty}px) scale(${k / wx},${k / wy})`
  }

  render()
  tl.to(state, { p: 1, duration: 1, ease: 'power1.inOut', onUpdate: render }, 0)

  return () => {
    frames.forEach((frame) => {
      frame.style.transform = ''
      frame.style.transformOrigin = ''
    })
    canvas.style.transform = ''
    canvas.style.transformOrigin = ''
    if (sign) {
      sign.style.width = ''
      sign.style.height = ''
      sign.style.left = ''
      sign.style.top = ''
    }
  }
}

const shown = (el) => !!el && el.offsetParent !== null

// The hero pane is sticky, so it always makes a stacking context — nothing
// inside it can paint above the navbar. Anything flying INTO the navbar has to
// travel in a sibling layer above it, the way useNavMorph flies its labels.
function flightLayer() {
  let layer = document.querySelector('[data-hero-flight]')
  if (!layer) {
    layer = document.createElement('div')
    layer.setAttribute('data-hero-flight', '')
    layer.style.cssText =
      'position:fixed;inset:0;z-index:101;pointer-events:none;contain:layout style;'
    document.body.appendChild(layer)
  }
  return layer
}

const INHERITED = [
  'fontFamily',
  'fontSize',
  'fontWeight',
  'fontStyle',
  'lineHeight',
  'letterSpacing',
  'textTransform',
  'textAlign',
  'wordSpacing',
  'whiteSpace',
  'color',
]

function liftInto(el, rest) {
  const cs = getComputedStyle(el)
  const before = {}
  INHERITED.forEach((prop) => {
    before[prop] = cs[prop]
  })

  const ghost = document.createElement(el.tagName.toLowerCase())
  ghost.setAttribute('aria-hidden', 'true')
  ghost.textContent = el.textContent
  ghost.style.cssText =
    `display:${cs.display};width:${rest.width}px;height:${rest.height}px;` +
    `margin:${cs.margin};padding:0;border:0;font:${cs.font};` +
    `vertical-align:${cs.verticalAlign};visibility:hidden;pointer-events:none;`

  const parent = el.parentNode
  const next = el.nextSibling
  parent.insertBefore(ghost, el)

  // A holder carries the position so the element keeps its own display —
  // position:absolute would blockify inline-flex and change its intrinsic width.
  const holder = document.createElement('div')
  holder.style.cssText =
    'position:absolute;left:0;top:0;margin:0;padding:0;border:0;white-space:nowrap;'
  flightLayer().appendChild(holder)
  holder.appendChild(el)

  // Out of its original parent the element inherits from <body>, so the hero
  // wordmark loses its 489px font. Pin back only what actually drifted —
  // pinning more perturbs the intrinsic size of elements that were already fine.
  const after = getComputedStyle(el)
  const carried = []
  INHERITED.forEach((prop) => {
    if (after[prop] !== before[prop]) {
      el.style[prop] = before[prop]
      carried.push(prop)
    }
  })

  // Baseline and margin collapsing mean the child does not land exactly on the
  // holder's origin, so correct by whatever it actually came out at.
  holder.style.left = `${rest.left}px`
  holder.style.top = `${rest.top}px`
  const got = el.getBoundingClientRect()
  holder.style.left = `${rest.left * 2 - got.left}px`
  holder.style.top = `${rest.top * 2 - got.top}px`

  return () => {
    carried.forEach((prop) => {
      el.style[prop] = ''
    })
    parent.insertBefore(el, next)
    ghost.remove()
    holder.remove()
  }
}

function buildCopy(tl, q, splits, wide) {
  // Below md the notes and the CTA row are display:none — splitting and tweening
  // them there is work the phone pays for and never sees.
  const notes = q(SEL.note).filter(shown)
  if (notes.length) {
    const split = SplitText.create(notes, {
      type: 'lines',
      mask: 'lines',
      linesClass: 'hero-note-line',
    })
    splits.push(split)
    tl.to(
      split.lines,
      { yPercent: -100, duration: AT.notes[1] - AT.notes[0], ease: 'power1.out' },
      AT.notes[0],
    )
  }

  tl.to(
    q(SEL.tech),
    { autoAlpha: 0, y: -24, duration: AT.tech[1] - AT.tech[0], ease: 'power1.in' },
    AT.tech[0],
  ).to(
    q(SEL.headline),
    { autoAlpha: 0, duration: AT.headline[1] - AT.headline[0], ease: 'power1.in' },
    AT.headline[0],
  )

  tl.to(
    q(SEL.cardStat),
    { scale: 0.3, y: '-14vw', duration: AT.stat[1] - AT.stat[0], ease: 'power1.in' },
    AT.stat[0],
  ).to(
    q(SEL.cardStat),
    { autoAlpha: 0, duration: AT.statFade[1] - AT.statFade[0], ease: 'power1.in' },
    AT.statFade[0],
  )

  tl.to(
    q(wide ? SEL.wordRest : SEL.title),
    { opacity: 0, duration: AT.rest[1] - AT.rest[0], ease: 'power1.in' },
    AT.rest[0],
  )

  if (!wide) {
    const rest = q('[data-hero="card-nav"], [data-hero="cta"]').filter(shown)
    if (rest.length) {
      tl.to(
        rest,
        { autoAlpha: 0, y: -24, duration: AT.stat[1] - AT.stat[0], ease: 'power1.in' },
        AT.stat[0],
      )
    }
  }
}

const SVG_NS = 'http://www.w3.org/2000/svg'
const F_X = ['left', 'right', 'stem', 'barRight']
const F_Y = ['top', 'bottom', 'arm', 'barTop', 'barBottom']
const KAPPA = 0.5523

function fShape(spec, box) {
  const shape = {}
  F_X.forEach((key) => {
    shape[key] = box.left + spec[key] * box.width
  })
  F_Y.forEach((key) => {
    shape[key] = box.top + spec[key] * box.height
  })
  return shape
}

function fPath(f, radius) {
  const pts = [
    [f.left, f.top],
    [f.right, f.top],
    [f.right, f.arm],
    [f.stem, f.arm],
    [f.stem, f.barTop],
    [f.barRight, f.barTop],
    [f.barRight, f.barBottom],
    [f.stem, f.barBottom],
    [f.stem, f.bottom],
    [f.left, f.bottom],
  ]
  const n = pts.length
  const at = (x, y) => `${x.toFixed(2)} ${y.toFixed(2)}`
  let d = ''
  for (let i = 0; i <= n; i += 1) {
    const [px, py] = pts[(i + n - 1) % n]
    const [vx, vy] = pts[i % n]
    const [nx, ny] = pts[(i + 1) % n]
    const inLen = Math.hypot(vx - px, vy - py)
    const outLen = Math.hypot(nx - vx, ny - vy)
    const r = Math.min(radius, inLen / 2, outLen / 2)
    const ix = inLen ? (vx - px) / inLen : 0
    const iy = inLen ? (vy - py) / inLen : 0
    const ox = outLen ? (nx - vx) / outLen : 0
    const oy = outLen ? (ny - vy) / outLen : 0
    const ex = vx - ix * r
    const ey = vy - iy * r
    const xx = vx + ox * r
    const xy = vy + oy * r
    if (i === 0) {
      d = `M${at(xx, xy)}`
    } else {
      const k = KAPPA * r
      d += `L${at(ex, ey)}C${at(ex + ix * k, ey + iy * k)} ${at(xx - ox * k, xy - oy * k)} ${at(xx, xy)}`
    }
  }
  return `${d}Z`
}

function buildFlight(tl, q, lifts) {
  const wordF = q(SEL.wordF)[0]
  const logo = document.querySelector(SEL.navLogo)
  if (!wordF || !logo) return

  const ink = letterInk(wordF, 'F')
  const logoBox = logo.getBoundingClientRect()
  if (!ink || !ink.width || !logoBox.width) return

  const glyph = fShape(GLYPH_F, ink)
  const mark = fShape(LOGO_F, logoBox)
  const frame = (f) => ({
    left: f.left,
    top: f.top,
    width: f.right - f.left,
    height: f.bottom - f.top,
  })
  const from = frame(glyph)
  const to = frame(mark)
  const shareX = F_X.map((key) => [
    key,
    (glyph[key] - from.left) / from.width,
    (mark[key] - to.left) / to.width,
  ])
  const shareY = F_Y.map((key) => [
    key,
    (glyph[key] - from.top) / from.height,
    (mark[key] - to.top) / to.height,
  ])
  const round = (GLYPH_F.radius * ink.height) / from.height
  const ringY = logoBox.top + (LOGO_RING.y + 0.01) * logoBox.height
  const ringMid = LOGO_RING.mid * logoBox.width
  const ringAt = `${LOGO_RING.x * 100}% ${(LOGO_RING.y * 100).toFixed(2)}%`

  const rig = document.createElement('div')
  rig.setAttribute('aria-hidden', 'true')
  rig.style.cssText = 'position:absolute;inset:0;'
  const svg = document.createElementNS(SVG_NS, 'svg')
  svg.setAttribute('width', '100%')
  svg.setAttribute('height', '100%')
  svg.style.cssText = 'position:absolute;inset:0;overflow:visible;'
  const path = document.createElementNS(SVG_NS, 'path')
  path.setAttribute('fill', getComputedStyle(wordF).color)
  svg.appendChild(path)
  const bowl = document.createElement('img')
  bowl.alt = ''
  bowl.src = logo.currentSrc || logo.src
  bowl.style.cssText =
    `position:absolute;left:${logoBox.left}px;top:${logoBox.top}px;` +
    `width:${logoBox.width}px;height:${logoBox.height}px;max-width:none;visibility:hidden;`
  rig.append(svg, bowl)

  const state = { fly: 0, morph: 0, sweep: 0 }
  const lerp = (a, b, t) => a + (b - a) * t
  const draw = () => {
    const { fly, morph, sweep } = state
    const left = lerp(from.left, to.left, fly)
    const top = lerp(from.top, to.top, fly)
    const width = lerp(from.width, to.width, fly)
    const height = lerp(from.height, to.height, fly)
    const f = {}
    shareX.forEach(([key, a, b]) => {
      f[key] = left + lerp(a, b, morph) * width
    })
    shareY.forEach(([key, a, b]) => {
      f[key] = top + lerp(a, b, morph) * height
    })
    const angle = sweep * 270
    if (sweep > 0) f.bottom = Math.max(ringY, f.bottom - (ringMid * angle * Math.PI) / 180)
    path.setAttribute('d', fPath(f, round * height * (1 - morph)))

    const mask = `conic-gradient(from 273deg at ${ringAt}, transparent ${356 - angle}deg, #000 ${357 - angle}deg)`
    bowl.style.visibility = sweep > 0 ? 'visible' : 'hidden'
    bowl.style.maskImage = mask
    bowl.style.webkitMaskImage = mask
  }
  draw()

  gsap.set(logo, { autoAlpha: 0 })
  lifts.push(() => {
    flightLayer().appendChild(rig)
    wordF.style.visibility = 'hidden'
    return () => {
      rig.remove()
      wordF.style.visibility = ''
    }
  })

  tl.to(
    state,
    {
      fly: 1,
      duration: AT.flight[1] - AT.flight[0],
      ease: 'power1.inOut',
      onUpdate: draw,
    },
    AT.flight[0],
  )
    .to(
      state,
      {
        morph: 1,
        duration: AT.morph[1] - AT.morph[0],
        ease: 'power2.inOut',
        onUpdate: draw,
      },
      AT.morph[0],
    )
    .to(
      state,
      {
        sweep: 1,
        duration: AT.sweep[1] - AT.sweep[0],
        ease: 'power1.inOut',
        onUpdate: draw,
      },
      AT.sweep[0],
    )
    .set(logo, { autoAlpha: 1 }, AT.sweep[1])
    .set(rig, { autoAlpha: 0 }, AT.sweep[1])
}

function buildCta(tl, q, lifts) {
  const primary = q(SEL.ctaPrimary)[0]
  const secondary = q(SEL.ctaSecondary)[0]
  const navCta = document.querySelector(SEL.navCta)
  if (!primary || !secondary || !navCta) return

  const from = primary.getBoundingClientRect()
  const side = secondary.getBoundingClientRect()
  const to = navCta.getBoundingClientRect()
  if (!from.width || !to.width) return

  const navStyle = getComputedStyle(navCta)
  const sx = to.width / from.width
  const sy = to.height / from.height
  const radius = parseFloat(navStyle.borderRadius) || 0
  const rest = parseFloat(getComputedStyle(primary).borderRadius) || 0

  gsap.set([primary, secondary], { transformOrigin: 'top left' })
  gsap.set(navCta, { autoAlpha: 0 })
  lifts.push(() => liftInto(primary, from))

  tl.to(
    secondary,
    {
      x: from.left - side.left,
      y: from.top - side.top,
      duration: AT.ctaMerge[1] - AT.ctaMerge[0],
      ease: 'power2.inOut',
    },
    AT.ctaMerge[0],
  ).to(
    secondary,
    { autoAlpha: 0, duration: 0.08, ease: 'power1.in' },
    AT.ctaMerge[1] - 0.08,
  )

  tl.to(
    primary,
    {
      x: to.left - from.left,
      y: to.top - from.top,
      scaleX: sx,
      scaleY: sy,
      backgroundColor: navStyle.backgroundColor,
      color: navStyle.color,
      duration: AT.ctaFlight[1] - AT.ctaFlight[0],
      ease: 'power1.inOut',
    },
    AT.ctaFlight[0],
  ).fromTo(
    primary,
    {
      borderTopLeftRadius: `${rest}px ${rest}px`,
      borderTopRightRadius: `${rest}px ${rest}px`,
      borderBottomLeftRadius: `${rest}px ${rest}px`,
      borderBottomRightRadius: `${rest}px ${rest}px`,
    },
    {
      borderTopLeftRadius: `${radius / sx}px ${radius / sy}px`,
      borderTopRightRadius: `${radius / sx}px ${radius / sy}px`,
      borderBottomLeftRadius: `${radius / sx}px ${radius / sy}px`,
      borderBottomRightRadius: `${radius / sx}px ${radius / sy}px`,
      duration: AT.ctaFlight[1] - AT.ctaFlight[0],
      ease: 'power1.inOut',
      immediateRender: false,
    },
    AT.ctaFlight[0],
  )

  // Both are the same button at the same rect by now, so swap on one frame.
  // Cross-fading them stacks two translucent copies and reads as a ghost.
  tl.set(navCta, { autoAlpha: 1 }, AT.ctaFlight[1]).set(
    primary,
    { autoAlpha: 0 },
    AT.ctaFlight[1],
  )
}

export default function HeroStage() {
  const stageRef = useRef(null)

  useEffect(() => {
    const stage = stageRef.current
    if (!stage) return undefined

    const mm = gsap.matchMedia()

    mm.add(
      {
        reduced: '(prefers-reduced-motion: reduce)',
        narrow: '(max-width: 1023px)',
        wide: '(min-width: 1024px)',
      },
      (self) => {
        const { reduced, wide } = self.conditions
        if (reduced) return undefined

        const q = gsap.utils.selector(stage)
        const pane = q(SEL.pane)[0]
        if (!pane) return undefined

        let splits = []
        let trigger = null
        let tl = null
        let clearShrink = null
        let building = false
        let disposed = false
        let builtKey = ''
        let lifts = []
        let drops = []

        const handoffs = [SEL.navLogo, SEL.navCta]

        const teardown = () => {
          trigger?.kill()
          trigger = null
          tl?.revert()
          tl?.kill()
          tl = null
          clearShrink?.()
          clearShrink = null
          pane.removeAttribute('data-shrinking')
          drops.forEach((drop) => drop())
          drops = []
          lifts = []
          splits.forEach((split) => split.revert())
          splits = []
          handoffs.forEach((sel) => {
            const el = document.querySelector(sel)
            if (el) gsap.set(el, { clearProps: 'opacity,visibility' })
          })
        }

        const build = () => {
          if (building || disposed) return
          building = true
          builtKey = layoutKey(pane)
          teardown()

          tl = gsap.timeline({ paused: true, defaults: { ease: 'none' } })
          clearShrink = buildShrink(tl, q, pane)
          buildCopy(tl, q, splits, wide)
          if (wide) {
            buildFlight(tl, q, lifts)
            buildCta(tl, q, lifts)
          }
          tl.set({}, {}, 1)

          if (import.meta.env.DEV) window.__heroTl = tl

          trigger = ScrollTrigger.create({
            trigger: stage,
            start: 'top top',
            end: () => `+=${pane.offsetHeight}`,
            scrub: wide ? true : scrub(0.4),
            animation: tl,
            onToggle: (self) => {
              pane.toggleAttribute('data-shrinking', self.isActive)
              // Deferred to first scroll so the intro still animates these in
              // place; nothing can scroll while the curtain is up.
              if (self.isActive && lifts.length) {
                drops = lifts.map((lift) => lift())
                lifts = []
              }
            },
          })
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

        const img = document.querySelector(SEL.img)
        const refresh = () => ScrollTrigger.refresh()
        if (img && !img.complete) img.addEventListener('load', refresh, { once: true })

        // The landing box is measured once per refresh, so anything that reflows
        // the About column has to ask for one or the card flies to a stale slot.
        // A phone's collapsing URL bar is not that: rebuilding mid-scrub reverts
        // the timeline for a frame, which reads as the hero flashing and jumping.
        let queued = 0
        let settling = 0
        let seenWidth = window.innerWidth
        const watch = new ResizeObserver(() => {
          if (!ready || disposed) return
          const barOnly = window.innerWidth === seenWidth
          seenWidth = window.innerWidth
          if (barOnly && layoutKey(pane) === builtKey) return
          cancelAnimationFrame(queued)
          clearTimeout(settling)
          if (barOnly) settling = setTimeout(refresh, BAR_SETTLE_MS)
          else queued = requestAnimationFrame(refresh)
        })
        const rig = document.querySelector(SEL.rig)
        document.querySelectorAll(SEL.slot).forEach((el) => watch.observe(el))
        if (rig?.firstElementChild) watch.observe(rig.firstElementChild)

        const onRefresh = () => {
          if (!ready || building || disposed) return
          if (layoutKey(pane) === builtKey) return
          build()
        }
        ScrollTrigger.addEventListener('refresh', onRefresh)

        // The intro parks the hero cast 30px low while it plays, so anything
        // measured during it is off by that. Its own refresh cannot be trusted
        // to rebuild us — the offset is a transform, so layoutKey sees no
        // change — and the rects only settle once the intro reverts them.
        const onIntroDone = () => {
          if (disposed) return
          ready = true
          build()
        }
        window.addEventListener('hero:intro-done', onIntroDone)

        return () => {
          disposed = true
          cancelAnimationFrame(raf)
          cancelAnimationFrame(queued)
          clearTimeout(settling)
          watch.disconnect()
          img?.removeEventListener('load', refresh)
          window.removeEventListener('hero:intro-done', onIntroDone)
          ScrollTrigger.removeEventListener('refresh', onRefresh)
          teardown()
        }
      },
      stage,
    )

    return () => mm.revert()
  }, [])

  return (
    <div
      ref={stageRef}
      data-hero-stage
      className="pointer-events-none relative z-[2] h-[var(--hero-stage-h)]"
    >
      <Hero />
    </div>
  )
}
