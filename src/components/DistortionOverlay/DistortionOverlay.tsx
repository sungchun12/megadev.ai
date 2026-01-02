import { useDistortionStateOptional } from '../DistortionDial/useDistortionState'
import './DistortionOverlay.css'

export function DistortionOverlay() {
  const context = useDistortionStateOptional()
  const distortion = context?.distortion ?? 0

  // Don't render if no distortion
  if (distortion < 0.001) return null

  // Calculate CSS values based on distortion
  const blurAmount = distortion * 8 // Max 8px blur
  const displacementScale = distortion * 30 // SVG displacement scale
  const turbulenceFrequency = 0.02 + distortion * 0.02 // Frequency increases with distortion

  return (
    <>
      {/* SVG filter definition */}
      <svg className="distortion-filter-svg" aria-hidden="true">
        <defs>
          <filter id="bubbles-displacement" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence
              type="turbulence"
              baseFrequency={turbulenceFrequency}
              numOctaves={3}
              seed={42}
              result="turbulence"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="turbulence"
              scale={displacementScale}
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>

      {/* Overlay element */}
      <div
        className="distortion-overlay"
        style={{
          '--blur-amount': `${blurAmount}px`,
          '--distortion-opacity': distortion * 0.3,
        } as React.CSSProperties}
        aria-hidden="true"
      />
    </>
  )
}
