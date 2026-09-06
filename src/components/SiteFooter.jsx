// Site footer

const LINKS = [
  { label: 'Home', href: '#home' },
  { label: 'About Me', href: '#about' },
  { label: 'Projects', href: '#projects' },
  { label: 'My Process', href: '#process' },
  { label: 'Services', href: '#services' },
  { label: 'Contact', href: '#contact' },
]

const SOCIALS = [
  {
    label: 'Facebook',
    href: 'https://facebook.com/',
    path: 'M14 8.5V6.9c0-.8.2-1.2 1.4-1.2H17V2.6c-.3 0-1.2-.1-2.2-.1-2.2 0-3.7 1.3-3.7 3.8v2.2H8.5v3.1h2.6V21H14v-9.4h2.6l.4-3.1H14z',
  },
  {
    label: 'LinkedIn',
    href: 'https://linkedin.com/',
    path: 'M6.9 21H3.6V9.5h3.3V21zM5.2 8.1a1.9 1.9 0 1 1 0-3.9 1.9 1.9 0 0 1 0 3.9zM21 21h-3.3v-5.6c0-1.3 0-3-1.9-3s-2.1 1.4-2.1 2.9V21H10.4V9.5h3.1V11h.1c.4-.8 1.5-1.7 3.1-1.7 3.3 0 3.9 2.2 3.9 5V21z',
  },
  {
    label: 'Instagram',
    href: 'https://instagram.com/',
    path: 'M12 4.6c2.4 0 2.7 0 3.6.1.9 0 1.4.2 1.7.3.4.2.7.4 1 .7.3.3.5.6.7 1 .1.3.3.8.3 1.7 0 .9.1 1.2.1 3.6s0 2.7-.1 3.6c0 .9-.2 1.4-.3 1.7-.2.4-.4.7-.7 1-.3.3-.6.5-1 .7-.3.1-.8.3-1.7.3-.9 0-1.2.1-3.6.1s-2.7 0-3.6-.1c-.9 0-1.4-.2-1.7-.3-.4-.2-.7-.4-1-.7-.3-.3-.5-.6-.7-1-.1-.3-.3-.8-.3-1.7 0-.9-.1-1.2-.1-3.6s0-2.7.1-3.6c0-.9.2-1.4.3-1.7.2-.4.4-.7.7-1 .3-.3.6-.5 1-.7.3-.1.8-.3 1.7-.3.9 0 1.2-.1 3.6-.1M12 3c-2.4 0-2.8 0-3.7.1-.9 0-1.6.2-2.2.4-.6.2-1.1.5-1.6 1-.5.5-.8 1-1 1.6-.2.6-.4 1.3-.4 2.2C3 9.2 3 9.6 3 12s0 2.8.1 3.7c0 .9.2 1.6.4 2.2.2.6.5 1.1 1 1.6.5.5 1 .8 1.6 1 .6.2 1.3.4 2.2.4.9 0 1.3.1 3.7.1s2.8 0 3.7-.1c.9 0 1.6-.2 2.2-.4.6-.2 1.1-.5 1.6-1 .5-.5.8-1 1-1.6.2-.6.4-1.3.4-2.2 0-.9.1-1.3.1-3.7s0-2.8-.1-3.7c0-.9-.2-1.6-.4-2.2-.2-.6-.5-1.1-1-1.6-.5-.5-1-.8-1.6-1-.6-.2-1.3-.4-2.2-.4C14.8 3 14.4 3 12 3zm0 4.4a4.6 4.6 0 1 0 0 9.2 4.6 4.6 0 0 0 0-9.2zm0 7.6a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm5.8-7.8a1.1 1.1 0 1 1-2.2 0 1.1 1.1 0 0 1 2.2 0z',
  },
  {
    label: 'Twitter',
    href: 'https://twitter.com/',
    path: 'M21 6.2c-.7.3-1.4.5-2.1.6.8-.5 1.3-1.2 1.6-2-.7.4-1.5.7-2.3.9a3.7 3.7 0 0 0-6.3 3.3A10.4 10.4 0 0 1 4.3 4.9a3.7 3.7 0 0 0 1.1 4.9c-.6 0-1.2-.2-1.7-.5 0 1.8 1.3 3.3 3 3.6-.5.2-1.1.2-1.7.1a3.7 3.7 0 0 0 3.4 2.6A7.4 7.4 0 0 1 3 17.1a10.4 10.4 0 0 0 5.7 1.7c6.8 0 10.5-5.6 10.5-10.5v-.5c.7-.5 1.3-1.2 1.8-2z',
  },
]

export default function SiteFooter() {
  return (
    <footer data-ftr="bar" aria-label="Site footer" className="relative z-[1] w-full bg-primary">
      <div
        data-ftr="inner"
        className="mx-auto flex w-full max-w-[var(--max-content-width)]
                   flex-col px-[var(--page-padding-x)]"
      >
        <div data-ftr="top">
          <div data-ftr="left">
            <div>
              <h2
                className="m-0 font-heading text-[length:var(--ftr-head)] font-bold
                           leading-[1.05] tracking-[-0.03em] text-white"
              >
                Let’s build it properly.
              </h2>
              <p
                className="m-0 mt-[var(--ftr-head-gap)] max-w-[34ch] font-body
                           text-[length:var(--ftr-sub)] font-light leading-[1.5]
                           tracking-[-0.01em] text-white/70"
              >
                Design, build and handover — measured, documented and made to hold up long after
                launch day.
              </p>
            </div>

            <nav aria-label="Footer" data-ftr="col">
              <h3 data-ftr="coltitle">Quick links</h3>
              <ul data-ftr="links">
                {LINKS.map((l) => (
                  <li key={l.href}>
                    <a href={l.href} data-hover-roll>
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          <div data-ftr="col">
            <h3 data-ftr="coltitle">Socials</h3>
            <ul data-ftr="socials">
              {SOCIALS.map((s) => (
                <li key={s.label}>
                  <a
                    href={s.href}
                    data-ftr="social"
                    data-hover-fill
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      aria-hidden="true"
                      focusable="false"
                    >
                      <path d={s.path} />
                    </svg>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p data-ftr="wordmark" aria-hidden="true">
          FLEX_DEV
        </p>

        <div data-ftr="bottom">
          <a href="mailto:felix.dg.50@gmail.com" data-ftr="bottomlink">
            felix.dg.50@gmail.com
          </a>
          <p data-ftr="copy">© 2026 FLEX_DEV. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
