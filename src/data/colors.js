export const CUBE_COLORS = {
  W: '#FFFFFF',
  Y: '#FFD500',
  R: '#B71234',
  O: '#FF5800',
  G: '#009B48',
  B: '#0046AD',
  X: '#4B5563',
}

export const FACE_SHADING = {
  U: 1.0,
  F: 0.85,
  R: 0.7,
  D: 0.6,
  B: 0.85,
  L: 0.7,
}

export function getStickerColor(code) {
  return CUBE_COLORS[code] || CUBE_COLORS.X
}

export function shadedColor(hex, factor) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  const sr = Math.round(r * factor)
  const sg = Math.round(g * factor)
  const sb = Math.round(b * factor)
  return `rgb(${sr},${sg},${sb})`
}
