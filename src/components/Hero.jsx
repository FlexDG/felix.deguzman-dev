// Hero section

import { Fragment, useCallback, useEffect, useLayoutEffect, useRef } from 'react'
import { scrollToSection } from '../hooks/useSmoothScroll'
import { onViewportResize } from '../hooks/onViewportResize'
import { MENU_ITEMS } from './navMenu'
import { BOOKING } from './booking'
import reactIcon from '../assets/icons/react.svg'
import djangoIcon from '../assets/icons/django.svg'
import pythonIcon from '../assets/icons/python.svg'
import claudeIcon from '../assets/icons/claude.svg'
import figmaIcon from '../assets/icons/figma.svg'
import adobeIcon from '../assets/icons/adobecreativecloud.svg'
import HeadlineRotator from './HeadlineRotator'

const HEADLINE_ROLES = [
  'Designs UIs',
  'Ships Apps',
  'Makes Visuals',
  'Solves Problems',
  'Automates Work',
]

const HERO_IMAGE = `${import.meta.env.BASE_URL}images/hero_image.webp`

const MOBILE_HERO_800 = `${import.meta.env.BASE_URL}images/mobile_hero_image-800.webp`
const MOBILE_HERO_1200 = `${import.meta.env.BASE_URL}images/mobile_hero_image-1200.webp`

const TECH_LEFT = [
  { name: 'React', icon: reactIcon, blurb: 'Component-driven interfaces' },
  { name: 'Django', icon: djangoIcon, blurb: 'Batteries-included backends' },
  { name: 'Python', icon: pythonIcon, blurb: 'Automation and data work' },
]

const TECH_RIGHT = [
  { name: 'Claude', icon: claudeIcon, blurb: 'AI pair-programming, daily' },
  { name: 'Figma', icon: figmaIcon, blurb: 'Design, prototype, hand-off' },
  { name: 'Adobe CC', icon: adobeIcon, blurb: 'Brand and visual assets' },
]

const META_ITEM =
  'relative font-body text-[length:var(--hero-tech-size)] font-semibold leading-[1.2] ' +
  'uppercase tracking-[0.04em] text-black whitespace-nowrap'
const META_SEP =
  'select-none font-body text-[length:var(--hero-tech-size)] font-light leading-[1.2] text-black/60'
const META_GAP = 'gap-x-[clamp(10px,1.1vw,18px)]'

const HERO_NOTE =
  'm-0 max-w-[var(--hero-note-w)] text-left font-body ' +
  'text-[length:var(--hero-note-size)] font-light text-black'

const HERO_CARD =
  'pointer-events-auto h-fit w-max max-w-[42vw] flex-col ' +
  'gap-[var(--hero-card-stack)] rounded-md bg-cta p-[var(--hero-card-pad)]'

const HERO_CARD_TITLE =
  'm-0 font-heading text-[length:var(--hero-card-title-size)] font-bold leading-none text-primary'

const HERO_CARD_TEXT = 'm-0 font-body text-[length:var(--hero-note-size)] font-semibold text-black'

function HeroCard({ className = '', children, ...rest }) {
  return (
    <div {...rest} className={`${HERO_CARD} items-center text-center ${className}`}>
      {children}
    </div>
  )
}

const ICON_PROPS = {
  viewBox: '0 0 24 24',
  fill: 'currentColor',
  'aria-hidden': 'true',
  className: 'h-[var(--hero-card-icon)] w-[var(--hero-card-icon)] shrink-0 text-primary',
}

const TRAITS = [
  {
    label: 'Creative',
    icon: (
      <svg {...ICON_PROPS}>
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M9.2 6.6h5.6a6.4 6.4 0 0 1 6.35 5.55l.6 4.5a2.85 2.85 0 0 1-5.2 1.95l-1.6-2.3H9.05l-1.6 2.3a2.85 2.85 0 0 1-5.2-1.95l.6-4.5A6.4 6.4 0 0 1 9.2 6.6zM7.55 9.85h1.5v1.6h1.6v1.5h-1.6v1.6h-1.5v-1.6h-1.6v-1.5h1.6zM16.2 9.95a1.15 1.15 0 1 0 0 2.3 1.15 1.15 0 0 0 0-2.3zM18.6 12.15a1.15 1.15 0 1 0 0 2.3 1.15 1.15 0 0 0 0-2.3z"
        />
      </svg>
    ),
  },
  {
    label: 'Reliable',
    icon: (
      <svg {...ICON_PROPS}>
        <path d="M7.4 3.8a3.6 3.6 0 1 0 0 7.2 3.6 3.6 0 1 0 0-7.2zM16.6 3.8a3.6 3.6 0 1 0 0 7.2 3.6 3.6 0 1 0 0-7.2zM12 8.4a3.6 3.6 0 1 0 0 7.2 3.6 3.6 0 1 0 0-7.2zM7.4 13a3.6 3.6 0 1 0 0 7.2 3.6 3.6 0 1 0 0-7.2zM16.6 13a3.6 3.6 0 1 0 0 7.2 3.6 3.6 0 1 0 0-7.2z" />
      </svg>
    ),
  },
  {
    label: 'Strategist',
    icon: (
      <svg {...ICON_PROPS}>
        <path d="M2.8 7.4l3.9 3.4L12 4l5.3 6.8 3.9-3.4-1.9 11.6H4.7z" />
      </svg>
    ),
  },
  {
    label: 'Builder',
    icon: (
      <svg {...ICON_PROPS} viewBox="-5.768 -3.992 29.6 29.6">
        <path d="M17.3256 12.9481L14.4763 10.808L17.3256 8.66787C18.3103 7.92827 18.3103 6.48246 17.3256 5.74279L10.1925 0.385134C9.50883 -0.128378 8.55529 -0.128378 7.87166 0.385134L0.738579 5.74279C-0.246193 6.48246 -0.246193 7.92821 0.738579 8.66787L3.58792 10.808L0.738642 12.9481C-0.24613 13.6877 -0.24613 15.1336 0.738642 15.8732L7.87178 21.2309C8.55542 21.7444 9.50895 21.7444 10.1926 21.2309L17.3257 15.8732C18.3104 15.1336 18.3103 13.6877 17.3256 12.9481Z" />
      </svg>
    ),
  },
  {
    label: 'Efficient',
    icon: (
      <svg {...ICON_PROPS} viewBox="-3.498 -3.741 25 25">
        <path d="M15.855 8.75897C21.1849 15.3054 15.7305 20.6123 9.00227 15.4265C2.27397 20.6123 -3.18034 15.3054 2.14955 8.75897C-3.18034 2.21252 2.27403 -3.09438 9.00227 2.09146C15.7306 -3.09438 21.1849 2.21257 15.855 8.75897Z" />
      </svg>
    ),
  },
]

function TraitList() {
  return (
    <ul role="list" className="m-0 flex w-max list-none flex-col gap-[var(--hero-card-stack)] p-0">
      {TRAITS.map((trait) => (
        <li
          key={trait.label}
          className={`flex items-center gap-[var(--hero-card-icon-gap)] text-left leading-[1.15] ${HERO_CARD_TEXT}`}
        >
          {trait.icon}
          {trait.label}
        </li>
      ))}
    </ul>
  )
}

function MenuCardList({ onNavigate }) {
  return (
    <nav aria-label="Sections">
      <ul
        role="list"
        className="m-0 flex w-max list-none flex-col gap-[var(--hero-card-stack)] p-0"
      >
        {MENU_ITEMS.map((item) => (
          <li
            key={item.href}
            className="flex items-center gap-[var(--hero-card-icon-gap)] leading-[1.15]"
          >
            <span data-navcard-icon={item.href} className="flex shrink-0 items-center">
              {item.icon}
            </span>
            <a
              data-navcard-item={item.href}
              data-hover-roll
              href={item.href}
              onClick={(e) => onNavigate(e, item.href)}
              className={`${HERO_CARD_TEXT} leading-[1.15] no-underline`}
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}

const SWAP = 'transition-[opacity,scale,translate] duration-300 ease-out'

const SWAP_OUT =
  'group-hover:scale-90 group-hover:opacity-0 group-focus-within:scale-90 group-focus-within:opacity-0'

const SWAP_IN =
  'group-hover:scale-100 group-hover:opacity-100 group-focus-within:scale-100 group-focus-within:opacity-100'

const CARD_IN =
  'group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100'

const HERO_CTA =
  'pointer-events-auto inline-flex shrink-0 cursor-pointer items-center justify-center ' +
  'whitespace-nowrap rounded-md border-none bg-cta ' +
  'px-[var(--hero-cta-px)] py-[var(--hero-cta-py)] font-body ' +
  'text-[length:var(--hero-cta-size)] font-bold ' +
  'leading-none text-primary no-underline ' +
  'focus-visible:bg-primary focus-visible:text-white'

export function HeroCta({ href, children, ...rest }) {
  const Tag = href ? 'a' : 'button'
  return (
    <Tag
      className={HERO_CTA}
      href={href}
      type={href ? undefined : 'button'}
      data-hover-fill
      {...rest}
    >
      {children}
    </Tag>
  )
}

function useHeroMetrics(titleRef, hostRef) {
  const ctxRef = useRef(null)

  const measure = useCallback(() => {
    const el = titleRef.current
    const host = hostRef.current
    if (!el || !host) return

    const cs = getComputedStyle(el)
    const fs = parseFloat(cs.fontSize)
    const ls = parseFloat(cs.letterSpacing) || 0
    const text = el.textContent.trim()
    if (!fs || !text) return
    const fontSpec = `${cs.fontWeight} ${fs}px ${cs.fontFamily}`
    if (document.fonts?.check && !document.fonts.check(fontSpec)) return
    if (el.getBoundingClientRect().height < fs * 0.5) return

    if (!ctxRef.current) {
      ctxRef.current = document.createElement('canvas').getContext('2d')
    }
    const ctx = ctxRef.current
    ctx.font = fontSpec
    const m = ctx.measureText(text)

    const left = -m.actualBoundingBoxLeft
    const right = m.actualBoundingBoxRight
    const gaps = Math.max(text.length - 1, 0)
    const inkW = right - left + gaps * ls

    const drift = (left + right - m.width) / 2
    host.style.setProperty('--hero-title-nudge', `${ls / 2 - drift}px`)
    host.style.setProperty('--hero-title-ink', `${inkW}px`)

    const range = document.createRange()
    range.selectNodeContents(el)
    const hostBox = host.getBoundingClientRect()
    const inkLeft = range.getBoundingClientRect().left - m.actualBoundingBoxLeft - hostBox.left
    host.style.setProperty('--hero-title-ink-left', `${inkLeft}px`)

    host.style.setProperty(
      '--hero-title-ink-right-gap',
      `${Math.max(0, hostBox.width - (inkLeft + inkW))}px`,
    )
  }, [titleRef, hostRef])

  useLayoutEffect(() => {
    measure()
    const ro = new ResizeObserver(measure)
    if (titleRef.current) ro.observe(titleRef.current)
    if (hostRef.current) ro.observe(hostRef.current)
    const offResize = onViewportResize(measure)
    window.addEventListener('load', measure)
    const mo = new MutationObserver(measure)
    if (titleRef.current) {
      mo.observe(titleRef.current, {
        characterData: true,
        childList: true,
        subtree: true,
      })
    }
    return () => {
      ro.disconnect()
      window.removeEventListener('load', measure)
      mo.disconnect()
      offResize()
    }
  }, [measure, titleRef, hostRef])

  useEffect(() => {
    let cancelled = false
    document.fonts.ready.then(() => {
      if (!cancelled) measure()
    })
    return () => {
      cancelled = true
    }
  }, [measure])
}

function TechItem({ item }) {
  const id = `tech-${item.name.replace(/\s+/g, '-').toLowerCase()}`

  return (
    <li
      className="group relative flex cursor-pointer items-center"
      tabIndex={0}
      aria-describedby={id}
    >
      <img
        src={item.icon}
        alt={item.name}
        className="relative z-[3] block h-[var(--tech-icon)] w-[var(--tech-icon)]
                   shrink-0 object-contain lg:hidden"
      />

      <span className={`hidden lg:block ${META_ITEM} ${SWAP} ${SWAP_OUT}`}>{item.name}</span>

      <div
        id={id}
        role="tooltip"
        className="pointer-events-none absolute z-[1] w-[var(--tech-card-w)]
                   left-1/2 top-[calc(50%+var(--tech-card-offset))] -translate-x-1/2
                   max-lg:left-[calc(50%+var(--tech-card-offset))] max-lg:top-1/2
                   max-lg:translate-x-0 max-lg:-translate-y-1/2"
      >
        <div
          className={`flex min-h-[var(--tech-card-h)] items-center justify-center
                     rounded-md bg-primary px-2.5 pb-3.5
                     pt-[calc(var(--tech-icon)/2+0.35rem)]
                     max-lg:py-3 max-lg:pr-3
                     max-lg:pl-[calc(var(--tech-icon)/2+0.5rem)]
                     max-lg:justify-start max-lg:text-left
                     text-center font-body text-[0.875rem] font-normal normal-case
                     leading-[1.4] tracking-normal text-white shadow-glass
                     translate-y-1 opacity-0 ${SWAP} ${CARD_IN}`}
        >
          {item.blurb}
        </div>
      </div>

      <img
        src={item.icon}
        alt=""
        aria-hidden="true"
        className={`pointer-events-none absolute left-1/2 top-1/2 z-[2]
                    hidden lg:block
                    h-[var(--tech-icon)] w-[var(--tech-icon)] -translate-x-1/2
                    -translate-y-1/2 scale-75 object-contain opacity-0
                    ${SWAP} ${SWAP_IN}`}
      />
    </li>
  )
}

function TechGroup({ items }) {
  return (
    <ul
      role="list"
      className={`m-0 flex shrink-0 list-none items-center p-0 ${META_GAP}
                  max-lg:flex-col max-lg:items-start max-lg:gap-y-[var(--tech-rail-gap)]`}
    >
      {items.map((item, i) => (
        <Fragment key={item.name}>
          {i > 0 && (
            <li className={`${META_SEP} max-lg:hidden`} aria-hidden="true">
              |
            </li>
          )}
          <TechItem item={item} />
        </Fragment>
      ))}
    </ul>
  )
}

export default function Hero({ portal = null }) {
  const titleRef = useRef(null)
  const hostRef = useRef(null)
  useHeroMetrics(titleRef, hostRef)

  const handleNavigate = useCallback((event, href) => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (scrollToSection(href, { reduceMotion })) event.preventDefault()
  }, [])

  return (
    <section
      ref={hostRef}
      data-hero-pane
      className="sticky top-0 isolate h-svh w-full overflow-hidden bg-hero-bg"
      id="home"
      aria-label="Intro"
    >
      <div data-hero="title" className="absolute inset-x-0 top-[var(--hero-title-top)]">
        <h1
          ref={titleRef}
          data-hero="word"
          className="pointer-events-none relative z-0 m-0
                     translate-x-[var(--hero-title-nudge,0px)]
                     select-none whitespace-nowrap text-center font-heading text-display
                     font-bold uppercase leading-[0.88]
                     tracking-[var(--hero-title-tracking)] text-primary"
        >
          FLEX
        </h1>
      </div>

      <div
        data-hero="tech"
        className={`absolute inset-x-0 z-[5] top-[var(--hero-meta-top)]
                    bottom-[var(--hero-meta-bottom)]
                    flex flex-wrap items-center
                    justify-center ${META_GAP} gap-y-2 page-x leading-none
                    max-lg:flex-col max-lg:flex-nowrap max-lg:items-start
                    max-lg:justify-end max-lg:gap-y-[var(--tech-rail-gap)]
                    lg:mr-auto lg:flex-nowrap lg:justify-between lg:pr-0
                    lg:pl-[var(--hero-meta-inset)]
                    lg:ml-[var(--hero-title-ink-left,auto)]
                    lg:w-[var(--hero-title-ink)]`}
      >
        <TechGroup items={TECH_LEFT} />
        <TechGroup items={TECH_RIGHT} />
      </div>

      <div
        data-hero="card-nav"
        className="pointer-events-none absolute z-[5] hidden lg:block
                   left-[calc(var(--hero-title-ink-left,0px)_+_var(--hero-card-nav-x))]
                   bottom-[var(--hero-card-nav-y)]"
      >
        <div data-navcard-face className={`${HERO_CARD} flex items-start text-left`}>
          <MenuCardList onNavigate={handleNavigate} />
        </div>
      </div>

      <figure
        data-hero="figure"
        className="pointer-events-none absolute bottom-0 left-1/2 z-[1] m-0 flex -translate-x-1/2 justify-center"
      >
        <picture data-hero="portrait">
          <source
            media="(max-width: 1023px)"
            srcSet={`${MOBILE_HERO_800} 800w, ${MOBILE_HERO_1200} 1200w`}
            sizes="120vw"
          />
          <img
            data-hero-img
            draggable={false}
            className="h-[var(--hero-image-height)] w-auto max-w-[var(--hero-image-max-w)]
                       object-contain object-bottom"
            src={HERO_IMAGE}
            alt="Felix De Guzman"
            fetchPriority="high"
            decoding="async"
          />
        </picture>

        <span data-hero="head" data-cursor="scuba" aria-hidden="true" />
      </figure>

      {portal}

      <div
        className="pointer-events-none absolute bottom-[calc(var(--hero-image-height)/2)]
                   left-1/2 z-[3]
                   text-[length:var(--hero-headline-size)]
                   translate-x-[calc(-50%_+_var(--hero-headline-x))]
                   translate-y-[calc(50%_+_var(--hero-headline-y))]"
      >
        <h2
          data-hero="headline"
          className="m-0 w-[var(--hero-headline-w)] text-left font-heading
                     text-[length:var(--hero-headline-size)] text-white"
        >
          <span className="block">Developer</span>
          <span className="block">Who</span>
          <HeadlineRotator words={HEADLINE_ROLES} />
        </h2>

        <div
          className="absolute w-max left-[var(--hero-card-stat-x)] top-[var(--hero-card-stat-y)]
                     translate-x-[var(--hero-card-stat-tx)]
                     translate-y-[var(--hero-card-stat-ty)]"
        >
          <HeroCard data-hero="card-stat" className="flex">
            <h3 className={HERO_CARD_TITLE}>2+</h3>
            <p className={`${HERO_CARD_TEXT} w-[var(--hero-card-stat-w)] leading-[1.25]`}>
              Years of experience
            </p>
          </HeroCard>
        </div>

        <div
          className="absolute w-max left-[var(--hero-card-list-x)] top-[var(--hero-card-list-y)]
                     translate-x-[var(--hero-card-list-tx)]
                     translate-y-[var(--hero-card-list-ty)]"
        >
          <HeroCard data-hero="card-traits" className="flex">
            <TraitList />
          </HeroCard>
        </div>
      </div>

      <div
        data-hero="cta"
        className="pointer-events-none absolute z-[4]
                   top-[var(--hero-cta-top)] right-[var(--hero-cta-right)]
                   bottom-[var(--hero-cta-bottom)] left-[var(--hero-cta-left)]
                   hidden md:block"
      >
        <div
          className="flex h-full w-full flex-wrap items-center justify-center
                     translate-x-[var(--hero-cta-x)] translate-y-[var(--hero-cta-y)]
                     gap-[clamp(10px,1vw,16px)] page-x"
        >
          <HeroCta {...BOOKING}>Book a Meet</HeroCta>
          <HeroCta href="#about">More About Me</HeroCta>
        </div>
      </div>

      <div
        data-hero="notes"
        className={`absolute inset-x-0 bottom-[var(--hero-note-bottom)] z-[3]
                    hidden flex-wrap items-end justify-between gap-x-8 gap-y-4
                    page-x md:flex
                    lg:flex-nowrap lg:pr-0
                    lg:pl-[var(--hero-meta-inset)]
                    lg:ml-[var(--hero-title-ink-left,auto)]
                    lg:w-[var(--hero-title-ink)]`}
      >
        <p className={HERO_NOTE}>
          The Web Dev Expert.
          <br />
          That’s Felix.
        </p>
        <p className={HERO_NOTE}>
          Custom code where it counts, a managed CMS where it saves time — designed, built and
          shipped end to end.
        </p>
      </div>
    </section>
  )
}
