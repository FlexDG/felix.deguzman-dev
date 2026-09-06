// Gaming PC scroll timeline

import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { scrub } from '../../hooks/useSmoothScroll'
import { ACTS } from './pcContent'

gsap.registerPlugin(ScrollTrigger)

const YAW_OPEN = 1.62
const YAW_END = 1.7
const YAW_OPEN_NARROW = 1.5
const YAW_END_NARROW = 1.56

const RISE = 46
const EXIT = 18

const DOOR_OPEN = 1.676
const DOOR_OPEN_NARROW = 1.5

const DESKTOP = {
  front: {
    azimuth: 0,
    polar: 1.658,
    distance: 14.0,
    fov: 32,
    targetX: 0,
    targetY: 2.5,
    targetZ: 0,
    shiftX: 0,
    shiftY: 0,
    fogNear: 18,
    fogFar: 42,
    parallax: 0.2,
    idle: 1,
  },
  turn: {
    azimuth: 0.05,
    polar: 1.545,
    distance: 14.0,
    fov: 32,
    targetX: 0,
    targetY: 2.6,
    targetZ: 0,
    shiftX: 0,
    shiftY: 0.1,
    fogNear: 16,
    fogFar: 38,
    parallax: 0.17,
    idle: 0.9,
  },
  face: {
    azimuth: 0.05,
    polar: 1.525,
    distance: 14.0,
    fov: 31,
    targetX: 0,
    targetY: 2.7,
    targetZ: 0,
    shiftX: 0,
    shiftY: 0.1,
    fogNear: 15,
    fogFar: 36,
    parallax: 0.12,
    idle: 0.55,
  },
  inside: {
    azimuth: 0.05,
    polar: 1.5,
    distance: 7.6,
    fov: 30,
    targetX: 0,
    targetY: 2.72,
    targetZ: 0.25,
    shiftX: 0,
    shiftY: 0.1,
    fogNear: 13,
    fogFar: 32,
    parallax: 0.07,
    idle: 0.35,
  },
  drift: {
    azimuth: 0.02,
    polar: 1.508,
    distance: 7.15,
    fov: 30,
    targetX: 0,
    targetY: 2.68,
    targetZ: 0.32,
    shiftX: 0,
    shiftY: 0.06,
    fogNear: 12,
    fogFar: 30,
    parallax: 0.06,
    idle: 0.3,
  },
  exit: {
    azimuth: 0.05,
    polar: 1.6,
    distance: 18,
    fov: 30,
    targetX: 0,
    targetY: 2.4,
    targetZ: 0,
    shiftX: 0,
    shiftY: 0,
    fogNear: 17,
    fogFar: 40,
    parallax: 0.15,
    idle: 0.7,
  },
}

const NARROW = {
  front: { ...DESKTOP.front, polar: 1.62, distance: 13.4, fov: 36, parallax: 0.1 },
  turn: { ...DESKTOP.turn, polar: 1.56, distance: 13.4, fov: 36, parallax: 0.09 },
  face: {
    ...DESKTOP.face,
    azimuth: 0.05,
    polar: 1.53,
    distance: 13.4,
    fov: 35,
    shiftY: 0.08,
    parallax: 0.08,
  },
  inside: {
    ...DESKTOP.inside,
    azimuth: 0.05,
    polar: 1.51,
    distance: 11.6,
    fov: 34,
    shiftY: 0.05,
    parallax: 0.05,
  },
  drift: {
    ...DESKTOP.drift,
    azimuth: 0.02,
    polar: 1.515,
    distance: 11.1,
    fov: 34,
    shiftY: 0,
    parallax: 0.05,
  },
  exit: {
    ...DESKTOP.exit,
    polar: 1.6,
    distance: 22,
    fov: 32,
    targetY: 2.3,
    fogNear: 20,
    fogFar: 44,
    parallax: 0.08,
    idle: 0.6,
  },
}

export function createShot() {
  return { ...DESKTOP.front }
}

export function createFx() {
  return { rgb: 0.05, vent: 0, glowLow: 0, glowHigh: 0, spin: 0 }
}

export function applyStaticShot(api, narrow) {
  const shots = narrow ? NARROW : DESKTOP
  Object.assign(api.shot, shots.face, { shiftX: 0, shiftY: 0, parallax: 0, idle: 0 })
  Object.assign(api.fx, { rgb: 1.3, vent: 0.14, glowLow: 2.2, glowHigh: 1.45, spin: 0 })
  api.rig.rotation.y = narrow ? YAW_OPEN_NARROW : YAW_OPEN
  if (api.parts.sidePanel) api.parts.sidePanel.rotation.y = narrow ? -DOOR_OPEN_NARROW : -DOOR_OPEN
  api.setFrozen(true)
}

export function buildPCTimeline({ stage, root, api, narrow }) {
  const q = gsap.utils.selector(root)

  const fill = q('[data-gp="rail-fill"]')[0]
  const now = q('[data-gp="rail-now"]')[0]
  let shown = -1
  const paintRail = (progress) => {
    if (fill) fill.style.transform = `scaleY(${progress})`
    if (!now) return
    let index = 1
    for (let i = 0; i < ACTS.length; i += 1) if (progress >= ACTS[i].at[0]) index = i + 1
    if (index !== shown) {
      shown = index
      now.textContent = String(index).padStart(2, '0')
    }
  }

  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      trigger: stage,
      start: 'top top',
      end: 'bottom bottom',
      scrub: scrub(0.9),
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        paintRail(self.progress)
        api?.nudge()
      },
    },
  })

  if (api) buildCopyTimeline(tl, q)
  else buildFlatCopy(q)

  if (api) {
    const { shot, fx, rig, parts } = api
    const shots = narrow ? NARROW : DESKTOP

    tl.set(shot, { ...shots.front }, 0)
    tl.set(fx, { rgb: 0.05, vent: 0, glowLow: 0, glowHigh: 0, spin: 0 }, 0)

    const move = (to, at, duration, ease = 'power2.inOut') =>
      tl.to(shot, { ...to, duration, ease }, at)

    move(shots.turn, 0.04, 0.12)
    move(shots.face, 0.2, 0.14)
    move(shots.inside, 0.34, 0.14, 'power1.inOut')
    move(shots.drift, 0.5, 0.4, 'none')
    move(shots.exit, 0.94, 0.06)

    tl.to(
      rig.rotation,
      { y: narrow ? YAW_OPEN_NARROW : YAW_OPEN, duration: 0.16, ease: 'power2.inOut' },
      0.05,
    )
    tl.to(
      rig.rotation,
      { y: narrow ? YAW_END_NARROW : YAW_END, duration: 0.79, ease: 'none' },
      0.21,
    )

    const panel = parts.sidePanel
    if (panel) {
      tl.set(panel.rotation, { y: 0, z: 0 }, 0)
      tl.to(
        panel.rotation,
        { y: -(narrow ? DOOR_OPEN_NARROW : DOOR_OPEN), duration: 0.16, ease: 'power3.out' },
        0.08,
      )
    }

    tl.to(fx, { vent: 0.34, duration: 0.08, ease: 'power2.out' }, 0.01)
    tl.to(fx, { vent: 0.1, duration: 0.15, ease: 'power1.inOut' }, 0.12)

    tl.to(fx, { rgb: 0.6, duration: 0.1, ease: 'power1.inOut' }, 0.12)
    tl.to(fx, { rgb: 1.5, duration: 0.14, ease: 'power2.out' }, 0.22)
    tl.to(fx, { rgb: 1.25, duration: 0.2, ease: 'power1.inOut' }, 0.8)

    tl.to(fx, { glowLow: 0.8, glowHigh: 0.5, duration: 0.09, ease: 'power1.out' }, 0.13)
    tl.to(fx, { glowLow: 2.5, glowHigh: 1.6, duration: 0.14, ease: 'power2.out' }, 0.24)
    tl.to(fx, { glowLow: 2.0, glowHigh: 1.3, duration: 0.2, ease: 'power1.inOut' }, 0.8)

    tl.to(fx, { spin: 3.2, duration: 0.12, ease: 'power2.out' }, 0.18)

    const drift = (object, to, at = 0.6) =>
      object && tl.to(object.position, { ...to, duration: 0.2, ease: 'power1.inOut' }, at)
    drift(parts.gpu, { x: -0.035, y: -0.012 })
    drift(parts.radiator, { y: 0.03 })
    drift(parts.ram, { x: -0.022 })
    drift(parts.cpuBlock, { x: -0.018 }, 0.62)
  }

  tl.set({}, {}, 1)

  paintRail(0)

  if (import.meta.env.DEV) window.__gpTl = tl

  return tl
}

function buildCopyTimeline(tl, q) {
  for (const act of ACTS) {
    const block = q(`[data-act="${act.id}"]`)[0]
    if (!block) continue
    const [inFrom, inTo, outFrom, outTo] = act.at

    tl.set(block, { autoAlpha: 0, y: RISE }, 0)

    tl.to(
      block,
      { autoAlpha: 1, y: 0, duration: inTo - inFrom, ease: 'power2.out', force3D: false },
      inFrom,
    )

    if (outTo > outFrom) {
      tl.to(
        block,
        { autoAlpha: 0, y: -EXIT, duration: outTo - outFrom, ease: 'power1.in', force3D: false },
        outFrom,
      )
    }
  }
}

function buildFlatCopy(q) {
  for (const act of ACTS) {
    const block = q(`[data-act="${act.id}"]`)[0]
    if (!block) continue

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: block,
        start: 'top 84%',
        toggleActions: 'play none none reverse',
      },
    })

    tl.from(block, { autoAlpha: 0, y: 26, duration: 0.8, ease: 'power2.out' })

    const bits = block.querySelectorAll('[data-gp-stagger]')
    if (bits.length > 1) {
      tl.from(bits, { autoAlpha: 0, y: 18, duration: 0.7, ease: 'power2.out', stagger: 0.09 }, 0.12)
    }
  }
}
