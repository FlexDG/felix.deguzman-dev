// Nav menu items and icons

const ICON_PROPS = {
  viewBox: '0 0 24 24',
  fill: 'currentColor',
  'aria-hidden': 'true',
  className: 'h-[var(--hero-card-icon)] w-[var(--hero-card-icon)] shrink-0 text-primary',
}

export const MENU_ITEMS = [
  {
    label: 'Home',
    href: '#home',
    icon: (
      <svg {...ICON_PROPS}>
        <path fillRule="evenodd" clipRule="evenodd" d="M12 3 3 11h2v9h14v-9h2zM10 20v-5h4v5z" />
      </svg>
    ),
  },
  {
    label: 'About',
    href: '#about',
    icon: (
      <svg {...ICON_PROPS}>
        <path d="M12 4a3.75 3.75 0 1 0 0 7.5A3.75 3.75 0 0 0 12 4z" />
        <path d="M12 13.2c-4.3 0-7.7 3-7.7 6.7 0 .6.4 1 1 1h13.4c.6 0 1-.4 1-1 0-3.7-3.4-6.7-7.7-6.7z" />
      </svg>
    ),
  },
  {
    label: 'Projects',
    href: '#projects',
    icon: (
      <svg {...ICON_PROPS}>
        <path d="M3 6.5A1.5 1.5 0 0 1 4.5 5h4.2c.47 0 .92.22 1.2.6L11.3 7.5h8.2A1.5 1.5 0 0 1 21 9v8.5a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 17.5z" />
      </svg>
    ),
  },
  {
    label: 'My Process',
    href: '#process',
    icon: (
      <svg {...ICON_PROPS}>
        <path d="M3 21h18V3h-4.5v4.5H12V12H7.5v4.5H3z" />
      </svg>
    ),
  },
  {
    label: 'Contact',
    href: '#contact',
    icon: (
      <svg {...ICON_PROPS}>
        <path d="M20.8 5.6a1.5 1.5 0 0 0-1.3-.7h-15c-.55 0-1.03.3-1.3.7L12 11.6z" />
        <path d="M3 7.7v9.9c0 .83.67 1.5 1.5 1.5h15c.83 0 1.5-.67 1.5-1.5V7.7l-8.44 6.03a1 1 0 0 1-1.12 0z" />
      </svg>
    ),
  },
]
