import { useEffect, useRef } from 'react'
import { useThree } from '@react-three/fiber'

export function AutoPause({ mode = 'always' }: { mode?: 'always' | 'demand' }) {
  const { gl, invalidate, setFrameloop } = useThree()
  const modeRef = useRef(mode)
  modeRef.current = mode

  useEffect(() => {
    const canvas = gl.domElement
    let active = true

    const resume = () => {
      if (!active) return
      setFrameloop(modeRef.current)
      invalidate()
    }
    const pause = () => {
      if (!active) return
      setFrameloop('never')
    }

    const onContextLost = (e: Event) => e.preventDefault()
    const onContextRestore = () => resume()

    canvas.addEventListener('webglcontextlost', onContextLost)
    canvas.addEventListener('webglcontextrestored', onContextRestore)

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) resume()
          else pause()
        }
      },
      { rootMargin: '120px' },
    )
    io.observe(canvas)
    resume()

    return () => {
      active = false
      io.disconnect()
      canvas.removeEventListener('webglcontextlost', onContextLost)
      canvas.removeEventListener('webglcontextrestored', onContextRestore)
    }
  }, [gl, invalidate, setFrameloop])

  return null
}
