import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import type { Group } from 'three'
import { COL } from '../three/theme'
import { Finger, Sheet } from '../three/shapes'

function Floaters() {
  const group = useRef<Group>(null)
  useFrame((state) => {
    const t = state.clock.elapsedTime
    const g = group.current
    if (!g) return
    g.rotation.y = t * 0.12
    g.position.y = Math.sin(t * 0.5) * 0.12
  })
  return (
    <group ref={group}>
      <group position={[3.1, 1.5, -1.5]} rotation={[-0.25, -0.5, 0.06]}>
        <Sheet w={1.7} d={1.2} y={0} color={COL.wafer} waffle />
        <Sheet w={1.62} d={1.14} t={0.035} y={0.07} color={COL.cream} />
        <Sheet w={1.7} d={1.2} y={0.14} color={COL.wafer} waffle />
      </group>
      <group position={[-3.4, 1.6, -2]} rotation={[0.3, 0.6, -0.08]}>
        <Sheet w={1.6} d={1.1} color={COL.wafer} waffle />
      </group>
      <group position={[3.4, -1.7, -1.6]} rotation={[-0.35, 0.7, 0.1]}>
        <Sheet w={1.4} d={1.0} color={COL.wafer} waffle />
      </group>
      <group position={[-3.2, -1.6, -1.2]} rotation={[0.1, 0.35, 0.1]}>
        <Finger x={0} y={0} z={0} />
        <Finger x={0.4} y={0} z={-0.15} />
        <Finger x={-0.35} y={0} z={0.2} />
      </group>
      <group position={[-1.9, 0.9, -0.6]} rotation={[0.05, -0.4, 0]}>
        <Finger x={0} y={0} z={0} />
        <Finger x={0.38} y={0} z={0} />
      </group>
      <group position={[2.1, -0.4, -0.5]} rotation={[0.1, 0.5, -0.05]}>
        <Finger x={0} y={0} z={0} />
        <Finger x={-0.4} y={0} z={0.1} />
      </group>
    </group>
  )
}

export function HeroWafers({ className = '' }: { className?: string }) {
  return (
    <div className={`hero-wafer3d ${className}`} aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0.9, 6.8], fov: 50 }}
        dpr={[1, 1.6]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        <ambientLight intensity={1.1} />
        <directionalLight position={[5, 6, 4]} intensity={1.4} />
        <directionalLight position={[-4, -2, 3]} intensity={0.5} color="#ffddc2" />
        <Floaters />
      </Canvas>
    </div>
  )
}
