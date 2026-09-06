// About Me tech logo marks

const C = {
  kraft: '#E0B25C',
  graphite: '#463E37',
  tailwind: '#38BDF8',
  psBlue: '#0070D1',
  psDeep: '#00317A',
  csharp: '#9B4F96',
  shoe: '#2563EB',
  shoeDeep: '#1E3A8A',
  sole: '#F97316',
  wordpress: '#21759B',
  spotify: '#1DB954',
}

const STROKE = {
  fill: 'none',
  strokeWidth: 1.7,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}

export function SketchbookMark(props) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" {...props}>
      <path
        {...STROKE}
        d="M6.4 4.2h11a1.4 1.4 0 0 1 1.4 1.4v13.2a1.4 1.4 0 0 1-1.4 1.4h-11a1.4 1.4 0 0 1-1.4-1.4V5.6a1.4 1.4 0 0 1 1.4-1.4Z"
        fill={C.kraft}
        stroke={C.graphite}
      />
      <path d="M8.6 2.6v3.2M12 2.6v3.2M15.4 2.6v3.2" stroke={C.graphite} {...STROKE} />
      <path
        d="M8.2 15.6c1.6-4.2 3.1-6.3 4.5-6.3 1.4 0 2.4 2.1 3.1 6.3M8.2 17.9h7.6"
        stroke={C.graphite}
        {...STROKE}
      />
    </svg>
  )
}

export function TailwindMark(props) {
  return (
    <svg viewBox="0 0 54 33" fill={C.tailwind} aria-hidden="true" focusable="false" {...props}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M27 0c-7.2 0-11.7 3.6-13.5 10.8 2.7-3.6 5.85-4.95 9.45-4.05 2.054.513 3.522 2.004 5.147 3.653C30.744 13.09 33.808 16.2 40.5 16.2c7.2 0 11.7-3.6 13.5-10.8-2.7 3.6-5.85 4.95-9.45 4.05-2.054-.513-3.522-2.004-5.147-3.653C36.756 3.11 33.692 0 27 0ZM13.5 16.2C6.3 16.2 1.8 19.8 0 27c2.7-3.6 5.85-4.95 9.45-4.05 2.054.514 3.522 2.004 5.147 3.653C17.244 29.29 20.308 32.4 27 32.4c7.2 0 11.7-3.6 13.5-10.8-2.7 3.6-5.85 4.95-9.45 4.05-2.054-.513-3.522-2.004-5.147-3.653C23.256 19.31 20.192 16.2 13.5 16.2Z"
      />
    </svg>
  )
}

export function PlayStationMark(props) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" {...props}>
      <path
        d="M8.6 2.1 7.4 2.5C6 3 5.1 4.3 5.1 5.8v12.4c0 1.5.9 2.8 2.3 3.3l1.2.4c.3.1.6-.1.6-.5V2.6c0-.4-.3-.6-.6-.5Z"
        fill={C.psBlue}
      />
      <path
        d="M15.4 2.1l1.2.4c1.4.5 2.3 1.8 2.3 3.3v12.4c0 1.5-.9 2.8-2.3 3.3l-1.2.4c-.3.1-.6-.1-.6-.5V2.6c0-.4.3-.6.6-.5Z"
        fill={C.psBlue}
      />
      <path d="M10.2 2.6h3.6v18.8h-3.6z" fill={C.psDeep} />
      <path d="M10.9 8.4h2.2v7.2h-2.2z" fill={C.psBlue} />
    </svg>
  )
}

export function CSharpMark(props) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" {...props}>
      <path d="M12 1.9 21 7v10l-9 5.1L3 17V7l9-5.1Z" fill={C.csharp} />
      <text
        x="12"
        y="12.2"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="9.4"
        fontWeight="700"
        letterSpacing="-0.4"
        fill="#ffffff"
        style={{ fontFamily: 'var(--font-heading)' }}
      >
        C#
      </text>
    </svg>
  )
}

export function WordPressMark(props) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" {...props}>
      <circle cx="12" cy="12" r="9.4" stroke={C.wordpress} {...STROKE} />
      <path d="m6.3 8.4 2.7 7.6 3-6.1 3 6.1 2.7-7.6" stroke={C.wordpress} {...STROKE} />
    </svg>
  )
}

export function SpotifyMark(props) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" {...props}>
      <circle cx="12" cy="12" r="10" fill={C.spotify} />
      <path
        d="M6.9 8.6c3.7-1.1 7.7-.6 10.6 1.4M7.5 12.1c3.1-.9 6.4-.5 8.9 1.2M8.2 15.5c2.5-.7 5.1-.4 7.1 1"
        stroke="#ffffff"
        fill="none"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function RunningShoeMark(props) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" {...props}>
      <path
        {...STROKE}
        d="M2.6 16.4c0-1.1.6-2.1 1.6-2.6l3.7-2c.5-.3.9-.8 1-1.4l.4-2.1c.1-.7.9-1.1 1.5-.7l1 .6c.4.3.6.8.5 1.3-.2 1.3.5 2.5 1.7 3l4.3 1.8c1.2.5 2 1.7 2 3v.3H2.6Z"
        fill={C.shoe}
        stroke={C.shoeDeep}
      />
      <path
        {...STROKE}
        d="M2.6 17.1h17.7c.6 0 1.1.5 1.1 1.1 0 .9-.7 1.6-1.6 1.6H4.2c-.9 0-1.6-.7-1.6-1.6Z"
        fill={C.sole}
        stroke={C.shoeDeep}
      />
      <path d="m9.7 10.4 2 1.2M8.9 12.2l2 1.2" stroke="#DBEAFE" {...STROKE} />
    </svg>
  )
}
