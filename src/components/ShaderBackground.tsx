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

// Fragment shader - Apple-style liquid glass effect on blueprint
// Optimized: reduced blur samples from 8 to 4
const fragmentShaderSource = `
  #extension GL_OES_standard_derivatives : enable
  precision highp float;
  
  varying vec2 v_uv;
  uniform vec2 u_resolution;
  uniform vec2 u_mouse;
  uniform float u_time;
  
  #define PI 3.14159265359
  
  // Simplex noise for organic movement
  vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
  
  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                        -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1;
    i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod(i, 289.0);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0))
                     + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
                            dot(x12.zw,x12.zw)), 0.0);
    m = m*m;
    m = m*m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }
  
  // Blueprint grid pattern
  float grid(vec2 uv, float size) {
    vec2 grid = abs(fract(uv * size - 0.5) - 0.5);
    vec2 lineWidth = vec2(0.02);
    vec2 lines = smoothstep(lineWidth, vec2(0.0), grid);
    return max(lines.x, lines.y);
  }
  
  // Liquid distortion
  vec2 liquidDistort(vec2 uv, vec2 center, float radius, float time) {
    vec2 delta = uv - center;
    float dist = length(delta);
    float influence = smoothstep(radius, 0.0, dist);
    
    // Organic liquid movement
    float n1 = snoise(uv * 4.0 + time * 0.5);
    float n2 = snoise(uv * 4.0 + vec2(5.0, 3.0) + time * 0.5);
    vec2 noiseOffset = vec2(n1, n2) * 0.03;
    
    // Refraction ripple
    float ripple = sin(dist * 25.0 - time * 3.0) * 0.015;
    vec2 rippleOffset = normalize(delta + 0.001) * ripple;
    
    // Magnification/lens effect
    vec2 lensOffset = delta * influence * 0.1;
    
    return (noiseOffset + rippleOffset - lensOffset) * influence;
  }
  
  void main() {
    vec2 uv = v_uv;
    float aspect = u_resolution.x / u_resolution.y;
    vec2 uvAspect = vec2(uv.x * aspect, uv.y);
    
    vec2 mouse = u_mouse / u_resolution;
    vec2 mouseAspect = vec2(mouse.x * aspect, mouse.y);
    
    float time = u_time;
    float dist = length(uvAspect - mouseAspect);
    
    // Glass effect parameters
    float glassRadius = 0.2;
    float glassInfluence = smoothstep(glassRadius, 0.0, dist);
    float softEdge = smoothstep(glassRadius * 1.3, glassRadius * 0.5, dist);
    
    // Early exit for pixels far outside effect area
    if (glassInfluence < 0.001 && softEdge < 0.001) {
      gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
      return;
    }
    
    // Apply liquid distortion to UV
    vec2 distortion = liquidDistort(uvAspect, mouseAspect, glassRadius, time);
    vec2 distortedUV = uv + distortion;
    
    // Blueprint colors
    vec3 blueprintBase = vec3(0.0, 0.278, 0.671); // #0047AB
    
    // Grid pattern - normal and distorted
    float minorGridNormal = grid(uv, 50.0);
    float majorGridNormal = grid(uv, 10.0);
    float minorGridDistorted = grid(distortedUV, 50.0);
    float majorGridDistorted = grid(distortedUV, 10.0);
    
    // Mix between normal and distorted grid based on glass influence
    float minorGrid = mix(minorGridNormal, minorGridDistorted, glassInfluence);
    float majorGrid = mix(majorGridNormal, majorGridDistorted, glassInfluence);
    
    // Base grid color
    vec3 gridColor = blueprintBase;
    gridColor = mix(gridColor, vec3(1.0), minorGrid * 0.08);
    gridColor = mix(gridColor, vec3(1.0), majorGrid * 0.15);
    
    // === LIQUID GLASS EFFECT ===
    
    // Frosted glass tint (Apple-style cool white-blue)
    vec3 glassTint = vec3(0.85, 0.9, 1.0);
    vec3 glassHighlight = vec3(1.0, 1.0, 1.0);
    
    // Optimized frosted blur effect - reduced from 8 to 4 samples
    vec3 blurColor = vec3(0.0);
    float blurRadius = glassInfluence * 0.015;
    for (float i = 0.0; i < 4.0; i++) {
      float angle = i * PI * 0.5;
      vec2 offset = vec2(cos(angle), sin(angle)) * blurRadius;
      vec2 sampleUV = distortedUV + offset;
      float sMinor = grid(sampleUV, 50.0);
      float sMajor = grid(sampleUV, 10.0);
      vec3 sColor = blueprintBase;
      sColor = mix(sColor, vec3(1.0), sMinor * 0.08);
      sColor = mix(sColor, vec3(1.0), sMajor * 0.15);
      blurColor += sColor;
    }
    blurColor /= 4.0;
    
    // Frosted glass overlay
    vec3 frostedColor = mix(blurColor, glassTint, glassInfluence * 0.4);
    
    // Specular highlights (caustics)
    float caustic1 = snoise(uvAspect * 10.0 + time * 0.3) * 0.5 + 0.5;
    float caustic2 = snoise(uvAspect * 15.0 - time * 0.2 + vec2(7.0)) * 0.5 + 0.5;
    float caustics = pow(caustic1 * caustic2, 2.5) * glassInfluence;
    
    // Edge highlight (fresnel-like)
    float edgeDist = abs(dist - glassRadius * 0.9);
    float edge = smoothstep(0.02, 0.0, edgeDist) * softEdge;
    
    // Inner glow
    float innerGlow = smoothstep(glassRadius, 0.0, dist) * 0.3;
    
    // Rainbow refraction at edges
    vec3 rainbow;
    float rainbowAngle = atan(uvAspect.y - mouseAspect.y, uvAspect.x - mouseAspect.x);
    rainbow.r = sin(rainbowAngle * 2.0 + time) * 0.5 + 0.5;
    rainbow.g = sin(rainbowAngle * 2.0 + time + 2.094) * 0.5 + 0.5;
    rainbow.b = sin(rainbowAngle * 2.0 + time + 4.188) * 0.5 + 0.5;
    
    // Compose glass effect
    vec3 glassColor = frostedColor;
    glassColor += glassHighlight * caustics * 0.3;
    glassColor += glassHighlight * edge * 0.4;
    glassColor += glassTint * innerGlow;
    glassColor += rainbow * edge * 0.15;
    
    // Final composition - blend grid with glass effect
    vec3 finalColor = mix(gridColor, glassColor, glassInfluence * 0.85);
    
    // Ambient glow around glass
    float ambientGlow = softEdge * 0.1;
    finalColor += glassTint * ambientGlow * (1.0 - glassInfluence);
    
    // Output with alpha for blending - only visible in effect area
    float alpha = max(glassInfluence * 0.9, softEdge * 0.2);
    
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

// Check if user prefers reduced motion
function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// Check if device is mobile for lower DPR
function isMobileDevice(): boolean {
  return window.innerWidth < 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

export function ShaderBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mouseRef = useRef({ x: 0, y: 0 })
  const targetMouseRef = useRef({ x: 0, y: 0 })
  const animationRef = useRef<number>(0)
  const lastFrameTime = useRef<number>(0)

  useEffect(() => {
    // Skip animation if user prefers reduced motion
    const reducedMotion = prefersReducedMotion()
    
    const canvas = canvasRef.current
    if (!canvas) return

    const gl = canvas.getContext('webgl', { 
      alpha: true,
      premultipliedAlpha: false,
      antialias: false, // Disable antialiasing for performance
      powerPreference: 'low-power' // Prefer battery life on mobile
    })
    if (!gl) {
      console.error('WebGL not supported')
      return
    }

    // Enable extension for better derivatives
    gl.getExtension('OES_standard_derivatives')

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
    const mouseLocation = gl.getUniformLocation(program, 'u_mouse')
    const timeLocation = gl.getUniformLocation(program, 'u_time')

    // Handle resize with optimized DPR
    const resize = () => {
      // Use lower DPR on mobile for performance (max 1.5 on mobile, 2 on desktop)
      const maxDpr = isMobileDevice() ? 1.5 : 2
      const dpr = Math.min(window.devicePixelRatio || 1, maxDpr)
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      canvas.style.width = `${window.innerWidth}px`
      canvas.style.height = `${window.innerHeight}px`
      gl.viewport(0, 0, canvas.width, canvas.height)
    }
    resize()
    window.addEventListener('resize', resize)

    // Mouse tracking
    const handleMouseMove = (e: MouseEvent) => {
      const maxDpr = isMobileDevice() ? 1.5 : 2
      const dpr = Math.min(window.devicePixelRatio || 1, maxDpr)
      targetMouseRef.current = {
        x: e.clientX * dpr,
        y: (window.innerHeight - e.clientY) * dpr
      }
    }
    window.addEventListener('mousemove', handleMouseMove)

    // Touch tracking
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0]
        const maxDpr = isMobileDevice() ? 1.5 : 2
        const dpr = Math.min(window.devicePixelRatio || 1, maxDpr)
        targetMouseRef.current = {
          x: touch.clientX * dpr,
          y: (window.innerHeight - touch.clientY) * dpr
        }
      }
    }
    window.addEventListener('touchmove', handleTouchMove)

    // Initialize mouse to center
    mouseRef.current = { x: canvas.width / 2, y: canvas.height / 2 }
    targetMouseRef.current = { ...mouseRef.current }

    // Frame rate control - full 60fps for smooth tracking
    const targetFrameInterval = reducedMotion ? 100 : 0 // No throttling for responsive mouse tracking

    // Render loop with frame rate throttling
    const startTime = performance.now()
    const render = (currentTime: number) => {
      // Throttle frame rate
      const elapsed = currentTime - lastFrameTime.current
      if (elapsed < targetFrameInterval) {
        animationRef.current = requestAnimationFrame(render)
        return
      }
      lastFrameTime.current = currentTime - (elapsed % targetFrameInterval)

      const time = (currentTime - startTime) / 1000

      // Smooth mouse easing (liquid feel) - higher = snappier
      const ease = 0.8
      mouseRef.current.x += (targetMouseRef.current.x - mouseRef.current.x) * ease
      mouseRef.current.y += (targetMouseRef.current.y - mouseRef.current.y) * ease

      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT)

      gl.useProgram(program)
      gl.enable(gl.BLEND)
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

      gl.uniform2f(resolutionLocation, canvas.width, canvas.height)
      gl.uniform2f(mouseLocation, mouseRef.current.x, mouseRef.current.y)
      gl.uniform1f(timeLocation, reducedMotion ? 0 : time) // Stop time if reduced motion

      gl.enableVertexAttribArray(positionLocation)
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
      gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0)

      gl.drawArrays(gl.TRIANGLES, 0, 6)

      animationRef.current = requestAnimationFrame(render)
    }
    animationRef.current = requestAnimationFrame(render)

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
