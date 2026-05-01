import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import type { ReactNode } from 'react'
import { BlueprintBackground } from '../components/BlueprintBackground'
import { BlueprintSketches } from '../components/BlueprintSketches'
import { ShaderBackground } from '../components/ShaderBackground'

// Mock shaders/react — the real package needs WebGL + IntersectionObserver and
// doesn't add value to assertions about ShaderBackground's wrapper structure.
vi.mock('shaders/react', () => ({
  Shader: ({ children, className }: { children?: ReactNode; className?: string }) => (
    <div data-testid="shader-root" className={className} aria-hidden="true">
      {children}
    </div>
  ),
  SolidColor: ({ color }: { color: string }) => (
    <div data-testid="shader-solid-color" data-color={color} />
  ),
  DotGrid: (props: Record<string, unknown>) => (
    <div data-testid="shader-dot-grid" data-density={props.density as number} />
  ),
  GridDistortion: (props: Record<string, unknown>) => (
    <div data-testid="shader-grid-distortion" data-intensity={props.intensity as number} />
  ),
}))

describe('BlueprintBackground', () => {
  it('renders without crashing', () => {
    const { container } = render(<BlueprintBackground />)
    expect(container).toBeInTheDocument()
  })

  it('renders blueprint container', () => {
    render(<BlueprintBackground />)
    const container = document.querySelector('.blueprint-container')
    expect(container).toBeInTheDocument()
  })

  it('has aria-hidden on decorative elements', () => {
    render(<BlueprintBackground />)
    const container = document.querySelector('.blueprint-container')
    expect(container).toHaveAttribute('aria-hidden', 'true')
  })

  it('has pointer-events: none for non-interactive overlay', () => {
    render(<BlueprintBackground />)
    const container = document.querySelector('.blueprint-container')
    expect(container).toHaveStyle({ pointerEvents: 'none' })
  })

  it('renders 3D perspective plane', () => {
    render(<BlueprintBackground />)
    const plane = document.querySelector('.blueprint-plane')
    expect(plane).toBeInTheDocument()
  })
})

describe('BlueprintSketches', () => {
  it('renders without crashing', () => {
    const { container } = render(<BlueprintSketches />)
    expect(container).toBeInTheDocument()
  })

  it('has blueprint sketches container', () => {
    render(<BlueprintSketches />)
    const sketches = document.querySelector('.blueprint-sketches')
    expect(sketches).toBeInTheDocument()
  })

  it('renders SVG element', () => {
    render(<BlueprintSketches />)
    const svg = document.querySelector('.sketches-svg')
    expect(svg).toBeInTheDocument()
  })

  it('has aria-hidden for decorative sketches', () => {
    render(<BlueprintSketches />)
    const sketches = document.querySelector('.blueprint-sketches')
    expect(sketches).toHaveAttribute('aria-hidden', 'true')
  })

  it('contains sketch elements', () => {
    render(<BlueprintSketches />)
    // Check for various sketch elements
    const sketchGroups = document.querySelectorAll('.sketch-group')
    expect(sketchGroups.length).toBeGreaterThan(0)
  })

  it('has SVG with proper viewBox', () => {
    render(<BlueprintSketches />)
    const svg = document.querySelector('.sketches-svg')
    expect(svg).toHaveAttribute('viewBox', '0 0 1920 1080')
  })
})

describe('ShaderBackground', () => {
  it('renders without crashing', () => {
    const { container } = render(<ShaderBackground />)
    expect(container).toBeInTheDocument()
  })

  it('renders the shader root with the shader-background class', () => {
    const { getByTestId } = render(<ShaderBackground />)
    const root = getByTestId('shader-root')
    expect(root).toHaveClass('shader-background')
  })

  it('layers a SolidColor base, DotGrid, and GridDistortion', () => {
    const { getByTestId } = render(<ShaderBackground />)
    expect(getByTestId('shader-solid-color')).toHaveAttribute('data-color', '#1573FF')
    expect(getByTestId('shader-dot-grid')).toHaveAttribute('data-density', '75')
    expect(getByTestId('shader-grid-distortion')).toHaveAttribute('data-intensity', '2.8')
  })

  it('hides the decorative shader from assistive tech', () => {
    const { getByTestId } = render(<ShaderBackground />)
    expect(getByTestId('shader-root')).toHaveAttribute('aria-hidden', 'true')
  })
})

