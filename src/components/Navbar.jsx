// Navbar component

import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { getLenis, scrollToSection } from '../hooks/useSmoothScroll'
import { useNavMorph, MORPH_DISTANCE } from '../hooks/useNavMorph'
import { MENU_ITEMS } from './navMenu'
import { BOOKING } from './booking'

const LOGO_SRC = `${import.meta.env.BASE_URL}images/logo/main_logo.webp`

const REVEAL_AFTER = MORPH_DISTANCE * 0.88

const LINK_BASE =
  'relative whitespace-nowrap rounded-pill font-body font-medium leading-none ' +
  'text-primary/80 no-underline transition-colors duration-[250ms] ' +
  'hover:text-primary'

const LINK_DESKTOP = `${LINK_BASE} inline-block px-2 py-2.5 text-nav lg:px-[clamp(8px,0.9vw,14px)]`

const LINK_MOBILE = `${LINK_BASE} block rounded-md px-4 py-3.5 text-left text-[1.0625rem]`

const CTA =
  'inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-pill ' +
  'bg-primary font-body text-nav font-medium leading-none text-white no-underline ' +
  'transition-[transform,box-shadow] duration-[250ms] hover:-translate-y-px ' +
  'hover:shadow-[0_8px_20px_rgb(47_31_58_/_0.28)] active:translate-y-0 ' +
  'px-4 py-3 lg:px-[clamp(18px,1.8vw,28px)] lg:py-[13px]'

const BURGER_BAR = 'block h-0.5 w-[18px] rounded-sm bg-primary transition duration-[280ms]'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [isRevealed, setIsRevealed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const reduceMotion = useReducedMotion()

  useNavMorph()

  const isShown = isRevealed || isMobile || reduceMotion

  useEffect(() => {
    const update = (y) => setIsRevealed(y > REVEAL_AFTER)
    const onNativeScroll = () => update(window.scrollY)

    const lenis = getLenis()
    const unsubscribe = lenis?.on('scroll', ({ scroll }) => update(scroll))
    window.addEventListener('scroll', onNativeScroll, { passive: true })
    onNativeScroll()

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe()
      else lenis?.off?.('scroll', update)
      window.removeEventListener('scroll', onNativeScroll)
    }
  }, [])

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 1023px)')
    const onChange = () => {
      setIsMobile(mq.matches)
      if (!mq.matches) setIsOpen(false)
    }
    onChange()
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    if (!isOpen) return
    const onKeyDown = (e) => e.key === 'Escape' && setIsOpen(false)
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const onPointerDown = (e) => {
      if (!e.target.closest?.('[data-nav-pill]')) setIsOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [isOpen])

  useEffect(() => {
    const lenis = getLenis()
    if (isOpen) {
      lenis?.stop()
      document.body.style.overflow = 'hidden'
    } else {
      lenis?.start()
      document.body.style.overflow = ''
    }
    return () => {
      getLenis()?.start()
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const handleNavigate = (event, href) => {
    setIsOpen(false)
    getLenis()?.start()
    if (scrollToSection(href, { reduceMotion })) event.preventDefault()
  }

  return (
    <header
      data-nav-shell
      className="pointer-events-none fixed inset-x-0 top-[var(--nav-offset-top)] z-[100] page-x"
      aria-hidden={!isShown}
      inert={!isShown}
    >
      <nav
        data-nav-pill
        data-portal-fade
        className="pointer-events-auto relative mx-auto flex h-[var(--nav-height)] w-full
                   max-w-[var(--max-content-width)] items-center justify-between gap-4
                   rounded-pill px-0 lg:glass lg:px-[clamp(14px,1.6vw,24px)]"
        aria-label="Main navigation"
      >
        <a
          data-nav-logo
          className="flex shrink-0 items-center rounded-md"
          href="#home"
          aria-label="Felix De Guzman — home"
          onClick={(e) => handleNavigate(e, '#home')}
        >
          <img
            className="h-[clamp(40px,2.4vw,34px)] w-auto"
            src={LOGO_SRC}
            alt="Felix De Guzman logo"
            width="2000"
            height="2000"
          />
        </a>

        <ul
          role="list"
          className="m-0 hidden list-none items-center gap-0.5 p-0 lg:flex lg:gap-[clamp(4px,1.2vw,18px)]"
        >
          {MENU_ITEMS.map((item) => (
            <li key={item.href}>
              <a
                data-nav-item={item.href}
                className={LINK_DESKTOP}
                data-hover-roll
                href={item.href}
                onClick={(e) => handleNavigate(e, item.href)}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex shrink-0 items-center gap-2 lg:gap-0">
          <a data-nav-cta className={CTA} {...BOOKING} data-hover-fill="light">
            Book a Meet
          </a>

          <button
            type="button"
            className="group flex size-[42px] shrink-0 cursor-pointer flex-col items-center
                       justify-center gap-[5px] rounded-md border-none bg-cta
                       transition-colors hover:bg-primary/15 lg:hidden"
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isOpen}
            aria-controls="mobile-menu"
            onClick={() => setIsOpen((open) => !open)}
          >
            <span
              className={`${BURGER_BAR} group-aria-expanded:translate-y-[7px] group-aria-expanded:rotate-45`}
            />
            <span className={`${BURGER_BAR} group-aria-expanded:opacity-0`} />
            <span
              className={`${BURGER_BAR} group-aria-expanded:-translate-y-[7px] group-aria-expanded:-rotate-45`}
            />
          </button>
        </div>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              id="mobile-menu"
              className="glass pointer-events-auto absolute inset-x-0 top-[calc(100%+10px)]
                         overflow-hidden rounded-lg"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{
                duration: reduceMotion ? 0 : 0.32,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <div className="flex flex-col gap-1 p-3.5">
                {MENU_ITEMS.map((item) => (
                  <a
                    key={item.href}
                    className={LINK_MOBILE}
                    data-hover-roll
                    href={item.href}
                    onClick={(e) => handleNavigate(e, item.href)}
                  >
                    {item.label}
                  </a>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  )
}
