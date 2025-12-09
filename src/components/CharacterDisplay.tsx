import { lazy, Suspense } from 'react'
import './CharacterDisplay.css'

// Lazy load Whip3D to defer ~300KB Three.js bundle
const Whip3D = lazy(() => import('./Whip3D').then(module => ({ default: module.Whip3D })))

// Loading placeholder that matches the visual space
function LoadingPlaceholder() {
  return (
    <div className="whip-loading-placeholder" aria-label="Loading 3D animation">
      <div className="whip-loading-spinner" />
    </div>
  )
}

export function CharacterDisplay() {
  return (
    <div className="character-display">
      <Suspense fallback={<LoadingPlaceholder />}>
        <Whip3D />
      </Suspense>
    </div>
  )
}
