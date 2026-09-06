// About Me portrait and video

import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react'

const AboutPortraitGL = lazy(() => import('./AboutPortraitGL'))

const ABOUT_IMAGE = `${import.meta.env.BASE_URL}images/about_image.webp`
const ABOUT_IMAGE_900 = `${import.meta.env.BASE_URL}images/about_image-900.webp`
const ABOUT_IMAGE_1400 = `${import.meta.env.BASE_URL}images/about_image-1400.webp`
const ABOUT_VIDEO = `${import.meta.env.BASE_URL}images/about_alive.webm`

const IMAGE_SIZES = '(min-width: 1024px) 45vw, 76vw'

const HANDOVER_MS = 600

function rendersAlpha(video) {
  const w = video.videoWidth
  const h = video.videoHeight
  if (!w || !h) return false

  const probe = document.createElement('canvas')
  probe.width = 16
  probe.height = 8
  const ctx = probe.getContext('2d', { willReadFrequently: true })
  if (!ctx) return false

  ctx.clearRect(0, 0, 16, 8)
  try {
    ctx.drawImage(video, 0, 0, 8, 8, 0, 0, 8, 8)
    ctx.drawImage(video, (w >> 1) - 4, Math.round(h * 0.6) - 4, 8, 8, 8, 0, 8, 8)
  } catch {
    return false
  }

  const backdrop = ctx.getImageData(2, 2, 1, 1).data[3]
  const subject = ctx.getImageData(12, 4, 1, 1).data[3]

  return backdrop < 16 && subject > 240
}

function armedFromTheStart() {
  if (typeof window === 'undefined') return false
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false
  return typeof IntersectionObserver === 'undefined'
}

export default function AboutMedia() {
  const imgRef = useRef(null)
  const videoRef = useRef(null)
  const [armed, setArmed] = useState(armedFromTheStart)
  const [alive, setAlive] = useState(false)
  const [shrugging, setShrugging] = useState(false)
  const [swapped, setSwapped] = useState(false)
  const [glOut, setGlOut] = useState(false)

  const onGLReady = useCallback(() => setShrugging(true), [])
  const onGLFail = useCallback(() => {
    setShrugging(false)
    setGlOut(true)
  }, [])

  useEffect(() => {
    const calm = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (calm.matches) return

    const el = imgRef.current
    if (!el) return

    if (typeof IntersectionObserver === 'undefined') return

    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return
        setArmed(true)
        io.disconnect()
      },
      { rootMargin: '150% 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    if (!armed) return
    const video = videoRef.current
    if (!video) return

    let cancelled = false
    let tries = 0

    const attempt = () => {
      if (cancelled) return
      if (video.readyState < 2) return
      if (document.hidden) return

      if (rendersAlpha(video)) {
        video.currentTime = 0
        setAlive(true)
        return
      }

      if (++tries < 30) {
        requestAnimationFrame(attempt)
        return
      }

      video.removeAttribute('src')
      video.load()
    }

    video.addEventListener('loadeddata', attempt)
    document.addEventListener('visibilitychange', attempt)
    if (video.readyState >= 2) attempt()

    return () => {
      cancelled = true
      video.removeEventListener('loadeddata', attempt)
      document.removeEventListener('visibilitychange', attempt)
    }
  }, [armed])

  useEffect(() => {
    if (!alive) return
    const video = videoRef.current
    if (!video) return

    let watch = 0
    let last = -1
    let stalls = 0

    const kick = () => video.play().catch(() => {})

    const restart = () => {
      if (video.currentTime > 0.05) video.currentTime = 0
      kick()
    }

    const tick = () => {
      if (document.hidden) return
      if (video.paused) return kick()

      if (video.currentTime !== last) {
        last = video.currentTime
        stalls = 0
        return
      }
      if (++stalls >= 3) {
        stalls = 0
        restart()
      }
    }

    const start = setTimeout(() => {
      setSwapped(true)

      video.play().then(
        () => {
          video.addEventListener('ended', restart)
          watch = setInterval(tick, 500)
        },
        () => {
          setSwapped(false)
          setAlive(false)
        },
      )
    }, HANDOVER_MS)

    return () => {
      clearTimeout(start)
      clearInterval(watch)
      video.removeEventListener('ended', restart)
    }
  }, [alive])

  return (
    <>
      <picture className="absolute inset-0 block h-full w-full">
        <source
          type="image/webp"
          srcSet={`${ABOUT_IMAGE_900} 900w, ${ABOUT_IMAGE_1400} 1400w`}
          sizes={IMAGE_SIZES}
        />
        <img
          ref={imgRef}
          src={ABOUT_IMAGE}
          alt="Felix De Guzman"
          loading="lazy"
          decoding="async"
          draggable="false"
          sizes={IMAGE_SIZES}
          className={`absolute inset-0 h-full w-full select-none object-contain object-bottom ${
            swapped ? 'opacity-0' : 'opacity-100'
          }`}
        />
      </picture>

      {armed && (
        <video
          ref={videoRef}
          src={ABOUT_VIDEO}
          loop
          muted
          playsInline
          preload="auto"
          aria-hidden="true"
          draggable="false"
          className={`absolute inset-0 h-full w-full select-none object-contain object-bottom ${
            shrugging ? '' : 'transition-opacity duration-[600ms] ease-out'
          } ${alive && !shrugging ? 'opacity-100' : 'opacity-0'}`}
        />
      )}

      {alive && !glOut && (
        <Suspense fallback={null}>
          <AboutPortraitGL videoRef={videoRef} onReady={onGLReady} onFail={onGLFail} />
        </Suspense>
      )}
    </>
  )
}
