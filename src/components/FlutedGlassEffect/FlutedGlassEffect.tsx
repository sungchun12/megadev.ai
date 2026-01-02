import { forwardRef, useMemo, useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import { BubblesGlassEffect } from './flutedGlassShader'

interface FlutedGlassEffectProps {
  distortion?: number
}

export const FlutedGlassEffect = forwardRef<BubblesGlassEffect, FlutedGlassEffectProps>(
  function FlutedGlassEffect({ distortion = 0 }, ref) {
    const { size } = useThree()

    const effect = useMemo(() => new BubblesGlassEffect(), [])

    // Update distortion value
    useEffect(() => {
      effect.distortionValue = distortion
    }, [effect, distortion])

    // Update resolution on size change
    useEffect(() => {
      effect.setResolution(size.width, size.height)
    }, [effect, size])

    // Forward ref
    useEffect(() => {
      if (typeof ref === 'function') {
        ref(effect)
      } else if (ref) {
        ref.current = effect
      }
    }, [effect, ref])

    return <primitive object={effect} />
  }
)
