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

// Fragment shader - recreating shaders.com metaball glow effect
const fragmentShaderSource = `
  precision highp float;
  
  varying vec2 v_uv;
  uniform vec2 u_resolution;
  uniform vec2 u_mouse;
  uniform float u_time;
  
  // Smooth minimum for metaball blending
  float smin(float a, float b, float k) {
    float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
    return mix(b, a, h) - k * h * (1.0 - h);
  }
  
  // Noise function for organic movement
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }
  
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }
  
  // Iridescent color palette like shaders.com
  vec3 palette(float t) {
    // Holographic/iridescent colors
    vec3 a = vec3(0.5, 0.5, 0.5);
    vec3 b = vec3(0.5, 0.5, 0.5);
    vec3 c = vec3(1.0, 1.0, 1.0);
    vec3 d = vec3(0.263, 0.416, 0.557); // Shifted for cyan/pink/purple
    
    return a + b * cos(6.28318 * (c * t + d));
  }
  
  void main() {
    vec2 uv = v_uv;
    vec2 aspect = vec2(u_resolution.x / u_resolution.y, 1.0);
    uv = (uv - 0.5) * aspect + 0.5;
    
    vec2 mouse = u_mouse / u_resolution;
    mouse = (mouse - 0.5) * aspect + 0.5;
    
    float time = u_time * 0.5;
    
    // Create multiple metaballs
    float metaball = 0.0;
    
    // Mouse-following metaball (main glow)
    vec2 p1 = mouse;
    float d1 = length(uv - p1);
    metaball += 0.08 / (d1 + 0.01);
    
    // Orbiting metaballs around mouse
    for (float i = 0.0; i < 5.0; i++) {
      float angle = time * (0.5 + i * 0.1) + i * 1.2566;
      float radius = 0.1 + 0.05 * sin(time + i);
      vec2 offset = vec2(cos(angle), sin(angle)) * radius;
      vec2 p = mouse + offset;
      float d = length(uv - p);
      metaball += (0.03 + 0.01 * sin(time + i * 2.0)) / (d + 0.01);
    }
    
    // Floating ambient metaballs
    for (float i = 0.0; i < 4.0; i++) {
      float t = time * 0.3 + i * 3.14159;
      vec2 p = vec2(
        0.5 + 0.3 * sin(t * 0.7 + i),
        0.5 + 0.3 * cos(t * 0.5 + i * 2.0)
      );
      p = (p - 0.5) * aspect + 0.5;
      float d = length(uv - p);
      metaball += 0.02 / (d + 0.01);
    }
    
    // Threshold and smooth the metaballs
    float threshold = 1.0;
    float glow = smoothstep(threshold - 0.5, threshold + 0.5, metaball);
    float softGlow = smoothstep(0.3, 2.0, metaball);
    
    // Create iridescent color based on position and metaball intensity
    float colorShift = metaball * 0.1 + time * 0.2;
    colorShift += length(uv - mouse) * 0.5;
    colorShift += noise(uv * 3.0 + time * 0.5) * 0.3;
    
    vec3 iridescent = palette(colorShift);
    
    // Add extra shimmer
    float shimmer = noise(uv * 10.0 + time * 2.0) * 0.3 + 0.7;
    iridescent *= shimmer;
    
    // Base color (transparent/subtle blue to match blueprint)
    vec3 baseColor = vec3(0.0, 0.15, 0.35);
    
    // Blend metaball glow
    vec3 glowColor = iridescent * glow;
    vec3 softGlowColor = iridescent * softGlow * 0.15;
    
    // Final color
    vec3 finalColor = baseColor * 0.3;
    finalColor += softGlowColor;
    finalColor += glowColor * 1.5;
    
    // Add bright core
    float core = smoothstep(threshold + 1.0, threshold + 2.0, metaball);
    finalColor += vec3(1.0) * core * 0.8;
    
    // Subtle vignette
    float vignette = 1.0 - length(v_uv - 0.5) * 0.5;
    finalColor *= vignette;
    
    // Alpha based on glow intensity
    float alpha = softGlow * 0.6 + glow * 0.4;
    alpha = clamp(alpha, 0.0, 0.9);
    
    gl_FragColor = vec4(finalColor, alpha);
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
  const targetMouseRef = useRef({ x: 0, y: 0 })
  const animationRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const gl = canvas.getContext('webgl', { 
      alpha: true,
      premultipliedAlpha: false,
      antialias: true
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
      const dpr = Math.min(window.devicePixelRatio || 1, 2) // Cap at 2x for performance
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      canvas.style.width = `${window.innerWidth}px`
      canvas.style.height = `${window.innerHeight}px`
      gl.viewport(0, 0, canvas.width, canvas.height)
    }
    resize()
    window.addEventListener('resize', resize)

    // Handle mouse move with smooth interpolation
    const handleMouseMove = (e: MouseEvent) => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      targetMouseRef.current = {
        x: e.clientX * dpr,
        y: (window.innerHeight - e.clientY) * dpr // Flip Y for WebGL
      }
    }
    window.addEventListener('mousemove', handleMouseMove)

    // Handle touch
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0]
        const dpr = Math.min(window.devicePixelRatio || 1, 2)
        targetMouseRef.current = {
          x: touch.clientX * dpr,
          y: (window.innerHeight - touch.clientY) * dpr
        }
      }
    }
    window.addEventListener('touchmove', handleTouchMove)

    // Initialize mouse position to center
    mouseRef.current = {
      x: canvas.width / 2,
      y: canvas.height / 2
    }
    targetMouseRef.current = { ...mouseRef.current }

    // Animation loop
    const startTime = performance.now()
    const render = () => {
      const time = (performance.now() - startTime) / 1000

      // Smooth mouse interpolation (easing)
      const ease = 0.08
      mouseRef.current.x += (targetMouseRef.current.x - mouseRef.current.x) * ease
      mouseRef.current.y += (targetMouseRef.current.y - mouseRef.current.y) * ease

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
      window.removeEventListener('touchmove', handleTouchMove)
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
