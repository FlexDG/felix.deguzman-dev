// Hero dust sampling — image pixels to particle attributes

const CELL_PX = { high: 6.5, low: 10.5 }
const CAP = { high: 60000, low: 20000 }
const FLAKE = { high: 1, low: 0.72 }
const ALPHA_MIN = 110
const JITTER = 0.7

export function planDust({ boxW, boxH, zoom, low }) {
  const cell = (low ? CELL_PX.low : CELL_PX.high) / Math.max(zoom, 1)

  let cols = Math.max(16, Math.round(boxW / cell))
  let rows = Math.max(16, Math.round(boxH / cell))

  const cap = low ? CAP.low : CAP.high
  const est = cols * rows * 0.55

  if (est > cap) {
    const k = Math.sqrt(cap / est)
    cols = Math.max(16, Math.round(cols * k))
    rows = Math.max(16, Math.round(rows * k))
  }

  return { cols, rows, flake: low ? FLAKE.low : FLAKE.high }
}

export function sampleDust(image, cols, rows) {
  const canvas = document.createElement('canvas')
  canvas.width = cols
  canvas.height = rows

  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) return null

  ctx.clearRect(0, 0, cols, rows)
  ctx.drawImage(image, 0, 0, cols, rows)

  let data
  try {
    data = ctx.getImageData(0, 0, cols, rows).data
  } catch {
    return null
  }

  let count = 0
  for (let i = 3; i < data.length; i += 4) {
    if (data[i] >= ALPHA_MIN) count += 1
  }
  if (!count) return null

  const uv = new Float32Array(count * 2)
  const color = new Uint8Array(count * 4)
  const rnd = new Uint8Array(count * 4)

  let n = 0
  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < cols; x += 1) {
      const i = (y * cols + x) * 4
      const a = data[i + 3]
      if (a < ALPHA_MIN) continue

      const jx = (Math.random() - 0.5) * JITTER
      const jy = (Math.random() - 0.5) * JITTER

      uv[n * 2] = (x + 0.5 + jx) / cols
      uv[n * 2 + 1] = 1 - (y + 0.5 + jy) / rows

      color[n * 4] = data[i]
      color[n * 4 + 1] = data[i + 1]
      color[n * 4 + 2] = data[i + 2]
      color[n * 4 + 3] = a

      rnd[n * 4] = (Math.random() * 255) | 0
      rnd[n * 4 + 1] = (Math.random() * 255) | 0
      rnd[n * 4 + 2] = (Math.random() * 255) | 0
      rnd[n * 4 + 3] = (Math.random() * 255) | 0

      n += 1
    }
  }

  return { count, uv, color, rnd, cols, rows }
}
