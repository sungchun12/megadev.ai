import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

interface DistortionContextType {
  distortion: number
  setDistortion: (value: number) => void
  isEnabled: boolean
}

const DistortionContext = createContext<DistortionContextType | null>(null)

export function DistortionProvider({ children }: { children: ReactNode }) {
  const [distortion, setDistortionValue] = useState(0)

  const setDistortion = useCallback((value: number) => {
    // Clamp value between 0 and 1
    const clampedValue = Math.max(0, Math.min(1, value))
    setDistortionValue(clampedValue)
  }, [])

  const isEnabled = distortion > 0

  return (
    <DistortionContext.Provider value={{ distortion, setDistortion, isEnabled }}>
      {children}
    </DistortionContext.Provider>
  )
}

export function useDistortionState() {
  const context = useContext(DistortionContext)
  if (!context) {
    throw new Error('useDistortionState must be used within a DistortionProvider')
  }
  return context
}

// Optional hook for components that may be outside the provider
export function useDistortionStateOptional() {
  return useContext(DistortionContext)
}
