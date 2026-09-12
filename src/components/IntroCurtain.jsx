// Load intro curtain

import { useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { CustomEase } from 'gsap/CustomEase'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { getLenis } from '../hooks/useSmoothScroll'

gsap.registerPlugin(ScrollTrigger, CustomEase)

const REDUCED =
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

const EASE = CustomEase.create('introSheet', 'M0,0 C0.75,0 0.25,1 1,1')

const SETTLE = 'power2.out'

const T = {
  move: 0.8,
  beat: 1,
  photo: 1,
  fade: 0.4,
  slide: 0.7,
  holdPhoto: 0.3,
  holdRest: 0.2,
}

const AT = {
  rise: 0,
  measure: T.beat - 0.1,
  travel: T.beat,
  wipe: T.beat * 2,
}
AT.uncovered = AT.wipe + T.move
AT.photo = AT.uncovered + T.holdPhoto
AT.settle = AT.photo + T.photo + T.holdRest

const SEL = {
  word: '[data-hero="word"]',
  portrait: '[data-hero="portrait"]',
  tech: '[data-hero="tech"]',
  headlineLines: '[data-hero="headline"] > span',
  cardStat: '[data-hero="card-stat"]',
  cardNav: '[data-hero="card-nav"]',
  cta: '[data-hero="cta"]',
  notes: '[data-hero="notes"]',
  nav: '[data-portal-fade]',
}

const CAST = [
  { sel: SEL.tech, from: { y: 30 }, at: 0 },
  { sel: SEL.headlineLines, from: { yPercent: 40 }, at: 0.12, stagger: 0.08 },
  { sel: SEL.cardStat, from: { xPercent: -12 }, at: 0.3 },
  { sel: SEL.cardNav, from: { xPercent: 12 }, at: 0.38 },
  { sel: SEL.cta, from: { y: 30 }, at: 0.5 },
  { sel: SEL.notes, from: { y: 24 }, at: 0.58 },
  { sel: SEL.nav, from: {}, at: 0.66 },
]

const PHOTO_FROM = { scale: 1.06, blur: 26 }

function inkRect(el) {
  const range = document.createRange()
  range.selectNodeContents(el)
  return range.getBoundingClientRect()
}

function heroImageReady() {
  const img = document.querySelector('[data-hero-img]')
  if (!img || img.complete) return Promise.resolve()
  return new Promise((resolve) => {
    img.addEventListener('load', resolve, { once: true })
    img.addEventListener('error', resolve, { once: true })
  })
}

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export default function IntroCurtain() {
  const curtainRef = useRef(null)
  const wordRef = useRef(null)
  const clipRef = useRef(null)
  const textRef = useRef(null)

  const [done, setDone] = useState(REDUCED)

  useLayoutEffect(() => {
    document.documentElement.removeAttribute('data-intro-boot')
    if (REDUCED) return undefined

    const curtain = curtainRef.current
    const word = wordRef.current
    const clip = clipRef.current
    const text = textRef.current
    const heroWord = document.querySelector(SEL.word)

    if (!curtain || !word || !clip || !text || !heroWord) {
      setDone(true)
      return undefined
    }

    const pick = (sel) => gsap.utils.toArray(sel)

    const GATE = 'data-intro-holding'
    const openHead = () => document.documentElement.removeAttribute(GATE)
    document.documentElement.setAttribute(GATE, '')

    const block = (e) => e.preventDefault()
    const onScroll = () => {
      if (window.scrollY !== 0) window.scrollTo(0, 0)
    }
    const TOUCH_GATE = 'data-scroll-locked'
    const lock = () => {
      document.documentElement.setAttribute(TOUCH_GATE, '')
      getLenis()?.stop()
    }
    const unlock = () => {
      document.documentElement.removeAttribute(TOUCH_GATE)
      getLenis()?.start()
      window.removeEventListener('wheel', block)
      window.removeEventListener('touchmove', block)
      window.removeEventListener('scroll', onScroll)
    }

    window.scrollTo(0, 0)
    lock()
    window.addEventListener('wheel', block, { passive: false })
    window.addEventListener('touchmove', block, { passive: false })
    window.addEventListener('scroll', onScroll, { passive: true })
    const relock = requestAnimationFrame(lock)

    let killed = false

    const floor = setTimeout(() => {
      if (!killed) unlock()
    }, 9000)

    let ctx
    try {
      ctx = gsap.context(() => {
        gsap.set(pick(SEL.portrait), { opacity: 0 })
        CAST.forEach(({ sel, from }) => gsap.set(pick(sel), { opacity: 0, ...from }))

        gsap.set(text, { yPercent: 108 })
        gsap.set(word, { x: 0, y: 0, scale: 1, transformOrigin: '50% 50%' })

        const groundLine = () => {
          const cs = getComputedStyle(text)
          const size = parseFloat(cs.fontSize)
          const box = clip.getBoundingClientRect().height
          if (!size || !box) return

          const ctx2d = document.createElement('canvas').getContext('2d')
          ctx2d.font = `${cs.fontWeight} ${size}px ${cs.fontFamily}`
          const m = ctx2d.measureText(text.textContent.trim())
          const ascent = m.fontBoundingBoxAscent
          const descent = m.fontBoundingBoxDescent
          if (!ascent) return

          const baseline = (box - (ascent + descent)) / 2 + ascent
          const dip = Math.max(0, m.actualBoundingBoxDescent || 0)
          clip.style.setProperty(
            '--intro-mask-bottom',
            `${Math.max(0, box - baseline - dip - 1)}px`,
          )
        }

        let plan = { dx: 0, dy: 0 }
        let waitingForFont = false
        const fontReady = () => {
          if (!document.fonts?.check) return true
          const cs = getComputedStyle(heroWord)
          return document.fonts.check(`${cs.fontWeight} ${parseFloat(cs.fontSize)}px ${cs.fontFamily}`)
        }
        const prepare = () => {
          if (!fontReady()) {
            if (waitingForFont) return
            waitingForFont = true
            tl.pause()
            document.fonts.ready.then(() => {
              if (killed) return
              waitingForFont = false
              prepare()
              tl.resume()
            })
            return
          }
          const heroSize = getComputedStyle(heroWord).fontSize
          const heroFS = parseFloat(heroSize) || 0
          const introFS = parseFloat(getComputedStyle(text).fontSize) || 0
          if (!heroFS || !introFS) return

          gsap.set(clip, { clipPath: 'none' })

          text.style.fontSize = heroSize
          gsap.set(word, { x: 0, y: 0, scale: 1 })

          const rest = inkRect(text)
          const target = inkRect(heroWord)

          gsap.set(word, { scale: introFS / heroFS })

          plan = {
            dx: target.left + target.width / 2 - (rest.left + rest.width / 2),
            dy: target.top + target.height / 2 - (rest.top + rest.height / 2),
          }
        }

        const snap = () => {
          text.style.fontSize = getComputedStyle(heroWord).fontSize
          const cur = inkRect(text)
          const target = inkRect(heroWord)
          gsap.set(word, {
            x: `+=${target.left - cur.left}`,
            y: `+=${target.top - cur.top}`,
          })
        }

        const tl = gsap.timeline({
          paused: true,
          onComplete: () => {
            setDone(true)
            requestAnimationFrame(() => {
              ctx.revert()
              window.dispatchEvent(new Event('resize'))
              ScrollTrigger.refresh()
              clearTimeout(floor)
              unlock()
              window.dispatchEvent(new Event('hero:intro-done'))
            })
          },
        })

        tl.to(text, { yPercent: 0, duration: T.move, ease: EASE }, AT.rise)

        tl.call(prepare, null, AT.measure).to(
          word,
          {
            x: () => plan.dx,
            y: () => plan.dy,
            scale: 1,
            duration: T.move,
            ease: EASE,
          },
          AT.travel,
        )

        const edge = { v: 0 }

        tl.call(snap, null, AT.wipe - 0.05).to(
          edge,
          {
            v: 100,
            duration: T.move,
            ease: EASE,
            onUpdate: () => curtain.style.setProperty('--intro-wipe', `${edge.v}%`),
          },
          AT.wipe,
        )

        tl.set(
          pick(SEL.portrait),
          { scale: PHOTO_FROM.scale, filter: `blur(${PHOTO_FROM.blur}px)` },
          AT.photo,
        )
          .to(pick(SEL.portrait), { opacity: 1, duration: T.fade, ease: 'none' }, AT.photo)
          .to(
            pick(SEL.portrait),
            { scale: 1, filter: 'blur(0px)', duration: T.photo, ease: SETTLE },
            AT.photo,
          )

        tl.call(openHead, null, AT.photo + T.photo)

        CAST.forEach(({ sel, from, at, stagger = 0 }) => {
          const targets = pick(sel)
          if (!targets.length) return
          const start = AT.settle + at

          tl.to(targets, { opacity: 1, duration: T.fade, ease: 'none', stagger }, start)

          const keys = Object.keys(from)
          if (!keys.length) return
          const to = {}
          keys.forEach((k) => {
            to[k] = 0
          })
          tl.to(targets, { ...to, duration: T.slide, ease: SETTLE, stagger }, start)
        })

        if (import.meta.env.DEV) window.__introTl = tl

        Promise.race([
          Promise.all([document.fonts?.ready ?? Promise.resolve(), heroImageReady()]),
          wait(4000),
        ]).then(() => {
          if (killed) return
          lock()
          groundLine()
          tl.play()
        })

        document.fonts?.ready.then(() => {
          if (!killed) groundLine()
        })
      })
    } catch (err) {
      console.error('[IntroCurtain] setup failed — skipping the intro.', err)
      clearTimeout(floor)
      unlock()
      openHead()
      queueMicrotask(() => setDone(true))
    }

    return () => {
      killed = true
      clearTimeout(floor)
      cancelAnimationFrame(relock)
      unlock()
      openHead()
      ctx?.revert()
    }
  }, [])

  if (done) return null

  return (
    <div data-intro="overlay" aria-hidden="true">
      <div ref={curtainRef} data-intro="curtain">
        <div data-intro="stage">
          <div ref={wordRef} data-intro="word">
            <div ref={clipRef} data-intro="clip">
              <h2 ref={textRef} data-intro="text">
                FLEX
              </h2>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
