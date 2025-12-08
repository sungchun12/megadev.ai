import './BlueprintBackground.css'

export function BlueprintBackground() {
  return (
    <>
      {/* Base blueprint grid */}
      <div 
        className="blueprint-bg"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: -3,
          pointerEvents: 'none',
        }}
        aria-hidden="true"
      />
      
      {/* Liquid glass overlay - subtle Apple-style effect */}
      <div 
        className="liquid-glass-layer"
        aria-hidden="true"
      />
    </>
  )
}

