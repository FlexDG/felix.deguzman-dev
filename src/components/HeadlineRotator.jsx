// Hero headline rotator

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { onViewportResize } from '../hooks/onViewportResize'

const EDGE = 16

const REDUCED =
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

export default function HeadlineRotator({ words, cadence = 2, duration = 0.62 }) {
  const colRef = useRef(null)
  const maskRef = useRef(null)

  useEffect(() => {
    const col = colRef.current
    if (REDUCED || !col || words.length < 2) return undefined

    const stops = words.length + 1
    const hold = Math.max(0, cadence - duration)

    const tl = gsap.timeline({ paused: true, repeat: -1 })
    for (let i = 1; i < stops; i += 1) {
      tl.to(
        col,
        {
          yPercent: (-100 * i) / stops,
          duration,
          ease: 'power3.inOut',
        },
        `+=${hold}`,
      )
    }
    tl.set(col, { yPercent: 0 })

    let started = false
    const start = () => {
      if (started) return
      started = true
      tl.play()
    }
    window.addEventListener('hero:intro-done', start)
    const fallback = window.setTimeout(start, 9500)

    return () => {
      window.removeEventListener('hero:intro-done', start)
      clearTimeout(fallback)
      tl.kill()
    }
  }, [words, cadence, duration])

  useEffect(() => {
    const mask = maskRef.current
    if (!mask) return undefined

    const fit = () => {
      const room = document.documentElement.clientWidth - mask.getBoundingClientRect().left - EDGE
      mask.querySelectorAll('[data-word]').forEach((word) => {
        word.style.transform = ''
        const ink = word.getBoundingClientRect().width
        if (ink > room) word.style.transform = `scale(${room / ink})`
      })
    }

    fit()
    document.fonts?.ready.then(fit)
    return onViewportResize(fit)
  }, [words])

  return (
    <span
      className="block h-[var(--rot-line)]"
      aria-label={words[0]}
      style={{
        '--rot-line': 'calc(var(--text-h2--line-height) * 1em)',
        '--rot-cell': 'calc(var(--text-h2--line-height) * 1em + 0.14em)',
      }}
    >
      <span
        ref={maskRef}
        className="block h-[var(--rot-cell)] w-max overflow-hidden whitespace-nowrap"
      >
        <span ref={colRef} className="block will-change-transform" aria-hidden="true">
          {[...words, words[0]].map((word, i) => (
            <span className="block h-[var(--rot-cell)]" key={`${word}-${i}`}>
              <span className="inline-block origin-left" data-word>
                {word}
              </span>
            </span>
          ))}
        </span>
      </span>
    </span>
  )
}
