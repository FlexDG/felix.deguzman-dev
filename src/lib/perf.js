import gsap from 'gsap'

const isBrowser = typeof window !== 'undefined'

function mq(query) {
  return isBrowser && typeof window.matchMedia === 'function'
    ? window.matchMedia(query).matches
    : false
}

function override() {
  if (!isBrowser) return null
  const asked = new URLSearchParams(window.location.search).get('perf')
  return asked === 'low' ? true : asked === 'high' ? false : null
}

function staticLow() {
  if (!isBrowser) return false

  const cores = navigator.hardwareConcurrency || 4
  const memory = navigator.deviceMemory || 4

  if (mq('(pointer: coarse)')) return true
  if (cores <= 4) return true
  if (memory <= 4) return true

  return false
}

const forced = override()

let low = forced ?? staticLow()

function publish() {
  if (!isBrowser) return
  document.documentElement.setAttribute('data-perf', low ? 'low' : 'high')
}

export function isLowPerf() {
  return low
}

function demote() {
  if (low) return
  low = true
  publish()
}

const SLOW_FRAME_MS = 24
const WINDOW = 90
const SLOW_BUDGET = 40
const BAD_WINDOWS = 2
const GRACE_FRAMES = 180

let seen = 0
let sampled = 0
let slow = 0
let badWindows = 0

function sample(_time, deltaMs) {
  if (document.hidden) return

  if (seen < GRACE_FRAMES) {
    seen += 1
    return
  }

  if (deltaMs > 200) return

  sampled += 1
  if (deltaMs > SLOW_FRAME_MS) slow += 1
  if (sampled < WINDOW) return

  badWindows = slow >= SLOW_BUDGET ? badWindows + 1 : 0
  sampled = 0
  slow = 0

  if (badWindows >= BAD_WINDOWS) {
    gsap.ticker.remove(sample)
    demote()
  }
}

let watching = false

export function initPerfWatch() {
  if (!isBrowser) return
  publish()
  if (watching || low || forced === false) return
  watching = true
  gsap.ticker.add(sample)
}

publish()
