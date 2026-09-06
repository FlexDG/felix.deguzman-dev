// Gaming PC section

import { useCallback, useEffect, useRef, useState, lazy, Suspense } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
const PCScene = lazy(() => import('./PCScene'))
import PCCopy, { SECTION_HEADING_ID } from './PCCopy'
import { buildPCTimeline, applyStaticShot } from './pcTimeline'
import { ACTS } from './pcContent'

gsap.registerPlugin(ScrollTrigger)

export default function GamingPCSection({ modelUrl }) {
  const rootRef = useRef(null)
  const apiRef = useRef(null)

  const [mode, setMode] = useState(null)
  const handleReady = useCallback((next) => setMode(next), [])

  useEffect(() => {
    const root = rootRef.current
    if (!root || !mode) return undefined

    const mm = gsap.matchMedia()

    const build = () =>
      mm.add(
        {
          reduced: '(prefers-reduced-motion: reduce)',
          narrow: '(max-width: 1023px)',
          wide: '(min-width: 1024px)',
        },
        (self) => {
          const api = apiRef.current
          const stage = root.querySelector('[data-gp="stage"]')
          if (!stage) return

          if (self.conditions.reduced) {
            if (api) applyStaticShot(api, self.conditions.narrow)
            return
          }

          if (api) api.setFrozen(false)
          buildPCTimeline({ stage, root, api, narrow: self.conditions.narrow })
        },
        root,
      )

    let done = false
    const run = () => {
      if (done) return
      done = true
      build()
    }

    let raf = requestAnimationFrame(() => {
      raf = requestAnimationFrame(() => {
        raf = 0
        run()
      })
    })
    const timer = setTimeout(run, 300)

    return () => {
      if (raf) cancelAnimationFrame(raf)
      clearTimeout(timer)
      mm.revert()
    }
  }, [mode])

  return (
    <section
      ref={rootRef}
      id="machine"
      aria-labelledby={SECTION_HEADING_ID}
      data-gp-mode={mode ?? 'pending'}
      className="relative z-[7] w-full bg-surface"
    >
      <div data-gp="stage">
        <div data-gp="pane">
          <Suspense fallback={null}>
            <PCScene apiRef={apiRef} onReady={handleReady} modelUrl={modelUrl} />
          </Suspense>

          <PCCopy />

          <div data-gp="rail" aria-hidden="true">
            <span data-gp="rail-now">01</span>
            <span data-gp="rail-track">
              <span data-gp="rail-fill" />
            </span>
            <span data-gp="rail-total">{String(ACTS.length).padStart(2, '0')}</span>
          </div>
        </div>
      </div>
    </section>
  )
}
