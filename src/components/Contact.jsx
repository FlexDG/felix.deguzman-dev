// Contact section

import { Fragment, useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import emailjs from '@emailjs/browser'
import { scrub } from '../hooks/useSmoothScroll'
import { Pill } from './Process'
import { HeroCta } from './Hero'

gsap.registerPlugin(ScrollTrigger)

const AVATAR = `${import.meta.env.BASE_URL}images/contact_image.webp`

const CV_FILE = `${import.meta.env.BASE_URL}${encodeURI(
  'resources/De Guzman, Felix Rafael - CV.pdf',
)}`
const CV_NAME = 'Felix De Guzman - CV.pdf'

const HEADING = 'Let’s make something worth keeping.'

const LEAD =
  'Tell me what you are building and where it is stuck. I will come back with a straight answer on scope, timing and cost — and an honest call on whether it should be custom-built or run on a CMS. If I am not the right fit, I will say so and point you somewhere better.'

const DETAILS = [
  { text: '+63 997 655 5864', href: 'tel:+639976555864' },
  { text: 'felix.dg.50@gmail.com', href: 'mailto:felix.dg.50@gmail.com' },
  { text: 'Angeles City, Pampanga, Philippines', href: null },
]

const FIELDS = [
  {
    name: 'name',
    label: 'Full name',
    placeholder: 'Juan Dela Cruz',
    type: 'text',
    autoComplete: 'name',
    required: true,
  },
  {
    name: 'phone',
    label: 'Contact number',
    placeholder: '+63 900 000 0000',
    type: 'tel',
    inputMode: 'numeric',
    autoComplete: 'tel',
    required: false,
    digits: true,
  },
  {
    name: 'email',
    label: 'Email',
    placeholder: 'you@company.com',
    type: 'email',
    autoComplete: 'email',
    required: true,
  },
  {
    name: 'budget',
    label: 'What is your budget?',
    placeholder: '₱50,000 – ₱150,000',
    type: 'text',
    inputMode: 'numeric',
    autoComplete: 'off',
    required: false,
    digits: true,
  },
]

const digitsOnly = (e) => {
  const el = e.target
  const clean = el.value.replace(/\D/g, '')
  if (clean === el.value) return false

  const caret = el.selectionStart ?? el.value.length
  const kept = el.value.slice(0, caret).replace(/\D/g, '').length
  el.value = clean
  el.setSelectionRange(kept, kept)
  return true
}

const EMAILJS = {
  serviceId: 'service_zluvjph',
  templateId: 'template_nw7u16r',
  publicKey: 'BhBC-9FlRoHKVXjwy',
}

const peso = (value) => {
  const digits = String(value || '').replace(/\D/g, '')
  if (!digits) return ''
  return '₱' + digits.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

const params = (data) => {
  const name = String(data.name || '').trim()
  const subject = name ? `Project enquiry — ${name}` : 'Website development enquiry'

  return {
    name: data.name,
    from_name: data.name,
    user_name: data.name,

    email: data.email,
    from_email: data.email,
    user_email: data.email,
    reply_to: data.email,

    phone: data.phone || 'Not given',
    user_phone: data.phone || 'Not given',

    budget: peso(data.budget) || 'Not given',
    user_budget: peso(data.budget) || 'Not given',

    message: data.project,
    project: data.project,

    user_subject: subject,
    subject,
    title: subject,
  }
}

function words(text, mark) {
  return text.split(' ').map((word, i) => (
    <Fragment key={`${mark}-${i}`}>
      {i > 0 && ' '}
      <span data-ct={mark}>{word}</span>
    </Fragment>
  ))
}

function StatusMark({ tone }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="12" cy="12" r="9.2" />
      {tone === 'error' ? (
        <path d="M15.1 8.9 8.9 15.1M8.9 8.9l6.2 6.2" />
      ) : (
        <path d="m7.8 12.3 2.9 2.9 5.5-6.1" />
      )}
    </svg>
  )
}

export default function Contact() {
  const rootRef = useRef(null)

  const [status, setStatus] = useState({ state: 'idle', message: '' })
  const sending = status.state === 'sending'

  const btnRef = useRef(null)
  const wasSending = useRef(false)

  const [warn, setWarn] = useState(null)

  const onDigits = (e) => {
    const el = e.target
    setWarn(digitsOnly(e) ? el.name : (w) => (w === el.name ? null : w))
  }

  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    const mm = gsap.matchMedia()

    const build = () =>
      mm.add(
        {
          reduced: '(prefers-reduced-motion: reduce)',
          motion: '(prefers-reduced-motion: no-preference)',
        },
        (self) => {
          if (self.conditions.reduced) return

          const q = gsap.utils.selector(root)
          const lead = q('[data-ct="lead"]')[0]
          const pop = q('[data-ct="pop"]')[0]
          const lWords = q('[data-ct="lword"]')
          const rise = q('[data-ct="rise"]')
          const grid = q('[data-ct="grid"]')[0]
          const anchor = q('[data-ct="typer-anchor"]')[0]
          const typer = q('[data-ct="typer"]')[0]
          const reachPill = q('[data-ct="reach-pill"]')[0]
          const detailLines = q('[data-ct="detail-line"]')
          const cvBtn = q('[data-ct="cv"]')[0]

          if (pop) {
            const tlPop = gsap.from(pop, {
              autoAlpha: 0,
              y: 24,
              duration: 0.8,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: pop,
                start: 'top 82%',
                toggleActions: 'play none none reverse',
              },
            })

            if (import.meta.env.DEV) window.__ctPop = tlPop
          }

          if (lead && lWords.length) {
            gsap.set(lWords, { opacity: 'var(--ct-ghost)' })

            const LEAD_WINDOW = 0.5
            const lStep = LEAD_WINDOW / Math.max(lWords.length - 1, 1)

            const tlInk = gsap.timeline({
              defaults: { ease: 'none' },
              scrollTrigger: {
                trigger: lead,
                start: 'top bottom',
                end: 'bottom top',
                scrub: scrub(0.6),
                invalidateOnRefresh: true,
              },
            })

            tlInk
              .to(lWords, { opacity: 1, duration: lStep * 3.2, stagger: lStep }, 0)

              .set({}, {}, 1)

            if (import.meta.env.DEV) window.__ctInk = tlInk
          }

          if (grid && rise.length) {
            gsap.from(rise, {
              autoAlpha: 0,
              y: 18,
              duration: 0.7,
              ease: 'power2.out',
              stagger: 0.09,
              scrollTrigger: {
                trigger: grid,
                start: 'top 82%',
                toggleActions: 'play none none reverse',
              },
            })
          }

          if (anchor && typer && reachPill && detailLines.length) {
            const SPEED = 0.728
            const POP_IN = 0.3 * SPEED

            const dots = q('[data-ct="dot"]')

            const typerH = typer.getBoundingClientRect().height

            const anchorBox = anchor.getBoundingClientRect()

            const messages = [reachPill, ...detailLines, cvBtn].filter(Boolean)
            const stops = messages.map((el) => {
              const r = el.getBoundingClientRect()
              return {
                x: r.left - anchorBox.left,
                y: r.top - anchorBox.top + (r.height - typerH) / 2,
              }
            })

            const last = messages[messages.length - 1]
            const lastBox = last.getBoundingClientRect()
            const gap = parseFloat(getComputedStyle(detailLines[0].parentElement).rowGap) || 0
            stops.push({
              x: lastBox.left - anchorBox.left,
              y: lastBox.top - anchorBox.top + lastBox.height + gap,
            })

            const lift = -(dots[0]?.offsetHeight || 5) * 1.08

            gsap.set(dots, { y: 0, opacity: 0.6 })
            const dotsTl = gsap.timeline({ repeat: -1, paused: true })
            dotsTl
              .to(dots, {
                y: lift,
                opacity: 1,
                duration: 0.35 * SPEED,
                stagger: 0.15 * SPEED,
                ease: 'power1.inOut',
              })
              .to(dots, {
                y: 0,
                opacity: 0.6,
                duration: 0.35 * SPEED,
                stagger: 0.15 * SPEED,
                ease: 'power1.inOut',
              })

            const texts = messages.map((el) => el.querySelector('[data-ct="msg-text"]'))
            gsap.set([typer, ...messages], {
              scale: 0,
              opacity: 0,
              transformOrigin: 'bottom left',
            })
            gsap.set(typer, { visibility: 'visible' })
            gsap.set(texts, { opacity: 0, filter: 'blur(4px)' })

            const tlSay = gsap.timeline({
              scrollTrigger: {
                trigger: anchor,
                start: 'bottom 95%',
                once: true,
              },
            })

            tlSay
              .set(typer, { x: stops[0].x, y: stops[0].y })
              .to(typer, {
                scale: 1,
                opacity: 1,
                duration: 0.5 * SPEED,
                ease: 'back.out(1.7)',
              })
              .to(
                typer,
                {
                  scale: 1.03,
                  duration: 0.1 * SPEED,
                  ease: 'power2.out',
                },
                '-=0.1',
              )
              .to(typer, {
                scale: 1,
                duration: 0.15 * SPEED,
                ease: 'power2.inOut',
              })
              .call(() => dotsTl.play(), null, '-=0.2')

            messages.forEach((msg, i) => {
              tlSay
                .to(
                  typer,
                  {
                    x: stops[i + 1].x,
                    y: stops[i + 1].y,
                    duration: 0.4 * SPEED,
                    ease: 'power2.inOut',
                  },
                  '+=0.5',
                )
                .to(
                  msg,
                  {
                    scale: 1,
                    opacity: 1,
                    duration: 0.5 * SPEED,
                    ease: 'back.out(1.7)',
                  },
                  `<${POP_IN}`,
                )
                .to(
                  msg,
                  {
                    scale: 1.03,
                    duration: 0.1 * SPEED,
                    ease: 'power2.out',
                  },
                  '-=0.1',
                )
                .to(msg, {
                  scale: 1,
                  duration: 0.15 * SPEED,
                  ease: 'power2.inOut',
                })
                .to(
                  texts[i],
                  {
                    opacity: 1,
                    filter: 'blur(0px)',
                    duration: 0.4 * SPEED,
                    ease: 'power2.out',
                  },
                  '-=0.2',
                )
            })

            tlSay
              .call(() => dotsTl.pause(), null, '+=0.3')
              .to(typer, {
                scale: 0,
                opacity: 0,
                duration: 0.4 * SPEED,
                ease: 'back.in(1.7)',
              })

            if (import.meta.env.DEV) {
              tlSay.eventCallback('onStart', () => dotsTl.play())
              window.__ctSay = tlSay
            }
          }
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
  }, [])

  const onSubmit = async (e) => {
    e.preventDefault()
    if (sending) return

    const form = e.currentTarget
    const data = Object.fromEntries(new FormData(form))
    const first = String(data.name || '')
      .trim()
      .split(' ')[0]

    setStatus({ state: 'sending', message: '' })

    try {
      await emailjs.send(EMAILJS.serviceId, EMAILJS.templateId, params(data), {
        publicKey: EMAILJS.publicKey,
      })
      form.reset()
      setStatus({
        state: 'sent',
        message: first
          ? `Thanks, ${first} — your message has been submitted successfully. I’ll get back to you soon.`
          : 'Your message has been submitted successfully. I’ll get back to you soon.',
      })
    } catch (err) {
      console.error('[contact] EmailJS send failed', err)
      setStatus({
        state: 'error',
        message:
          'That did not send. Please try again, or email me directly at felix.dg.50@gmail.com.',
      })
    }
  }

  const onInput = () => {
    if (status.state === 'sent' || status.state === 'error') {
      setStatus({ state: 'idle', message: '' })
    }
  }

  useEffect(() => {
    if (sending) {
      wasSending.current = true
      return
    }
    if (!wasSending.current) return
    wasSending.current = false
    if (document.activeElement === document.body) btnRef.current?.focus()
  }, [sending])

  return (
    <section
      ref={rootRef}
      id="contact"
      aria-labelledby="contact-heading"
      className="relative z-[2] w-full bg-surface pb-[var(--ct-tail)]"
    >
      <div
        className="mx-auto w-full max-w-[var(--max-content-width)]
                   px-[var(--page-padding-x)]"
      >
        <div
          data-ct="head"
          className="mx-auto flex w-full max-w-[var(--ct-head-w)] flex-col
                     items-center pt-[calc(var(--section-padding-y)+24px)]
                     text-center"
        >
          <h1
            id="contact-heading"
            data-ct="pop"
            className="m-0 font-heading text-[length:var(--ct-h1)] font-bold
                       leading-[0.98] tracking-[-0.035em] text-primary"
          >
            {HEADING}
          </h1>

          <p
            data-ct="lead"
            className="m-0 mt-[var(--ct-h1-gap)] font-heading
                       text-[length:var(--ct-lead)] font-light leading-[1.18]
                       tracking-[-0.02em] text-primary"
          >
            {words(LEAD, 'lword')}
          </p>
        </div>

        <div data-ct="grid" className="mt-[var(--ct-head-gap)] w-full">
          <div data-ct="col" className="flex flex-col gap-[var(--ct-col-gap)]">
            <div data-ct="typer-anchor" className="relative text-left">
              <h2
                data-ct="rise"
                className="m-0 font-heading text-[length:var(--ct-h2)] font-bold
                           leading-[1.02] tracking-[-0.03em] text-primary"
              >
                — Let’s talk.
              </h2>

              <p
                data-ct="rise"
                className="m-0 mb-[72px] mt-[var(--ct-h2-gap)] max-w-[38ch]
                           font-body text-[length:var(--ct-sub)] font-light
                           leading-[1.45] tracking-[-0.01em] text-primary/75"
              >
                Have a project or need help? Fill out the form, and I’ll get back to you soon.
              </p>

              <div data-ct="rise" className="flex items-center gap-[16px]">
                <img
                  src={AVATAR}
                  alt="Felix De Guzman"
                  className="h-[var(--ct-avatar-size)] w-[var(--ct-avatar-size)]
                             shrink-0 rounded-[var(--ct-avatar-radius)]
                             object-cover"
                />
                <Pill data-ct="reach-pill">
                  <span data-ct="msg-text">Reach me directly, say hi!</span>
                </Pill>
              </div>

              <address data-ct="details" className="not-italic mt-[var(--ct-h2-gap)]">
                {DETAILS.map((d) => (
                  <p key={d.text} data-ct="detail-line" className="m-0">
                    {d.href ? (
                      <a data-ct="detail-link" href={d.href}>
                        <span data-ct="msg-text">{d.text}</span>
                      </a>
                    ) : (
                      <span data-ct="msg-text">{d.text}</span>
                    )}
                  </p>
                ))}
              </address>

              <div className="mt-[var(--ct-h2-gap)]">
                <HeroCta data-ct="cv" href={CV_FILE} download={CV_NAME}>
                  <span data-ct="msg-text">Download CV</span>
                </HeroCta>
              </div>

              <Pill
                data-ct="typer"
                aria-hidden="true"
                className="pointer-events-none absolute left-0 top-0 z-[1]"
              >
                <span data-ct="dots">
                  <i data-ct="dot" />
                  <i data-ct="dot" />
                  <i data-ct="dot" />
                </span>
              </Pill>
            </div>
          </div>

          <form data-ct="form" onSubmit={onSubmit} onInput={onInput} noValidate={false}>
            {FIELDS.map((f) => (
              <div key={f.name} data-ct="rise" className="flex flex-col">
                <label data-ct="label" htmlFor={`ct-${f.name}`}>
                  {f.label}
                  {f.required && (
                    <span aria-hidden="true" data-ct="req">
                      {' '}
                      *
                    </span>
                  )}
                </label>
                <input
                  data-ct="field"
                  id={`ct-${f.name}`}
                  name={f.name}
                  type={f.type}
                  placeholder={f.placeholder}
                  autoComplete={f.autoComplete}
                  required={f.required}
                  inputMode={f.inputMode}
                  onInput={f.digits ? onDigits : undefined}
                />
                {warn === f.name && (
                  <span role="alert" style={{ color: '#ff4d4d', fontSize: '0.75rem' }}>
                    Please enter a number.
                  </span>
                )}
              </div>
            ))}

            <div data-ct="rise" className="flex flex-col">
              <label data-ct="label" htmlFor="ct-project">
                Your project
                <span aria-hidden="true" data-ct="req">
                  {' '}
                  *
                </span>
              </label>
              <textarea
                data-ct="field"
                id="ct-project"
                name="project"
                rows={4}
                placeholder="Tell me about your project"
                required
              />
            </div>

            <div data-ct="rise" className="flex flex-col items-start">
              <button
                ref={btnRef}
                data-ct="submit"
                data-hover-fill
                type="submit"
                disabled={sending}
              >
                {sending ? 'Submitting…' : 'Send message'}
              </button>

              <p data-ct="status" data-tone={status.state} role="status" aria-live="polite">
                {status.message ? (
                  <>
                    <StatusMark tone={status.state} />
                    <span>{status.message}</span>
                  </>
                ) : null}
              </p>
            </div>
          </form>
        </div>
      </div>
    </section>
  )
}
