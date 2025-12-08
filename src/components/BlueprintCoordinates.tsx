import { useState, useEffect } from 'react'
import './BlueprintCoordinates.css'

export function BlueprintCoordinates() {
  const [coords, setCoords] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Normalize coordinates to 0-1 range based on viewport
      const x = e.clientX / window.innerWidth
      const y = e.clientY / window.innerHeight
      setCoords({ x, y })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

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
