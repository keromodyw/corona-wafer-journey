import { COL, getWaffleTexture } from './theme'

export function Sheet({
  w,
  d,
  t = 0.06,
  color,
  y = 0,
  z = 0,
  waffle = false,
}: {
  w: number
  d: number
  t?: number
  color: string
  y?: number
  z?: number
  waffle?: boolean
}) {
  return (
    <mesh position={[0, y, z]}>
      <boxGeometry args={[w, t, d]} />
      <meshStandardMaterial
        map={waffle ? getWaffleTexture() : undefined}
        color={waffle ? '#ffffff' : color}
        roughness={waffle ? 0.65 : 0.85}
      />
    </mesh>
  )
}

/* wafer finger: wafer below + cream filling + wafer above */
export function Finger({ x, y, z }: { x: number; y: number; z: number }) {
  return (
    <group position={[x, y, z]}>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.72, 0.06, 0.18]} />
        <meshStandardMaterial map={getWaffleTexture()} color="#ffffff" roughness={0.65} />
      </mesh>
      <mesh position={[0, 0.075, 0]}>
        <boxGeometry args={[0.68, 0.045, 0.16]} />
        <meshStandardMaterial color={COL.cream} roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.15, 0]}>
        <boxGeometry args={[0.72, 0.06, 0.18]} />
        <meshStandardMaterial map={getWaffleTexture()} color="#ffffff" roughness={0.65} />
      </mesh>
    </group>
  )
}
