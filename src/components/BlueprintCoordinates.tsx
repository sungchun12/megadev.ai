import { useState, useEffect, useRef, useCallback } from 'react'
import './BlueprintCoordinates.css'

export function BlueprintCoordinates() {
  const [coords, setCoords] = useState({ x: 0, y: 0 })
  const lastUpdateTime = useRef(0)
  const rafId = useRef<number | null>(null)
  const pendingCoords = useRef({ x: 0, y: 0 })

  // Throttled update function - updates at most every 100ms
  const throttledUpdate = useCallback(() => {
    const now = performance.now()
    if (now - lastUpdateTime.current >= 100) {
      setCoords(pendingCoords.current)
      lastUpdateTime.current = now
    }
    rafId.current = null
  }, [])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Store pending coordinates
      pendingCoords.current = {
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      }
      
      // Schedule throttled update if not already scheduled
      if (rafId.current === null) {
        rafId.current = requestAnimationFrame(throttledUpdate)
      }
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      if (rafId.current !== null) {
        cancelAnimationFrame(rafId.current)
      }
    }
  }, [throttledUpdate])

  return (
    <div className="coordinates" aria-hidden="true">
      <span className="coordinates-item coordinates-top-left">
        x: {coords.x.toFixed(4)} y: {coords.y.toFixed(4)}
      </span>
      <span className="coordinates-item coordinates-bottom-right">
        megadev.ai v1.0.0
      </span>
    </div>
  )
}
