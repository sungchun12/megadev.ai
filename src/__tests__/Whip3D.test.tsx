import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { Whip3D } from '../components/Whip3D'

// Mock @react-three/fiber
vi.mock('@react-three/fiber', () => ({
  Canvas: ({ children, style, ...props }: { children: React.ReactNode; style?: React.CSSProperties }) => (
    <div data-testid="three-canvas" style={style} {...props}>
      {children}
    </div>
  ),
  useFrame: vi.fn((callback) => {
    // Don't actually call the callback in tests
  }),
}))

// Mock @react-three/drei
vi.mock('@react-three/drei', () => ({
  Float: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

// Mock THREE.js with proper classes
vi.mock('three', () => {
  class Color {
    r = 0; g = 0; b = 0
    constructor() {}
    set = vi.fn().mockReturnThis()
  }
  class Vector3 {
    x = 0; y = 0; z = 0
    constructor() {}
    set = vi.fn().mockReturnThis()
    copy = vi.fn().mockReturnThis()
  }
  class Shape {
    constructor() {}
    moveTo = vi.fn()
    lineTo = vi.fn()
    closePath = vi.fn()
  }
  class ExtrudeGeometry {
    constructor() {}
  }
  class ShaderMaterial {
    uniforms = { time: { value: 0 }, color: { value: new Color() }, intensity: { value: 1 } }
    constructor() {}
  }
  return {
    Color,
    Vector3,
    Shape,
    ExtrudeGeometry,
    ShaderMaterial,
    DoubleSide: 2,
    AdditiveBlending: 2,
  }
})

describe('Whip3D', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Container Rendering', () => {
    it('renders container element', () => {
      render(<Whip3D />)
      const container = document.querySelector('.whip-3d-container')
      expect(container).toBeInTheDocument()
    })

    it('has correct initial class', () => {
      render(<Whip3D />)
      const container = document.querySelector('.whip-3d-container')
      expect(container).toHaveClass('whip-3d-container')
      expect(container).not.toHaveClass('whipping')
    })

    it('renders Three.js Canvas', () => {
      render(<Whip3D />)
      expect(screen.getByTestId('three-canvas')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('has aria-label for interaction hint', () => {
      render(<Whip3D />)
      const container = document.querySelector('.whip-3d-container')
      expect(container).toHaveAttribute('aria-label', 'Hold and drag to whip')
    })
  })

  describe('Pointer Interactions', () => {
    it('adds whipping class on pointer down', () => {
      render(<Whip3D />)
      const container = document.querySelector('.whip-3d-container')!
      
      act(() => {
        fireEvent.pointerDown(container, { 
          pageX: 100, 
          pageY: 100,
          pointerId: 1,
        })
      })
      
      expect(container).toHaveClass('whipping')
    })

    it('removes whipping class on pointer up', async () => {
      render(<Whip3D />)
      const container = document.querySelector('.whip-3d-container')!
      
      act(() => {
        fireEvent.pointerDown(container, { 
          pageX: 100, 
          pageY: 100,
          pointerId: 1,
        })
      })
      
      expect(container).toHaveClass('whipping')
      
      act(() => {
        fireEvent.pointerUp(window)
      })
      
      expect(container).not.toHaveClass('whipping')
    })

    it('shows hint when whipping', () => {
      render(<Whip3D />)
      const container = document.querySelector('.whip-3d-container')!
      
      // Before interaction, no hint
      expect(screen.queryByText('Release to let go')).not.toBeInTheDocument()
      
      act(() => {
        fireEvent.pointerDown(container, { 
          pageX: 100, 
          pageY: 100,
          pointerId: 1,
        })
      })
      
      // Hint appears while whipping
      expect(screen.getByText('Release to let go')).toBeInTheDocument()
    })

    it('hides hint when not whipping', () => {
      render(<Whip3D />)
      const container = document.querySelector('.whip-3d-container')!
      
      act(() => {
        fireEvent.pointerDown(container, { 
          pageX: 100, 
          pageY: 100,
          pointerId: 1,
        })
      })
      
      act(() => {
        fireEvent.pointerUp(window)
      })
      
      expect(screen.queryByText('Release to let go')).not.toBeInTheDocument()
    })
  })

  describe('Keyboard Interactions', () => {
    it('cancels drag on Escape key', () => {
      render(<Whip3D />)
      const container = document.querySelector('.whip-3d-container')!
      
      act(() => {
        fireEvent.pointerDown(container, { 
          pageX: 100, 
          pageY: 100,
          pointerId: 1,
        })
      })
      
      expect(container).toHaveClass('whipping')
      
      act(() => {
        fireEvent.keyDown(window, { key: 'Escape' })
      })
      
      expect(container).not.toHaveClass('whipping')
    })

    it('does not respond to other keys while dragging', () => {
      render(<Whip3D />)
      const container = document.querySelector('.whip-3d-container')!
      
      act(() => {
        fireEvent.pointerDown(container, { 
          pageX: 100, 
          pageY: 100,
          pointerId: 1,
        })
      })
      
      act(() => {
        fireEvent.keyDown(window, { key: 'Enter' })
      })
      
      // Should still be whipping
      expect(container).toHaveClass('whipping')
    })
  })

  describe('Canvas Configuration', () => {
    it('renders Canvas with transparent background', () => {
      render(<Whip3D />)
      const canvas = screen.getByTestId('three-canvas')
      expect(canvas).toHaveStyle({ background: 'transparent' })
    })

    it('renders Canvas with proper styling', () => {
      render(<Whip3D />)
      const canvas = screen.getByTestId('three-canvas')
      // Check that the canvas has styling applied
      expect(canvas).toHaveAttribute('style')
      // Verify background transparency is set
      expect(canvas.getAttribute('style')).toContain('transparent')
    })
  })
})

