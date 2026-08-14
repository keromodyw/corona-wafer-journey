import { Suspense, useEffect, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import type { Group, Mesh } from 'three'
import type { Stage, StageScene } from '../data/stages'
import { COL } from './theme'
import { Finger, Sheet } from './shapes'

function Sieve({ y = 0.95 }: { y?: number }) {
  return (
    <group position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
      <mesh>
        <torusGeometry args={[0.48, 0.055, 12, 32]} />
        <meshStandardMaterial color={COL.metal} metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh>
        <circleGeometry args={[0.46, 26]} />
        <meshBasicMaterial color={COL.accent} wireframe />
      </mesh>
    </group>
  )
}

function Tank({ x, z = 0 }: { x: number; z?: number }) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.48, 0.48, 1.0, 26]} />
        <meshStandardMaterial color={COL.machineLight} metalness={0.5} roughness={0.4} />
      </mesh>
      <mesh position={[0, -0.12, 0]}>
        <cylinderGeometry args={[0.4, 0.4, 0.44, 26]} />
        <meshStandardMaterial color={COL.cream} roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.56, 0]}>
        <cylinderGeometry args={[0.34, 0.44, 0.12, 26]} />
        <meshStandardMaterial color={COL.machine} metalness={0.6} roughness={0.35} />
      </mesh>
    </group>
  )
}

function Nozzle({ x, z = 0 }: { x: number; z?: number }) {
  return (
    <group position={[x, 1.02, z]}>
      <mesh>
        <cylinderGeometry args={[0.09, 0.1, 0.5, 12]} />
        <meshStandardMaterial color={COL.metal} metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[0, -0.27, 0]}>
        <coneGeometry args={[0.08, 0.16, 12]} />
        <meshStandardMaterial color={COL.metal} metalness={0.7} roughness={0.3} />
      </mesh>
    </group>
  )
}

/* filling dripping from the nozzle onto the sheet */
function Drip({ x, z = 0, delay = 0, speed = 1.1 }: { x: number; z?: number; delay?: number; speed?: number }) {
  const ref = useRef<Mesh>(null)
  useFrame((state) => {
    const m = ref.current
    if (!m) return
    const t = (state.clock.elapsedTime * speed + delay) % 1.15
    const y = 0.72 - t * 0.6
    m.position.y = Math.max(0.115, y)
    m.visible = y > 0.115
    m.scale.setScalar(Math.max(0.35, 1 - t * 0.6))
  })
  return (
    <mesh ref={ref} position={[x, 0.72, z]}>
      <sphereGeometry args={[0.05, 10, 10]} />
      <meshStandardMaterial color={COL.cream} roughness={0.6} transparent opacity={0.9} />
    </mesh>
  )
}

/* open-air drifting particles */
/* open-air drifting particles */
function Drift({ count = 7, seed = 0 }: { count?: number; seed?: number }) {
  const refs = useRef<(Mesh | null)[]>([])
  useFrame((state) => {
    const t = state.clock.elapsedTime
    for (let i = 0; i < count; i++) {
      const m = refs.current[i]
      if (!m) continue
      const speed = 0.22 + ((i + seed) % 3) * 0.05
      m.position.y = 0.15 + ((t * speed + (i + seed) * 1.6) % 1.7)
      m.position.x = ((i + seed) % 3) * 0.55 - 0.55 + Math.sin(t * 0.6 + i * 1.3) * 0.14
      m.position.z = ((i + seed) % 2) * 0.5 - 0.25 + Math.cos(t * 0.5 + i) * 0.16
    }
  })
  return (
    <group>
      {Array.from({ length: count }).map((_, i) => (
        <mesh
          key={i}
          ref={(el) => {
            refs.current[i] = el
          }}
        >
          <sphereGeometry args={[0.045, 10, 10]} />
          <meshStandardMaterial color={COL.cool} emissive={COL.cool} emissiveIntensity={0.5} transparent opacity={0.75} />
        </mesh>
      ))}
    </group>
  )
}

/* drag / touch to rotate, gentle auto-rotation when animated */
function Controls({ animate }: { animate: boolean }) {
  const { camera, gl } = useThree()
  const [controls] = useState(() => {
    const c = new OrbitControls(camera, gl.domElement)
    c.enableDamping = true
    c.dampingFactor = 0.08
    c.enableZoom = false
    c.autoRotate = false
    c.autoRotateSpeed = 1.0
    c.minPolarAngle = 0.55
    c.maxPolarAngle = Math.PI * 0.62
    return c
  })
  useEffect(() => {
    controls.autoRotate = animate
  }, [controls, animate])
  useEffect(() => () => controls.dispose(), [controls])
  useFrame(() => controls.update())
  return null
}

function Rotator({ children, animate, bob = 0 }: { children: React.ReactNode; animate: boolean; bob?: number }) {
  const ref = useRef<Group>(null)
  useFrame((state) => {
    const g = ref.current
    if (!g) return
    if (animate) g.position.y = Math.sin(state.clock.elapsedTime * 1.4) * bob
  })
  return <group ref={ref}>{children}</group>
}

/* ---------- per-stage scenes ---------- */
function SceneRaw() {
  return (
    <>
      <group position={[-1.25, -0.2, 0]} rotation={[0, 0.3, 0.06]}>
        <mesh>
          <boxGeometry args={[0.52, 0.46, 0.52]} />
          <meshStandardMaterial color="#a87c50" flatShading roughness={0.9} />
        </mesh>
        <mesh position={[0, 0.28, 0]}>
          <sphereGeometry args={[0.09, 12, 12]} />
          <meshStandardMaterial color="#8a623d" />
        </mesh>
      </group>
      <group position={[-0.85, -0.18, 0.28]} rotation={[0, -0.25, -0.04]}>
        <mesh>
          <boxGeometry args={[0.48, 0.4, 0.48]} />
          <meshStandardMaterial color="#bf9358" flatShading roughness={0.9} />
        </mesh>
        <mesh position={[0, 0.24, 0]}>
          <sphereGeometry args={[0.08, 12, 12]} />
          <meshStandardMaterial color="#9c7442" />
        </mesh>
      </group>
      <group position={[-0.55, -0.32, 0]}>
        <mesh>
          <cylinderGeometry args={[0.3, 0.72, 0.5, 22]} />
          <meshStandardMaterial color={COL.metal} metalness={0.6} roughness={0.35} />
        </mesh>
      </group>
      <Sieve y={0.95} />
      <mesh position={[0.02, 0.55, 0]}>
        <sphereGeometry args={[0.14, 16, 16]} />
        <meshStandardMaterial color={COL.hazelnut} roughness={0.7} />
      </mesh>
      <Tank x={0.85} z={0.15} />
      <Tank x={1.65} z={-0.15} />
      <mesh position={[-1.6, -0.28, -0.1]} rotation={[0, 0.15, 0]}>
        <boxGeometry args={[0.5, 0.44, 0.5]} />
        <meshStandardMaterial color="#b0803f" flatShading roughness={0.9} />
      </mesh>
    </>
  )
}

function SceneBaking() {
  return (
    <>
      <group position={[0, 0.15, -0.15]}>
        <mesh>
          <boxGeometry args={[2.1, 1.5, 1.0]} />
          <meshStandardMaterial color={COL.machine} metalness={0.5} roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.05, 0.52]}>
          <planeGeometry args={[1.8, 1.15]} />
          <meshStandardMaterial color="#5a2a0d" emissive={COL.hot} emissiveIntensity={1.1} />
        </mesh>
        <mesh position={[-0.35, 0.05, 0.54]}>
          <planeGeometry args={[0.9, 0.34]} />
          <meshStandardMaterial color="#ffe08a" emissive={COL.accent} emissiveIntensity={1.4} />
        </mesh>
        <mesh position={[0.35, 0.05, 0.54]}>
          <planeGeometry args={[0.9, 0.34]} />
          <meshStandardMaterial color="#ffe08a" emissive={COL.accent} emissiveIntensity={1.4} />
        </mesh>
      </group>
      <mesh position={[0, -0.72, 0.35]}>
        <boxGeometry args={[2.3, 0.06, 1.5]} />
        <meshStandardMaterial color={COL.machineLight} metalness={0.4} roughness={0.6} />
      </mesh>
      <Sheet w={1.4} d={0.85} y={-0.66} z={0.85} color={COL.wafer} waffle />
      <mesh position={[0.9, 0.85, -0.4]}>
        <sphereGeometry args={[0.12, 12, 12]} />
        <meshStandardMaterial color={COL.hot} emissive={COL.hot} emissiveIntensity={0.8} />
      </mesh>
      <mesh position={[-0.7, 0.95, -0.5]}>
        <sphereGeometry args={[0.09, 12, 12]} />
        <meshStandardMaterial color={COL.hot} emissive={COL.hot} emissiveIntensity={0.8} />
      </mesh>
    </>
  )
}

/* fresh air: a single wafer sheet resting on the open lane */
function SceneAir() {
  return (
    <>
      <mesh position={[0, -0.6, 0]}>
        <boxGeometry args={[2.4, 0.1, 1.5]} />
        <meshStandardMaterial color={COL.machineLight} metalness={0.35} roughness={0.6} />
      </mesh>
      <mesh position={[0, -0.52, 0]}>
        <boxGeometry args={[2.2, 0.035, 1.4]} />
        <meshStandardMaterial color="#23262e" roughness={0.95} />
      </mesh>
      <Sheet w={1.5} d={1.0} y={0.05} color={COL.wafer} waffle />
      <Drift count={8} seed={3} />
    </>
  )
}

function SceneFillPrep() {
  return (
    <>
      <Tank x={-0.75} />
      <group position={[-0.75, 1.35, 0]}>
        <mesh>
          <cylinderGeometry args={[0.26, 0.05, 0.4, 20]} />
          <meshStandardMaterial color={COL.metal} metalness={0.6} roughness={0.35} />
        </mesh>
        <mesh position={[0, 0.28, 0]}>
          <sphereGeometry args={[0.13, 14, 14]} />
          <meshStandardMaterial color={COL.cream} roughness={0.8} />
        </mesh>
      </group>
      <Sieve y={0.8} />
      <Tank x={0.75} />
      <mesh position={[0, -0.45, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 0.1, 20]} />
        <meshStandardMaterial color={COL.hazelnut} roughness={0.5} />
      </mesh>
    </>
  )
}

/* filling lanes: one lane with a single wafer sheet, filling drips onto it */
function SceneFillLanes() {
  return (
    <>
      <mesh position={[0, -0.55, 0]}>
        <boxGeometry args={[2.2, 0.07, 0.6]} />
        <meshStandardMaterial color={COL.machineLight} metalness={0.4} roughness={0.6} />
      </mesh>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[2.2, 0.07, 0.6]} />
        <meshStandardMaterial color={COL.machineLight} metalness={0.4} roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.55, 0]}>
        <boxGeometry args={[2.2, 0.07, 0.6]} />
        <meshStandardMaterial color={COL.machineLight} metalness={0.4} roughness={0.6} />
      </mesh>
      <Sheet w={2.05} d={0.5} y={-0.485} color={COL.wafer} waffle />
      <Sheet w={2.05} d={0.5} y={0.615} color={COL.wafer} waffle />
      <Sheet w={2.05} d={0.5} y={0.065} color={COL.wafer} waffle />
      <Sheet w={1.9} d={0.44} t={0.03} y={0.11} color={COL.cream} />
      <Nozzle x={0} z={0} />
      <Drip x={0} z={0} />
    </>
  )
}

function SceneCompress() {
  return (
    <>
      <mesh position={[0, -0.55, 0]}>
        <boxGeometry args={[1.9, 0.14, 1.0]} />
        <meshStandardMaterial color={COL.machine} metalness={0.5} roughness={0.5} />
      </mesh>
      <Sheet w={1.75} d={0.9} y={-0.08} color={COL.wafer} waffle />
      <Sheet w={1.7} d={0.86} y={0.03} color={COL.cream} />
      <Sheet w={1.75} d={0.9} y={0.14} color={COL.wafer} waffle />
      <mesh position={[0, 0.78, 0]}>
        <boxGeometry args={[1.9, 0.14, 1.0]} />
        <meshStandardMaterial color={COL.machine} metalness={0.5} roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.9, 0]}>
        <cylinderGeometry args={[0.09, 0.09, 0.9, 12]} />
        <meshStandardMaterial color={COL.metal} metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[0, 1.35, 0]}>
        <cylinderGeometry args={[0.16, 0.16, 0.12, 18]} />
        <meshStandardMaterial color={COL.accent} metalness={0.4} roughness={0.3} />
      </mesh>
    </>
  )
}

function SceneCool() {
  return (
    <>
      <group position={[0, 0.2, -0.35]}>
        <mesh>
          <boxGeometry args={[1.9, 1.05, 1.1]} />
          <meshStandardMaterial color={COL.machine} metalness={0.4} roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.05, 0.57]}>
          <planeGeometry args={[1.7, 0.85]} />
          <meshStandardMaterial color={COL.cool} emissive={COL.cool} emissiveIntensity={0.5} transparent opacity={0.35} />
        </mesh>
      </group>
      <Sheet w={1.5} d={0.8} y={0.02} color={COL.wafer} waffle />
      <Sheet w={1.45} d={0.76} y={0.13} color={COL.cream} />
      <Sheet w={1.5} d={0.8} y={0.24} color={COL.wafer} waffle />
      <mesh position={[-1.1, 0.8, 0.3]}>
        <icosahedronGeometry args={[0.16, 0]} />
        <meshStandardMaterial color={COL.cool} emissive={COL.cool} emissiveIntensity={0.5} flatShading />
      </mesh>
      <mesh position={[1.05, 0.65, -0.2]}>
        <icosahedronGeometry args={[0.12, 0]} />
        <meshStandardMaterial color={COL.cool} emissive={COL.cool} emissiveIntensity={0.5} flatShading />
      </mesh>
      <mesh position={[0.6, 1.1, 0.4]}>
        <icosahedronGeometry args={[0.1, 0]} />
        <meshStandardMaterial color={COL.cool} emissive={COL.cool} emissiveIntensity={0.5} flatShading />
      </mesh>
    </>
  )
}

function SceneDivide() {
  return (
    <>
      <mesh position={[0, -0.24, 0]}>
        <boxGeometry args={[2.3, 0.07, 2.1]} />
        <meshStandardMaterial color={COL.machineLight} metalness={0.4} roughness={0.6} />
      </mesh>
      <Sheet w={1.9} d={0.9} y={0.29} z={-0.95} color={COL.wafer} waffle />
      <Sheet w={1.86} d={0.86} t={0.05} y={0.38} z={-0.95} color={COL.cream} />
      <Sheet w={1.9} d={0.9} y={0.47} z={-0.95} color={COL.wafer} waffle />
      <mesh position={[0, 0.75, -0.1]} rotation={[0.5, 0, 0]}>
        <boxGeometry args={[2.0, 0.05, 0.16]} />
        <meshStandardMaterial color={COL.metal} metalness={0.8} roughness={0.2} />
      </mesh>
      <Finger x={0} y={0.14} z={0.05} />
      <Finger x={0} y={0.14} z={0.32} />
      <Finger x={0} y={0.14} z={0.59} />
      <group position={[0, 0.05, 1.15]}>
        <mesh>
          <torusGeometry args={[1.0, 0.09, 14, 40]} />
          <meshStandardMaterial color={COL.metal} metalness={0.7} roughness={0.3} />
        </mesh>
        <mesh>
          <torusGeometry args={[0.82, 0.04, 12, 40]} />
          <meshStandardMaterial color={COL.accent} emissive={COL.accent} emissiveIntensity={0.7} />
        </mesh>
      </group>
    </>
  )
}

function ScenePack() {
  return (
    <>
      <mesh position={[0, -0.42, 0]}>
        <boxGeometry args={[2.4, 0.07, 1.4]} />
        <meshStandardMaterial color={COL.machineLight} metalness={0.4} roughness={0.6} />
      </mesh>
      <group position={[0.95, -0.05, 0]}>
        <mesh position={[0, -0.12, 0]}>
          <boxGeometry args={[0.7, 0.08, 0.6]} />
          <meshStandardMaterial color={COL.machineLight} />
        </mesh>
        <mesh position={[0, 0.08, -0.32]}>
          <boxGeometry args={[0.7, 0.42, 0.05]} />
          <meshStandardMaterial color={COL.accent} flatShading />
        </mesh>
        <mesh position={[0, 0.08, 0.32]}>
          <boxGeometry args={[0.7, 0.42, 0.05]} />
          <meshStandardMaterial color={COL.accent} flatShading />
        </mesh>
        <mesh position={[-0.36, 0.08, 0]}>
          <boxGeometry args={[0.05, 0.42, 0.6]} />
          <meshStandardMaterial color={COL.accent} flatShading />
        </mesh>
        <mesh position={[0.36, 0.08, 0]}>
          <boxGeometry args={[0.05, 0.42, 0.6]} />
          <meshStandardMaterial color={COL.accent} flatShading />
        </mesh>
      </group>
      <Finger x={0.5} y={0.0} z={0.45} />
      <Finger x={0.5} y={0.1} z={0.45} />
      <mesh position={[-0.75, 0.12, -0.35]} rotation={[0, 0.4, 0]}>
        <planeGeometry args={[0.42, 0.34]} />
        <meshStandardMaterial color="#fff6e0" flatShading />
      </mesh>
      <mesh position={[-0.75, 0.12, -0.2]} rotation={[0, 0.4, 0]}>
        <boxGeometry args={[0.05, 0.05, 0.05]} />
        <meshStandardMaterial color={COL.machine} />
      </mesh>
    </>
  )
}

export function SceneFor({ scene }: { scene: StageScene }) {
  switch (scene) {
    case 'raw':
      return <SceneRaw />
    case 'baking':
      return <SceneBaking />
    case 'air':
      return <SceneAir />
    case 'fill-prep':
      return <SceneFillPrep />
    case 'fill-lanes':
      return <SceneFillLanes />
    case 'compress':
      return <SceneCompress />
    case 'cool':
      return <SceneCool />
    case 'divide':
      return <SceneDivide />
    case 'pack':
      return <ScenePack />
  }
}

export function StageIllustration({ stage, animate }: { stage: Stage; animate: boolean }) {
  return (
    <Canvas
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
      camera={{ position: [0, 1.35, 4.7], fov: 40 }}
      frameloop={animate ? 'always' : 'demand'}
      style={{ width: '100%', height: '100%' }}
    >
      <ambientLight intensity={0.8} />
      <directionalLight position={[3, 5, 4]} intensity={1.4} />
      <directionalLight position={[-3, 2, -3]} intensity={0.5} color="#ffddc2" />
      <pointLight position={[-2, 2, 2]} intensity={6} color="#ffddc2" />
      <Controls animate={animate} />
      <Rotator animate={animate} bob={stage.scene === 'air' ? 0.06 : 0}>
        <Suspense fallback={null}>
          <SceneFor scene={stage.scene} />
        </Suspense>
      </Rotator>
    </Canvas>
  )
}

export default StageIllustration
