// Section jump curtain

import gsap from 'gsap'
import { CustomEase } from 'gsap/CustomEase'

gsap.registerPlugin(CustomEase)

const SHEET = CustomEase.create('navSheet', 'M0,0 C0.75,0 0.25,1 1,1')

const COVER = 0.5
const HOLD = 0.5
const LIFT = 0.6

let overlay = null
let curtain = null
let busy = false

function mount() {
  if (overlay) return

  overlay = document.createElement('div')
  overlay.setAttribute('data-intro', 'overlay')
  overlay.setAttribute('data-nav-curtain', '')
  overlay.setAttribute('aria-hidden', 'true')
  overlay.style.pointerEvents = 'auto'

  curtain = document.createElement('div')
  curtain.setAttribute('data-intro', 'curtain')

  const stage = document.createElement('div')
  stage.setAttribute('data-intro', 'stage')

  const word = document.createElement('div')
  word.setAttribute('data-intro', 'word')

  const text = document.createElement('h2')
  text.setAttribute('data-intro', 'text')
  text.textContent = 'FLEX'

  word.appendChild(text)
  stage.appendChild(word)
  curtain.appendChild(stage)
  overlay.appendChild(curtain)
}

export function runNavCurtain({ onCovered, onDone } = {}) {
  if (busy) return false
  busy = true

  mount()

  const wipe = { v: 100 }
  const paint = () => curtain.style.setProperty('--intro-wipe', `${wipe.v}%`)

  paint()
  document.body.appendChild(overlay)

  const block = (event) => event.preventDefault()
  window.addEventListener('wheel', block, { passive: false })
  window.addEventListener('touchmove', block, { passive: false })

  const finish = () => {
    window.removeEventListener('wheel', block)
    window.removeEventListener('touchmove', block)
    overlay.remove()
    busy = false
    onDone?.()
  }

  gsap
    .timeline({ onComplete: finish })
    .to(wipe, { v: 0, duration: COVER, ease: SHEET, onUpdate: paint })
    .call(() => onCovered?.())
    .to(wipe, { v: 100, duration: LIFT, ease: SHEET, onUpdate: paint }, `+=${HOLD}`)

  return true
}
