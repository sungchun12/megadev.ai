import React from 'react'
import { vi } from 'vitest'

// Mock Canvas component - WebGL not available in jsdom
export const Canvas = ({ children }: { children: React.ReactNode }) => (
  <div data-testid="three-canvas-mock">{children}</div>
)

// Mock useFrame hook
export const useFrame = vi.fn()

// Mock useThree hook
export const useThree = vi.fn(() => ({
  gl: {},
  scene: {},
  camera: {},
  size: { width: 800, height: 600 },
  viewport: { width: 800, height: 600 },
}))

// Mock extend
export const extend = vi.fn()

