/* oxlint-disable react/only-export-components */
import { Suspense, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { Canvas, useThree } from '@react-three/fiber'
import type { Stage } from '../data/stages'
import { SceneFor } from './StageIllustration'

const W = 640
const H = 360

function Probe({ onData }: { onData: (url: string) => void }) {
  const { gl, scene, camera } = useThree()
  useEffect(() => {
    let alive = true
    let raf = 0
    let frames = 0
    const tick = () => {
      if (!alive) return
      frames += 1
      if (frames >= 4) {
        gl.render(scene, camera)
        onData(gl.domElement.toDataURL('image/png'))
        return
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => {
      alive = false
      cancelAnimationFrame(raf)
    }
  }, [gl, scene, camera, onData])
  return null
}

function CaptureScene({ stage, onData }: { stage: Stage; onData: (url: string) => void }) {
  return (
    <Canvas
      dpr={1}
      frameloop="always"
      gl={{ antialias: true, alpha: false, preserveDrawingBuffer: true, powerPreference: 'high-performance' }}
      camera={{ position: [0, 1.35, 4.7], fov: 40 }}
      onCreated={({ gl }) => gl.setClearColor('#161616', 1)}
      style={{ width: W, height: H, display: 'block' }}
    >
      <ambientLight intensity={0.8} />
      <directionalLight position={[3, 5, 4]} intensity={1.4} />
      <directionalLight position={[-3, 2, -3]} intensity={0.5} color="#ffddc2" />
      <pointLight position={[-2, 2, 2]} intensity={6} color="#ffddc2" />
      <Suspense fallback={null}>
        <SceneFor scene={stage.scene} />
      </Suspense>
      <Probe onData={onData} />
    </Canvas>
  )
}

function captureOne(stage: Stage): Promise<string> {
  return new Promise((resolve) => {
    const host = document.createElement('div')
    host.style.cssText = `position:fixed;left:-9999px;top:0;width:${W}px;height:${H}px;pointer-events:none;`
    document.body.appendChild(host)
    const root = createRoot(host)
    let done = false
    const finish = (url: string) => {
      if (done) return
      done = true
      try {
        root.unmount()
      } catch {
        /* noop */
      }
      try {
        host.remove()
      } catch {
        /* noop */
      }
      resolve(url)
    }
    root.render(<CaptureScene stage={stage} onData={finish} />)
    window.setTimeout(() => finish(''), 6000)
  })
}

export async function captureStageImages(stages: Stage[]): Promise<Map<string, string>> {
  const out = new Map<string, string>()
  for (const stage of stages) {
    const url = await captureOne(stage)
    if (url) out.set(stage.id, url)
  }
  return out
}
