import { useEffect, useRef } from 'react'
import './ShaderBackground.css'

// Vertex shader - passes coordinates to fragment shader
const vertexShaderSource = `
  attribute vec2 a_position;
  varying vec2 v_uv;
  
  void main() {
    v_uv = a_position * 0.5 + 0.5;
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`

// Fragment shader - creates the interactive color effect
const fragmentShaderSource = `
  precision mediump float;
  
  varying vec2 v_uv;
  uniform vec2 u_resolution;
  uniform vec2 u_mouse;
  uniform float u_time;
  
  void main() {
    vec2 uv = v_uv;
    vec2 mouse = u_mouse / u_resolution;
    
    // Distance from mouse
    float dist = distance(uv, mouse);
    
    // Base blueprint color (cobalt blue)
    vec3 baseColor = vec3(0.0, 0.278, 0.671); // #0047AB
    
    // Accent colors
    vec3 cyanGlow = vec3(0.0, 0.831, 1.0);    // #00D4FF
    vec3 purpleGlow = vec3(0.4, 0.2, 0.8);    // Purple accent
    vec3 blueHighlight = vec3(0.2, 0.4, 0.9); // Lighter blue
    
    // Create radial gradient from mouse position
    float glowRadius = 0.4;
    float glowIntensity = smoothstep(glowRadius, 0.0, dist);
    
    // Add subtle wave distortion based on time
    float wave = sin(dist * 20.0 - u_time * 2.0) * 0.5 + 0.5;
    wave *= smoothstep(0.5, 0.1, dist);
    
    // Mix colors based on distance and angle
    float angle = atan(uv.y - mouse.y, uv.x - mouse.x);
    float colorMix = sin(angle * 2.0 + u_time) * 0.5 + 0.5;
    
    vec3 glowColor = mix(cyanGlow, purpleGlow, colorMix);
    
    // Add ripple effect
    float ripple = sin(dist * 30.0 - u_time * 3.0) * 0.5 + 0.5;
    ripple *= smoothstep(0.4, 0.1, dist) * 0.3;
    
    // Combine everything
    vec3 finalColor = baseColor;
    finalColor = mix(finalColor, glowColor, glowIntensity * 0.6);
    finalColor += glowColor * ripple * 0.2;
    finalColor = mix(finalColor, blueHighlight, wave * 0.15);
    
    // Add subtle vignette
    float vignette = 1.0 - smoothstep(0.3, 0.9, length(uv - 0.5));
    finalColor *= 0.9 + vignette * 0.1;
    
    gl_FragColor = vec4(finalColor, 0.85);
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

export function ShaderBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mouseRef = useRef({ x: 0, y: 0 })
  const animationRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const gl = canvas.getContext('webgl', { 
      alpha: true,
      premultipliedAlpha: false 
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
      -1, -1,
       1, -1,
      -1,  1,
      -1,  1,
       1, -1,
       1,  1,
    ]), gl.STATIC_DRAW)

    // Get attribute/uniform locations
    const positionLocation = gl.getAttribLocation(program, 'a_position')
    const resolutionLocation = gl.getUniformLocation(program, 'u_resolution')
    const mouseLocation = gl.getUniformLocation(program, 'u_mouse')
    const timeLocation = gl.getUniformLocation(program, 'u_time')

    // Handle resize
    const resize = () => {
      const dpr = window.devicePixelRatio || 1
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      canvas.style.width = `${window.innerWidth}px`
      canvas.style.height = `${window.innerHeight}px`
      gl.viewport(0, 0, canvas.width, canvas.height)
    }
    resize()
    window.addEventListener('resize', resize)

    // Handle mouse move
    const handleMouseMove = (e: MouseEvent) => {
      const dpr = window.devicePixelRatio || 1
      mouseRef.current = {
        x: e.clientX * dpr,
        y: (window.innerHeight - e.clientY) * dpr // Flip Y for WebGL
      }
    }
    window.addEventListener('mousemove', handleMouseMove)

    // Initialize mouse position to center
    mouseRef.current = {
      x: canvas.width / 2,
      y: canvas.height / 2
    }

    // Animation loop
    const startTime = performance.now()
    const render = () => {
      const time = (performance.now() - startTime) / 1000

      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT)

      gl.useProgram(program)

      // Enable blending for transparency
      gl.enable(gl.BLEND)
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

      // Set uniforms
      gl.uniform2f(resolutionLocation, canvas.width, canvas.height)
      gl.uniform2f(mouseLocation, mouseRef.current.x, mouseRef.current.y)
      gl.uniform1f(timeLocation, time)

      // Set up position attribute
      gl.enableVertexAttribArray(positionLocation)
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
      gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0)

      // Draw
      gl.drawArrays(gl.TRIANGLES, 0, 6)

      animationRef.current = requestAnimationFrame(render)
    }
    render()

    // Cleanup
    return () => {
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', handleMouseMove)
      cancelAnimationFrame(animationRef.current)
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

