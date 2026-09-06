// Projects section

import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { scrub } from '../hooks/useSmoothScroll'
import { Pill } from './Process'
import Brands from './Brands'
import { isLowPerf } from '../lib/perf'

gsap.registerPlugin(ScrollTrigger)

const THUMBS = `${import.meta.env.BASE_URL}images/project_thumbnails/`
const LOGOS = `${import.meta.env.BASE_URL}images/logo/`

const PROJECTS = [
  {
    name: 'Highland',
    href: 'https://www.highlandproperty.com.au/',
    image: 'highland_thumbnail.webp',
    logo: 'highland_logo.webp',
    tags: ['Django', 'Python', 'Wagtail', 'SASS', 'JavaScript'],
    title: 'Estate listings, rebuilt',
    body: 'A property portal carrying two thousand live listings. Search and media were rebuilt on one indexed model, taking the results page under 600ms.',
  },
  {
    name: 'RT Edgar',
    href: 'https://www.rtedgar.com/',
    image: 'rt_edgar_thumbnail.webp',
    logo: 'rte_logo.webp',
    tags: ['Django', 'Python', 'Wagtail', 'SASS', 'JavaScript'],
    title: 'Luxury brand, faster',
    body: 'An established agency site carrying a decade of plugins. The front end was rebuilt lean while the editors kept the admin they already knew.',
  },
  {
    name: 'Suburban',
    href: 'https://flexdg.github.io/Suburban-Solutions/',
    image: 'suburban_mockup.webp',
    logo: 'suburban_logo.webp',
    tags: ['HTML5', 'CSS3', 'VanillaJS', 'Figma'],
    title: 'From Campus to Startup',
    body: 'A dynamic IT freelance startup based in the Philippines, born from a college group’s academic projects in 2021. What started as a passion project has since grown into a thriving venture.',
  },
  {
    name: 'Ora Ora',
    href: 'https://flexdg.github.io/Ora-Ora/',
    image: 'ora_mockup.webp',
    logo: 'ora_logo.webp',
    tags: ['HTML5', 'CSS3', 'VanillaJS', 'Figma'],
    title: 'A Taste of Pampanga',
    body: 'Ora Ora, a renowned tapsilogan in Angeles City, Pampanga, is a local favorite for its tapsilog — flavorful tapa, garlic rice, and a sunny-side-up egg — alongside a menu that captures the region’s culinary heritage.',
  },
  {
    name: 'iConServe',
    href: 'https://github.com/mikaellamaesilva/PDC03_PracticalTest',
    image: 'iconserve_mockup.webp',
    logo: 'iConserve_logo.webp',
    tags: ['C#', 'Xamarin', 'Figma'],
    title: 'Discover & Protect',
    body: 'iConserve is your pocket guide to the world of endangered species — a mobile encyclopedia designed to educate and inspire users to protect our planet’s most vulnerable inhabitants.',
  },
  {
    name: 'Senal',
    href: 'https://flexdg.github.io/SenAL/',
    image: 'senal_mock.webp',
    logo: 'sen_ai_logo.webp',
    tags: ['VanillaJS', 'NodeJS', 'p5.js', 'Figma'],
    title: 'Sentiment Through Text',
    body: 'SenAl is an open-source sentiment analysis tool for gauging sentiment in textual data, built on the AFINN165 lexical database and a fuzzy decision tree.',
  },
  {
    name: 'PRD',
    href: 'https://www.prd.com.au/',
    image: 'prd_thumbnail.webp',
    logo: 'prd_logo.webp',
    tags: ['Django', 'Python', 'Wagtail', 'SASS', 'JavaScript'],
    title: 'Property Insights, Made Smarter',
    body: 'PRD showcases the latest residential and commercial listings in Australia, pairing innovative marketing with cutting-edge market research. Users can request appraisals and book inspections, backed by data-driven advice at every step.',
  },
]

function LogoTile({ name }) {
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')

  return (
    <span
      aria-hidden="true"
      data-pj="logo"
      className="grid h-[var(--pj-logo)] w-[var(--pj-logo)] shrink-0 place-items-center
                 rounded-md bg-[var(--pj-pill-bg)] font-heading text-[calc(var(--pj-logo)*0.4)]
                 font-bold leading-none text-primary"
    >
      {initials}
    </span>
  )
}

function LogoMark({ logo, name }) {
  const [failed, setFailed] = useState(false)

  if (failed || !logo) return <LogoTile name={name} />

  return (
    <img
      src={`${LOGOS}${logo}`}
      alt=""
      aria-hidden="true"
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
      data-pj="logo"
      className="h-[var(--pj-logo)] w-[var(--pj-logo)] shrink-0 rounded-md
                 bg-[var(--pj-pill-bg)] object-cover object-center"
    />
  )
}

function Thumb({ file, name }) {
  const [failed, setFailed] = useState(false)

  if (failed || !file) {
    return (
      <div
        data-pj="thumb-missing"
        className="grid h-full w-full place-items-center bg-[var(--pj-pill-bg)] p-4 text-center
                   font-body text-[length:var(--pj-pill-size)] font-semibold uppercase
                   tracking-[0.12em] text-primary/55"
      >
        Thumbnail
        <br />
        pending
      </div>
    )
  }

  return (
    <img
      src={`${THUMBS}${file}`}
      alt={`${name} — project thumbnail`}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
      className="h-full w-full object-cover object-center"
    />
  )
}

function Card({ project, index }) {
  return (
    <article
      data-pj="card"
      data-cursor="project"
      style={{ zIndex: index + 1 }}
      aria-labelledby={`pj-${index}-name`}
      className="absolute inset-x-0 bottom-0 h-[var(--pj-card-h)] overflow-hidden
                 rounded-md bg-white will-change-transform"
    >
      <div
        data-pj="body"
        className="grid h-full grid-cols-1 grid-rows-[var(--pj-media-h)_minmax(0,1fr)]
                   md:grid-cols-[minmax(0,1fr)_var(--pj-media-w)] md:grid-rows-1"
      >
        <div
          data-pj="copy"
          className="order-2 flex min-w-0 flex-col justify-between gap-[var(--pj-copy-gap)]
                     p-[var(--pj-card-pad)] md:order-1 md:pr-0"
        >
          <div className="flex items-center justify-between gap-[clamp(10px,1.4vw,20px)]">
            <div className="flex min-w-0 items-center gap-[clamp(8px,0.8vw,14px)]">
              <LogoMark logo={project.logo} name={project.name} />

              <h3
                id={`pj-${index}-name`}
                className="m-0 min-w-0 truncate font-heading text-[length:var(--pj-name-size)]
                           font-bold leading-none tracking-[-0.02em] text-primary"
              >
                {project.name}
              </h3>
            </div>
          </div>

          <div className="flex flex-col items-start">
            <ul
              role="list"
              aria-label={`${project.name} tech stack`}
              className="m-0 mb-[var(--pj-pill-gap)] flex list-none flex-wrap
                         gap-[var(--pj-pill-space)] p-0"
            >
              {project.tags.map((tag) => (
                <li
                  key={tag}
                  className="rounded-md bg-[var(--pj-pill-bg)] px-[clamp(7px,0.7vw,11px)]
                             py-[clamp(4px,0.4vw,7px)] font-body text-[length:var(--pj-pill-size)]
                             font-semibold uppercase leading-none tracking-[0.06em] text-primary/80"
                >
                  {tag}
                </li>
              ))}
            </ul>

            <h4
              className="m-0 font-heading text-[length:var(--pj-title-size)] font-bold
                         leading-[1.02] tracking-[-0.02em] text-primary"
            >
              {project.title}
            </h4>

            <p
              className="m-0 mt-[var(--pj-body-gap)] line-clamp-4 max-w-[52ch] font-body
                         text-[length:var(--pj-body-size)] font-semibold leading-[1.4]
                         text-primary/75"
            >
              {project.body}
            </p>
          </div>
        </div>

        <div
          data-pj="media"
          className="order-1 overflow-hidden pb-[var(--pj-media-gap)] md:order-2
                     md:pb-0 md:pl-[var(--pj-card-pad)]"
        >
          <Thumb file={project.image} name={project.name} />
        </div>
      </div>

      <a
        href={project.href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${project.name} — ${project.title} (opens in a new tab)`}
        className="absolute inset-0 z-[2]"
      />
    </article>
  )
}

export default function Projects() {
  const rootRef = useRef(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    const mm = gsap.matchMedia()

    mm.add(
      {
        reduced: '(prefers-reduced-motion: reduce)',
        narrow: '(max-width: 767px)',
        wide: '(min-width: 768px)',
      },
      (self) => {
        if (self.conditions.reduced) return

        const q = gsap.utils.selector(root)
        const stage = q('[data-pj="stage"]')[0]
        const pane = q('[data-pj="pane"]')[0]
        const deck = q('[data-pj="deck"]')[0]
        const stack = q('[data-pj="stack"]')[0]
        const head = q('[data-pj="head"]')
        const headBox = q('[data-pj="headbox"]')[0]
        const cards = q('[data-pj="card"]')
        if (!stage || !pane || !deck || !stack || !cards.length) return

        const raw = self.conditions.narrow || ScrollTrigger.isTouch === 1

        const peek = parseFloat(getComputedStyle(root).getPropertyValue('--pj-peek')) || 5

        const rawBlur = getComputedStyle(root).getPropertyValue('--pj-blur').trim() || '3px'
        const blur = isLowPerf() ? null : parseFloat(rawBlur) ? rawBlur : null

        const floorGap = () => {
          const d = deck.getBoundingClientRect()
          const s = stack.getBoundingClientRect()
          return ((d.bottom - s.bottom) / cards[0].offsetHeight) * 100
        }

        const below = () => 100 + floorGap()

        const beat = 1 / cards.length
        const RISE = raw ? 0.8 : 0.62

        const EASE_IN = raw ? 'power1.out' : 'power2.out'

        const DIM = 0.45

        const seed = () => {
          gsap.set(cards, {
            yPercent: below(),
            opacity: DIM,
            filter: 'none',
            visibility: 'visible',
            willChange: 'transform',
          })
        }

        gsap.set(head, { autoAlpha: 0, y: 26 })

        gsap.fromTo(
          head,
          { autoAlpha: 0, y: 26 },
          {
            autoAlpha: 1,
            y: 0,
            ease: 'power2.out',
            stagger: 0.12,
            immediateRender: true,
            scrollTrigger: {
              trigger: headBox || root,
              start: 'top bottom',
              end: 'top 55%',
              scrub: scrub(0.8),
              invalidateOnRefresh: true,
            },
          },
        )

        if (self.conditions.narrow) return

        seed()

        ScrollTrigger.create({
          trigger: stage,
          start: 'top top',
          end: 'bottom bottom',
          pin: pane,
          pinSpacing: false,
          anticipatePin: 0,
          invalidateOnRefresh: true,
        })

        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: stage,
            start: 'top 5%',
            end: 'bottom bottom',
            scrub: scrub(0.3),
            invalidateOnRefresh: true,
            onRefresh: (st) => {
              if (!st.animation || st.animation.progress() === 0) seed()
            },
          },
        })

        cards.forEach((card, j) => {
          tl.fromTo(
            card,
            { yPercent: () => below(), opacity: DIM },
            {
              yPercent: 0,
              opacity: 1,
              duration: beat * RISE,
              ease: EASE_IN,
              immediateRender: false,
            },
            j * beat,
          )

          if (j + 1 >= cards.length) return

          tl.fromTo(
            card,
            blur ? { yPercent: 0, filter: 'blur(0px)' } : { yPercent: 0 },
            {
              yPercent: -peek,
              ...(blur ? { filter: `blur(${blur})` } : null),
              duration: beat * RISE,
              ease: EASE_IN,
              immediateRender: false,
            },
            (j + 1) * beat,
          )
        })

        if (blur) {
          cards.forEach((card, j) => {
            tl.set(card, { filter: 'none' }, j * beat)
            if (j + 1 >= cards.length) return
            tl.set(card, { filter: 'blur(0px)' }, (j + 1) * beat - 0.001)
          })
        }

        cards.forEach((card, j) => {
          if (j + 2 >= cards.length) return
          tl.set(card, { visibility: 'hidden', willChange: 'auto' }, (j + 2) * beat + beat * RISE)
        })

        tl.set({}, {}, 1)

        if (import.meta.env.DEV) window.__pjTl = tl
      },
      root,
    )

    return () => mm.revert()
  }, [])

  return (
    <section
      ref={rootRef}
      aria-label="Projects"
      className="relative z-[3] mt-[var(--pj-lead-pull)] w-full bg-primary pb-[var(--pj-tail-gap)]"
    >
      <Brands />

      <div
        id="projects"
        data-pj="headbox"
        className="w-full px-[var(--pj-gutter)] pt-[var(--pj-pane-top)]
                   pb-[var(--pj-head-gap)]"
      >
        <header
          className="mx-auto flex w-full max-w-[var(--pj-max-w)]
                     flex-col items-start gap-[clamp(8px,1.4svh,16px)]
                     md:flex-row md:items-end md:justify-between md:gap-8"
        >
          <div className="flex flex-col items-start gap-[var(--pj-eyebrow-gap)]">
            <Pill data-pj="head">Recent Projects</Pill>

            <h2
              data-pj="head"
              className="m-0 max-w-[15ch] font-heading text-[length:var(--pj-head-size)]
                         font-bold leading-[1.02] tracking-[-0.03em] text-white"
            >
              Real Projects, Real Impact
            </h2>
          </div>

          <p
            data-pj="head"
            className="m-0 line-clamp-3 max-w-[40ch] font-body text-[length:var(--pj-sub-size)]
                       font-light leading-[1.3] text-white/65 md:max-w-[24ch] md:text-right"
          >
            Designed and built by the same hands, then shipped and kept running.
          </p>
        </header>
      </div>

      <div data-pj="stage" className="relative h-[calc(100svh+var(--pj-runway))]">
        <div
          data-pj="pane"
          className="flex h-[100lvh] w-full flex-col overflow-hidden px-[var(--pj-gutter)]"
        >
          <div
            data-pj="deck"
            className="relative mx-auto flex min-h-0 w-full max-w-[var(--pj-max-w)]
                       flex-1 items-center overflow-hidden"
          >
            <div
              data-pj="stack"
              className="relative w-full h-[calc(var(--pj-card-h)*(1+var(--pj-fan)))]
                         top-[calc(-1*var(--pj-stack-lift))]"
            >
              {PROJECTS.map((project, i) => (
                <Card key={project.name} project={project} index={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
