import React from 'react'
import { vi } from 'vitest'

// Mock Float component from @react-three/drei
export const Float = ({ children }: { children: React.ReactNode }) => (
  <group>{children}</group>
)

// Mock other drei components as needed
export const OrbitControls = vi.fn(() => null)
export const Html = ({ children }: { children: React.ReactNode }) => <div>{children}</div>
export const Text = vi.fn(() => null)

