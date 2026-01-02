import { useRef, useCallback, useEffect, useState } from 'react'
import { useDistortionState } from './useDistortionState'
import './DistortionDial.css'

const TICK_COUNT = 11 // 0.00 to 1.00 in 0.10 increments

export function DistortionDial() {
  const { distortion, setDistortion } = useDistortionState()
  const dialRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Check for mobile on mount
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Calculate distortion value from Y position
  const calculateDistortionFromY = useCallback((clientY: number) => {
    if (!dialRef.current) return
    const rect = dialRef.current.getBoundingClientRect()
    const relativeY = clientY - rect.top
    const normalizedY = Math.max(0, Math.min(1, relativeY / rect.height))
    // Invert so top = 1, bottom = 0
    setDistortion(1 - normalizedY)
  }, [setDistortion])

  // Mouse handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)
    calculateDistortionFromY(e.clientY)
  }, [calculateDistortionFromY])

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return
    calculateDistortionFromY(e.clientY)
  }, [isDragging, calculateDistortionFromY])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  // Touch handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault()
    setIsDragging(true)
    if (e.touches[0]) {
      calculateDistortionFromY(e.touches[0].clientY)
    }
  }, [calculateDistortionFromY])

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDragging || !e.touches[0]) return
    calculateDistortionFromY(e.touches[0].clientY)
  }, [isDragging, calculateDistortionFromY])

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false)
  }, [])

  // Keyboard handlers
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const step = e.shiftKey ? 0.1 : 0.01
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      setDistortion(Math.min(1, distortion + step))
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setDistortion(Math.max(0, distortion - step))
    } else if (e.key === 'Home') {
      e.preventDefault()
      setDistortion(1)
    } else if (e.key === 'End') {
      e.preventDefault()
      setDistortion(0)
    }
  }, [distortion, setDistortion])

  // Global event listeners for dragging
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
      window.addEventListener('touchmove', handleTouchMove)
      window.addEventListener('touchend', handleTouchEnd)
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('touchend', handleTouchEnd)
    }
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd])

  // Don't render on mobile
  if (isMobile) return null

  // Generate tick marks
  const ticks = Array.from({ length: TICK_COUNT }, (_, i) => {
    const value = i / (TICK_COUNT - 1)
    const isMajor = i % 5 === 0 || i === TICK_COUNT - 1
    return { value, isMajor, label: value.toFixed(2) }
  }).reverse() // Reverse so 1.00 is at top

  const thumbPosition = (1 - distortion) * 100

  return (
    <div
      className={`distortion-dial ${isDragging ? 'dragging' : ''}`}
      role="slider"
      aria-label="Glass distortion intensity"
      aria-valuemin={0}
      aria-valuemax={1}
      aria-valuenow={distortion}
      aria-valuetext={`${(distortion * 100).toFixed(0)}% distortion`}
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <div className="dial-label">DISTORT</div>
      <div
        ref={dialRef}
        className="dial-track"
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        <div className="dial-ticks">
          {ticks.map(({ value, isMajor, label }) => (
            <div
              key={value}
              className={`dial-tick ${isMajor ? 'major' : ''}`}
              style={{ top: `${(1 - value) * 100}%` }}
            >
              <span className="tick-line" />
              {isMajor && <span className="tick-label">{label}</span>}
            </div>
          ))}
        </div>
        <div
          className="dial-thumb"
          style={{ top: `${thumbPosition}%` }}
        />
        <div
          className="dial-fill"
          style={{ height: `${(1 - thumbPosition / 100) * 100}%` }}
        />
      </div>
      <div className="dial-value">{distortion.toFixed(2)}</div>
    </div>
  )
}
