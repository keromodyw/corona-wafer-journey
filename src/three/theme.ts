import * as THREE from 'three'

export const COL = {
  wafer: '#e2b45a',
  waferDark: '#c99b3f',
  cream: '#f3e8cd',
  creamDark: '#e3d2a8',
  hazelnut: '#b9864f',
  metal: '#8b93a3',
  machine: '#2a2f3a',
  machineLight: '#39404e',
  accent: '#dc0816',
  cool: '#5bc8e0',
  hot: '#ff8a3d',
} as const

let waffleCache: THREE.CanvasTexture | null = null

export function getWaffleTexture(): THREE.CanvasTexture {
  if (waffleCache) return waffleCache
  const c = document.createElement('canvas')
  c.width = 128
  c.height = 128
  const x = c.getContext('2d')
  if (x) {
    x.fillStyle = '#e6b95e'
    x.fillRect(0, 0, 128, 128)
    x.strokeStyle = 'rgba(120, 72, 8, 0.6)'
    x.lineWidth = 3
    const cells = 6
    for (let i = 0; i <= cells; i++) {
      const p = (i * 128) / cells
      x.beginPath()
      x.moveTo(p, 0)
      x.lineTo(p, 128)
      x.stroke()
      x.beginPath()
      x.moveTo(0, p)
      x.lineTo(128, p)
      x.stroke()
    }
    x.fillStyle = 'rgba(255, 255, 255, 0.08)'
    for (let i = 0; i < cells; i++) {
      for (let j = 0; j < cells; j++) {
        x.beginPath()
        x.arc((i + 0.5) * (128 / cells), (j + 0.5) * (128 / cells), 4, 0, Math.PI * 2)
        x.fill()
      }
    }
  }
  const tex = new THREE.CanvasTexture(c)
  tex.wrapS = THREE.RepeatWrapping
  tex.wrapT = THREE.RepeatWrapping
  waffleCache = tex
  return tex
}
