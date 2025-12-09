import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BlueprintBackground } from '../components/BlueprintBackground'
import { BlueprintCoordinates } from '../components/BlueprintCoordinates'
import { BlueprintSketches } from '../components/BlueprintSketches'
import { ShaderBackground } from '../components/ShaderBackground'

// Mock WebGL context for ShaderBackground
const mockWebGLContext = {
  createShader: vi.fn(() => ({})),
  shaderSource: vi.fn(),
  compileShader: vi.fn(),
  getShaderParameter: vi.fn(() => true),
  getShaderInfoLog: vi.fn(() => ''),
  createProgram: vi.fn(() => ({})),
  attachShader: vi.fn(),
  linkProgram: vi.fn(),
  getProgramParameter: vi.fn(() => true),
  getProgramInfoLog: vi.fn(() => ''),
  createBuffer: vi.fn(() => ({})),
  bindBuffer: vi.fn(),
  bufferData: vi.fn(),
  getAttribLocation: vi.fn(() => 0),
  getUniformLocation: vi.fn(() => ({})),
  viewport: vi.fn(),
  clearColor: vi.fn(),
  clear: vi.fn(),
  useProgram: vi.fn(),
  enable: vi.fn(),
  blendFunc: vi.fn(),
  uniform2f: vi.fn(),
  uniform1f: vi.fn(),
  enableVertexAttribArray: vi.fn(),
  vertexAttribPointer: vi.fn(),
  drawArrays: vi.fn(),
  deleteProgram: vi.fn(),
  deleteShader: vi.fn(),
  deleteBuffer: vi.fn(),
  getExtension: vi.fn(),
  VERTEX_SHADER: 35633,
  FRAGMENT_SHADER: 35632,
  COMPILE_STATUS: 35713,
  LINK_STATUS: 35714,
  ARRAY_BUFFER: 34962,
  STATIC_DRAW: 35044,
  FLOAT: 5126,
  TRIANGLES: 4,
  COLOR_BUFFER_BIT: 16384,
  BLEND: 3042,
  SRC_ALPHA: 770,
  ONE_MINUS_SRC_ALPHA: 771,
}

beforeEach(() => {
  // Mock canvas getContext for WebGL
  HTMLCanvasElement.prototype.getContext = vi.fn((type) => {
    if (type === 'webgl') {
      return mockWebGLContext as unknown as WebGLRenderingContext
    }
    return null
  })
})

describe('BlueprintBackground', () => {
  it('renders without crashing', () => {
    const { container } = render(<BlueprintBackground />)
    expect(container).toBeInTheDocument()
  })

  it('renders blueprint background layer', () => {
    render(<BlueprintBackground />)
    const bgLayer = document.querySelector('.blueprint-bg')
    expect(bgLayer).toBeInTheDocument()
  })

  it('renders liquid glass layer', () => {
    render(<BlueprintBackground />)
    const glassLayer = document.querySelector('.liquid-glass-layer')
    expect(glassLayer).toBeInTheDocument()
  })

  it('has aria-hidden on decorative elements', () => {
    render(<BlueprintBackground />)
    const bgLayer = document.querySelector('.blueprint-bg')
    const glassLayer = document.querySelector('.liquid-glass-layer')
    
    expect(bgLayer).toHaveAttribute('aria-hidden', 'true')
    expect(glassLayer).toHaveAttribute('aria-hidden', 'true')
  })

  it('has pointer-events: none for non-interactive overlay', () => {
    render(<BlueprintBackground />)
    const bgLayer = document.querySelector('.blueprint-bg')
    expect(bgLayer).toHaveStyle({ pointerEvents: 'none' })
  })
})

describe('BlueprintCoordinates', () => {
  it('renders without crashing', () => {
    const { container } = render(<BlueprintCoordinates />)
    expect(container).toBeInTheDocument()
  })

  it('has coordinates container', () => {
    render(<BlueprintCoordinates />)
    const coords = document.querySelector('.coordinates')
    expect(coords).toBeInTheDocument()
  })

  it('displays initial coordinates', () => {
    render(<BlueprintCoordinates />)
    expect(screen.getByText(/x:/)).toBeInTheDocument()
    expect(screen.getByText(/y:/)).toBeInTheDocument()
  })

  it('displays version info', () => {
    render(<BlueprintCoordinates />)
    expect(screen.getByText('megadev.ai v1.0.0')).toBeInTheDocument()
  })

  it('has aria-hidden for decorative display', () => {
    render(<BlueprintCoordinates />)
    const coords = document.querySelector('.coordinates')
    expect(coords).toHaveAttribute('aria-hidden', 'true')
  })

  it('has top-left and bottom-right coordinate items', () => {
    render(<BlueprintCoordinates />)
    const topLeft = document.querySelector('.coordinates-top-left')
    const bottomRight = document.querySelector('.coordinates-bottom-right')
    
    expect(topLeft).toBeInTheDocument()
    expect(bottomRight).toBeInTheDocument()
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

  it('renders canvas element', () => {
    render(<ShaderBackground />)
    const canvas = document.querySelector('canvas')
    expect(canvas).toBeInTheDocument()
  })

  it('has shader-background class', () => {
    render(<ShaderBackground />)
    const canvas = document.querySelector('.shader-background')
    expect(canvas).toBeInTheDocument()
  })

  it('has aria-hidden for decorative canvas', () => {
    render(<ShaderBackground />)
    const canvas = document.querySelector('canvas')
    expect(canvas).toHaveAttribute('aria-hidden', 'true')
  })

  it('initializes WebGL context', () => {
    render(<ShaderBackground />)
    expect(HTMLCanvasElement.prototype.getContext).toHaveBeenCalledWith(
      'webgl',
      expect.objectContaining({
        alpha: true,
        premultipliedAlpha: false,
      })
    )
  })
})

