import { useEffect, useRef } from 'react'
import './ShaderBackground.css'

// Vertex shader
const vertexShaderSource = `
  attribute vec2 a_position;
  varying vec2 v_uv;

  void main() {
    v_uv = a_position * 0.5 + 0.5;
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`

// Fragment shader - Solid background with dot grid
const fragmentShaderSource = `
  precision highp float;

  varying vec2 v_uv;
  uniform vec2 u_resolution;

  void main() {
    vec2 uv = v_uv;

    // Solid background color #1673FF
    vec3 bgColor = vec3(0.0, 0.388, 0.851);

    // === DOT GRID OVERLAY ===

    // Grid parameters
    float gridSize = 25.0; // Spacing between dots
    vec2 gridUV = uv * vec2(u_resolution.x / gridSize, u_resolution.y / gridSize);
    vec2 gridCell = fract(gridUV);

    // Distance from center of each cell
    float distToCenter = length(gridCell - 0.5);

    // Create small dots
    float dotRadius = 0.08;
    float dot = 1.0 - smoothstep(dotRadius - 0.02, dotRadius, distToCenter);

    // Dot color - subtle white/light blue
    vec3 dotColor = vec3(0.7, 0.8, 1.0);
    float dotOpacity = 0.3;

    // Combine background with dots
    vec3 finalColor = mix(bgColor, dotColor, dot * dotOpacity);

    gl_FragColor = vec4(finalColor, 1.0);
  }
`

function createShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
  const shader = gl.createShader(type)
  if (!shader) return null
  
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('Shader compile error:', gl.getShaderInfoLog(shader))
    gl.deleteShader(shader)
    return null
  }
  
  return shader
}

function createProgram(gl: WebGLRenderingContext, vertexShader: WebGLShader, fragmentShader: WebGLShader): WebGLProgram | null {
  const program = gl.createProgram()
  if (!program) return null
  
  gl.attachShader(program, vertexShader)
  gl.attachShader(program, fragmentShader)
  gl.linkProgram(program)
  
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('Program link error:', gl.getProgramInfoLog(program))
    gl.deleteProgram(program)
    return null
  }
  
  return program
}

// Check if device is mobile for lower DPR
function isMobileDevice(): boolean {
  return window.innerWidth < 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

export function ShaderBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const gl = canvas.getContext('webgl', {
      alpha: false,
      antialias: false,
      powerPreference: 'low-power'
    })
    if (!gl) {
      console.error('WebGL not supported')
      return
    }

    // Create shaders
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource)
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource)
    if (!vertexShader || !fragmentShader) return

    const program = createProgram(gl, vertexShader, fragmentShader)
    if (!program) return

    // Set up geometry (full-screen quad)
    const positionBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1, -1,  1, -1,  -1,  1,
      -1,  1,  1, -1,   1,  1,
    ]), gl.STATIC_DRAW)

    // Get locations
    const positionLocation = gl.getAttribLocation(program, 'a_position')
    const resolutionLocation = gl.getUniformLocation(program, 'u_resolution')

    // Handle resize - use 100vw/100vh to cover full viewport including scrollbar area
    const resize = () => {
      const maxDpr = isMobileDevice() ? 1.5 : 2
      const dpr = Math.min(window.devicePixelRatio || 1, maxDpr)
      // Use documentElement dimensions to get full viewport
      const width = document.documentElement.clientWidth
      const height = window.innerHeight
      canvas.width = width * dpr
      canvas.height = height * dpr
      canvas.style.width = '100vw'
      canvas.style.height = '100vh'
      gl.viewport(0, 0, canvas.width, canvas.height)
    }
    resize()
    window.addEventListener('resize', resize)

    // Render once (static background)
    const render = () => {
      gl.clearColor(0, 0, 0, 1)
      gl.clear(gl.COLOR_BUFFER_BIT)

      gl.useProgram(program)

      gl.uniform2f(resolutionLocation, canvas.width, canvas.height)

      gl.enableVertexAttribArray(positionLocation)
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
      gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0)

      gl.drawArrays(gl.TRIANGLES, 0, 6)
    }
    render()

    // Re-render on resize
    const handleResize = () => {
      resize()
      render()
    }
    window.removeEventListener('resize', resize)
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      gl.deleteProgram(program)
      gl.deleteShader(vertexShader)
      gl.deleteShader(fragmentShader)
      gl.deleteBuffer(positionBuffer)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="shader-background"
      aria-hidden="true"
    />
  )
}
