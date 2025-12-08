export function BlueprintBackground() {
  return (
    <div 
      className="blueprint-bg"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: -2,
        pointerEvents: 'none',
      }}
      aria-hidden="true"
    />
  )
}

