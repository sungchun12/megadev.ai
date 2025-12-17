import './BlueprintBackground.css'

export function BlueprintBackground() {
  return (
    <div className="blueprint-container" aria-hidden="true">
      {/* Base color layer */}
      <div className="blueprint-base" />

      {/* 3D perspective grid plane */}
      <div className="blueprint-perspective">
        <div className="blueprint-plane" />
      </div>
    </div>
  )
}

