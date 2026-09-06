// Viewport resize helper

const COARSE = () => typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches

export function onViewportResize(fn) {
  let w = window.innerWidth
  let h = window.innerHeight

  const handler = (e) => {
    const nw = window.innerWidth
    const nh = window.innerHeight
    const urlBarOnly =
      e?.isTrusted !== false && COARSE() && nw === w && Math.abs(nh - h) < nh * 0.25
    if (urlBarOnly) return
    w = nw
    h = nh
    fn()
  }

  window.addEventListener('resize', handler)
  return () => window.removeEventListener('resize', handler)
}
