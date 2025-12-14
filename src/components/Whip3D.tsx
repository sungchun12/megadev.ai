import { useRef, useMemo, Suspense, useState, useCallback, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Float } from '@react-three/drei'
import * as THREE from 'three'
import './Whip3D.css'

// Performance detection utilities
const isMobileDevice = (): boolean => {
  return window.innerWidth < 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

// Get optimized segment count based on device
const getSegmentCount = (): number => {
  return isMobileDevice() ? 20 : 30
}

// Get optimized particle count based on device
const getParticleCount = (): number => {
  return isMobileDevice() ? 25 : 40
}

// Get capped DPR (max 1.5 for performance)
const getCappedDpr = (): number => {
  return Math.min(window.devicePixelRatio || 1, 1.5)
}

// Explosion particle data
interface Explosion {
  id: number
  position: THREE.Vector3
  startTime: number
  particles: Float32Array
  velocities: Float32Array
  colors: Float32Array
  sizes: Float32Array
}

// Shared state for mouse interaction
interface WhipState {
  isDragging: boolean
  isHovering: boolean
  mouseX: number
  mouseY: number
  targetX: number
  targetY: number
  returnProgress: number
  velocity: { x: number; y: number }
  sceneOffsetX: number
  sceneOffsetY: number
  lastJabTime: number
  explosions: Explosion[]
  nextExplosionId: number
}

// Custom glowing material
const createGlowMaterial = () => new THREE.ShaderMaterial({
  uniforms: {
    time: { value: 0 },
    color: { value: new THREE.Color('#00D4FF') },
    intensity: { value: 1.0 },
  },
  vertexShader: `
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    
    void main() {
      vNormal = normalize(normalMatrix * normal);
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      vViewPosition = -mvPosition.xyz;
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  fragmentShader: `
    uniform float time;
    uniform vec3 color;
    uniform float intensity;
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    
    void main() {
      vec3 viewDir = normalize(vViewPosition);
      float fresnel = pow(1.0 - abs(dot(viewDir, vNormal)), 2.0);
      float pulse = 0.7 + 0.3 * sin(time * 2.0);
      
      vec3 coreColor = color * 0.9 * intensity;
      vec3 glowColor = vec3(0.5, 1.0, 1.0) * intensity;
      
      vec3 finalColor = mix(coreColor, glowColor, fresnel * pulse);
      float alpha = 0.9 + fresnel * 0.1;
      
      gl_FragColor = vec4(finalColor, alpha);
    }
  `,
  transparent: true,
  side: THREE.DoubleSide,
})

// Individual arrow segment of the whip
function WhipSegment({ 
  index, 
  total,
  whipState,
}: { 
  index: number
  total: number
  whipState: React.MutableRefObject<WhipState>
}) {
  const meshRef = useRef<THREE.Mesh>(null)
  const materialRef = useRef<THREE.ShaderMaterial>(createGlowMaterial())
  const progress = index / total
  
  // Store the idle position for returning
  const idlePosition = useRef({ x: 0, y: 0, z: 0 })
  const currentOffset = useRef({ x: 0, y: 0 })
  
  // Reduce bevel segments on mobile for performance
  const bevelSegments = isMobileDevice() ? 1 : 2
  
  const geometry = useMemo(() => {
    const shape = new THREE.Shape()
    const size = 0.18 - progress * 0.06
    
    shape.moveTo(0, size * 0.5)
    shape.lineTo(size * 1.5, 0)
    shape.lineTo(0, -size * 0.5)
    shape.lineTo(size * 0.3, 0)
    shape.closePath()
    
    const extrudeSettings = {
      depth: 0.06,
      bevelEnabled: true,
      bevelThickness: 0.015,
      bevelSize: 0.015,
      bevelSegments,
    }
    
    return new THREE.ExtrudeGeometry(shape, extrudeSettings)
  }, [progress, bevelSegments])

  useFrame((state) => {
    if (!meshRef.current) return
    
    const time = state.clock.elapsedTime
    const ws = whipState.current
    
    // Update shader time and intensity
    if (materialRef.current.uniforms) {
      materialRef.current.uniforms.time.value = time
      // Glow more intensely when being whipped, pulse when hovering
      let targetIntensity = 1.0
      if (ws.isDragging) {
        targetIntensity = 1.5
      } else if (ws.isHovering) {
        // Pulse between 1.0 and 1.5 when hovering
        const pulse = 0.5 * (Math.sin(time * 3) * 0.5 + 0.5) // 0 to 0.5
        targetIntensity = 1.0 + pulse
      }
      materialRef.current.uniforms.intensity.value += (targetIntensity - materialRef.current.uniforms.intensity.value) * 0.1
    }
    
    // Base wave motion
    const waveOffset = index * 0.25
    const wave1 = Math.sin(time * 1.8 + waveOffset) * 0.12
    const wave2 = Math.cos(time * 1.3 + waveOffset * 0.8) * 0.08
    const wave3 = Math.sin(time * 0.9 + waveOffset * 1.2) * 0.06
    
    // Spiral path for idle animation
    const angle = progress * Math.PI * 2.2 + time * 0.4
    const radius = 1.2 + progress * 1.0 + wave1
    
    // Calculate idle position
    const idleX = Math.cos(angle) * radius + wave2
    const idleY = Math.sin(angle) * radius * 0.7 + wave3
    const idleZ = progress * 0.3 + Math.sin(time * 0.7 + index * 0.15) * 0.08
    
    // Store for reference
    idlePosition.current = { x: idleX, y: idleY, z: idleZ }
    
    // Calculate drag influence (segments near the end are more affected)
    const dragInfluence = Math.pow(progress, 0.6) // More influence at the tip
    
    if (ws.isDragging) {
      // When dragging, follow the mouse with a whip-like delay
      const delayFactor = 1 - progress * 0.7 // Tip follows faster
      const targetOffsetX = ws.targetX * 2.5 * dragInfluence
      const targetOffsetY = ws.targetY * 2.5 * dragInfluence
      
      // Add velocity-based overshoot for whip feel
      const velocityInfluence = dragInfluence * 0.5
      const overshootX = ws.velocity.x * velocityInfluence
      const overshootY = ws.velocity.y * velocityInfluence
      
      currentOffset.current.x += ((targetOffsetX + overshootX) - currentOffset.current.x) * (0.15 - delayFactor * 0.1)
      currentOffset.current.y += ((targetOffsetY + overshootY) - currentOffset.current.y) * (0.15 - delayFactor * 0.1)
    } else {
      // Smoothly return to idle with elastic easing
      const returnSpeed = 0.03 + progress * 0.02 // Tip returns slightly faster
      const elasticity = Math.sin(ws.returnProgress * Math.PI * 2) * (1 - ws.returnProgress) * 0.3
      
      currentOffset.current.x += (0 - currentOffset.current.x) * returnSpeed
      currentOffset.current.y += (0 - currentOffset.current.y) * returnSpeed
      
      // Add subtle bounce
      currentOffset.current.x += elasticity * 0.1 * dragInfluence
      currentOffset.current.y += elasticity * 0.1 * dragInfluence
    }
    
    // Final position
    const x = idleX + currentOffset.current.x
    const y = idleY + currentOffset.current.y
    const z = idleZ
    
    meshRef.current.position.set(x, y, z)
    
    // Calculate tangent direction (direction of motion along the spiral)
    // For a spiral, the tangent at angle θ points in direction (-sin θ, cos θ)
    // We want arrows to point ALONG the whip flow (toward the tip)
    const tangentX = -Math.sin(angle)
    const tangentY = Math.cos(angle) * 0.7 // Account for Y squish
    
    // Add influence from drag offset for more dynamic rotation
    const offsetInfluence = 0.4
    const finalTangentX = tangentX + currentOffset.current.x * offsetInfluence
    const finalTangentY = tangentY + currentOffset.current.y * offsetInfluence
    
    // Rotate arrow to point along tangent (arrow shape points in +X by default)
    meshRef.current.rotation.z = Math.atan2(finalTangentY, finalTangentX)
    meshRef.current.rotation.y = Math.sin(time * 0.6 + index * 0.08) * 0.15 + currentOffset.current.x * 0.2
  })

  return (
    <mesh ref={meshRef} geometry={geometry} material={materialRef.current} />
  )
}

// Whip tip - larger arrow head
function WhipTip({ whipState, segmentCount }: { whipState: React.MutableRefObject<WhipState>; segmentCount: number }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const materialRef = useRef<THREE.ShaderMaterial>(createGlowMaterial())
  const currentOffset = useRef({ x: 0, y: 0 })
  
  // Reduce bevel segments on mobile
  const bevelSegments = isMobileDevice() ? 2 : 3
  
  const geometry = useMemo(() => {
    const shape = new THREE.Shape()
    const size = 0.25
    
    shape.moveTo(0, size * 0.6)
    shape.lineTo(size * 2.2, 0)
    shape.lineTo(0, -size * 0.6)
    shape.lineTo(size * 0.35, 0)
    shape.closePath()
    
    const extrudeSettings = {
      depth: 0.1,
      bevelEnabled: true,
      bevelThickness: 0.025,
      bevelSize: 0.025,
      bevelSegments,
    }
    
    return new THREE.ExtrudeGeometry(shape, extrudeSettings)
  }, [bevelSegments])

  useFrame((state) => {
    if (!meshRef.current) return
    
    const time = state.clock.elapsedTime
    const ws = whipState.current
    
    if (materialRef.current.uniforms) {
      materialRef.current.uniforms.time.value = time
      // Tip glows brighter - pulse when hovering, steady when dragging
      let targetIntensity = 1.0
      if (ws.isDragging) {
        targetIntensity = 1.8
      } else if (ws.isHovering) {
        // Pulse between 1.0 and 1.8 when hovering (tip pulses more)
        const pulse = 0.8 * (Math.sin(time * 3) * 0.5 + 0.5) // 0 to 0.8
        targetIntensity = 1.0 + pulse
      }
      materialRef.current.uniforms.intensity.value += (targetIntensity - materialRef.current.uniforms.intensity.value) * 0.1
    }
    
    const progress = 1
    const waveOffset = segmentCount * 0.25
    const wave1 = Math.sin(time * 1.8 + waveOffset) * 0.12
    
    const angle = progress * Math.PI * 2.2 + time * 0.4
    const radius = 1.2 + progress * 1.0 + wave1
    
    const idleX = Math.cos(angle) * radius + Math.cos(time * 1.3 + 7) * 0.08
    const idleY = Math.sin(angle) * radius * 0.7 + Math.sin(time * 0.9 + 10) * 0.06 - 0.3
    const idleZ = progress * 0.3 + Math.sin(time * 0.7 + segmentCount * 0.15) * 0.08 + 0.15
    
    // Tip has maximum drag influence
    const dragInfluence = 1.0
    
    if (ws.isDragging) {
      const targetOffsetX = ws.targetX * 3.0 * dragInfluence
      const targetOffsetY = ws.targetY * 3.0 * dragInfluence
      
      // More velocity influence at the tip for that crack effect
      const overshootX = ws.velocity.x * 0.8
      const overshootY = ws.velocity.y * 0.8
      
      currentOffset.current.x += ((targetOffsetX + overshootX) - currentOffset.current.x) * 0.2
      currentOffset.current.y += ((targetOffsetY + overshootY) - currentOffset.current.y) * 0.2
    } else {
      const returnSpeed = 0.04
      const elasticity = Math.sin(ws.returnProgress * Math.PI * 3) * (1 - ws.returnProgress) * 0.4
      
      currentOffset.current.x += (0 - currentOffset.current.x) * returnSpeed
      currentOffset.current.y += (0 - currentOffset.current.y) * returnSpeed
      currentOffset.current.x += elasticity * 0.15
      currentOffset.current.y += elasticity * 0.1
    }
    
    const x = idleX + currentOffset.current.x
    const y = idleY + currentOffset.current.y
    const z = idleZ
    
    meshRef.current.position.set(x, y, z)
    
    // Calculate tangent direction (same as segments)
    const tangentX = -Math.sin(angle)
    const tangentY = Math.cos(angle) * 0.7
    
    // Add stronger offset influence for the tip
    const offsetInfluence = 0.5
    const finalTangentX = tangentX + currentOffset.current.x * offsetInfluence
    const finalTangentY = tangentY + currentOffset.current.y * offsetInfluence
    
    meshRef.current.rotation.z = Math.atan2(finalTangentY, finalTangentX)
    meshRef.current.rotation.y = Math.sin(time * 0.6) * 0.2 + currentOffset.current.x * 0.3
  })

  return (
    <mesh ref={meshRef} geometry={geometry} material={materialRef.current} />
  )
}

// Main whip assembly
function Whip({ whipState, segmentCount }: { whipState: React.MutableRefObject<WhipState>; segmentCount: number }) {
  const groupRef = useRef<THREE.Group>(null)
  const offsetGroupRef = useRef<THREE.Group>(null)
  const currentOffset = useRef({ x: 0, y: 0 })
  
  useFrame((state) => {
    if (!groupRef.current || !offsetGroupRef.current) return
    const time = state.clock.elapsedTime
    const ws = whipState.current
    
    // Update return progress
    if (!ws.isDragging && ws.returnProgress < 1) {
      ws.returnProgress = Math.min(1, ws.returnProgress + 0.02)
    }
    
    // Smoothly animate scene offset when dragging
    if (ws.isDragging) {
      currentOffset.current.x += (ws.sceneOffsetX - currentOffset.current.x) * 0.15
      currentOffset.current.y += (ws.sceneOffsetY - currentOffset.current.y) * 0.15
    } else {
      // Return to center when not dragging
      currentOffset.current.x += (0 - currentOffset.current.x) * 0.08
      currentOffset.current.y += (0 - currentOffset.current.y) * 0.08
    }
    
    offsetGroupRef.current.position.x = currentOffset.current.x
    offsetGroupRef.current.position.y = currentOffset.current.y
    
    // Gentle overall sway (reduced when dragging)
    const swayAmount = ws.isDragging ? 0.01 : 0.04
    groupRef.current.rotation.x = Math.sin(time * 0.25) * swayAmount
    groupRef.current.rotation.y = Math.cos(time * 0.18) * swayAmount
  })

  return (
    <group ref={offsetGroupRef}>
      <group ref={groupRef}>
        <Float
          speed={1.5}
          rotationIntensity={whipState.current.isDragging ? 0.05 : 0.15}
          floatIntensity={whipState.current.isDragging ? 0.1 : 0.25}
        >
          {Array.from({ length: segmentCount }).map((_, i) => (
            <WhipSegment
              key={i}
              index={i}
              total={segmentCount}
              whipState={whipState}
            />
          ))}
          <WhipTip whipState={whipState} segmentCount={segmentCount} />
        </Float>
      </group>
    </group>
  )
}

// Ambient glow particles
function GlowParticles({ whipState, particleCount }: { whipState: React.MutableRefObject<WhipState>; particleCount: number }) {
  const groupRef = useRef<THREE.Group>(null)
  const particlesRef = useRef<THREE.Points>(null)
  const currentOffset = useRef({ x: 0, y: 0 })
  
  const positions = useMemo(() => {
    const pos = new Float32Array(particleCount * 3)
    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2 * 2.2
      const radius = 1.2 + (i / particleCount) * 1.0
      pos[i * 3] = Math.cos(angle) * radius + (Math.random() - 0.5) * 0.4
      pos[i * 3 + 1] = Math.sin(angle) * radius * 0.7 + (Math.random() - 0.5) * 0.4
      pos[i * 3 + 2] = (i / particleCount) * 0.3 + (Math.random() - 0.5) * 0.2
    }
    return pos
  }, [particleCount])

  useFrame((state) => {
    if (!particlesRef.current || !groupRef.current) return
    const time = state.clock.elapsedTime
    const ws = whipState.current
    
    // Match the whip's offset position
    if (ws.isDragging) {
      currentOffset.current.x += (ws.sceneOffsetX - currentOffset.current.x) * 0.15
      currentOffset.current.y += (ws.sceneOffsetY - currentOffset.current.y) * 0.15
    } else {
      currentOffset.current.x += (0 - currentOffset.current.x) * 0.08
      currentOffset.current.y += (0 - currentOffset.current.y) * 0.08
    }
    
    groupRef.current.position.x = currentOffset.current.x
    groupRef.current.position.y = currentOffset.current.y
    
    // Particles react to dragging
    const rotationSpeed = ws.isDragging ? 0.15 : 0.08
    particlesRef.current.rotation.z = time * rotationSpeed + ws.targetX * 0.3
    particlesRef.current.rotation.y = Math.sin(time * 0.15) * 0.08 + ws.targetY * 0.2
  })

  return (
    <group ref={groupRef}>
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={particleCount}
            array={positions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.04}
          color="#00D4FF"
          transparent
          opacity={0.7}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
    </group>
  )
}

// Single explosion particle system
function ExplosionParticles({ 
  explosion, 
  onComplete 
}: { 
  explosion: Explosion
  onComplete: (id: number) => void 
}) {
  const pointsRef = useRef<THREE.Points>(null)
  const materialRef = useRef<THREE.ShaderMaterial>(null)
  
  const particleCount = explosion.particles.length / 3
  
  // Create shader material for high-fidelity sparkle effect
  const shaderMaterial = useMemo(() => new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      opacity: { value: 1.0 },
    },
    vertexShader: `
      attribute float size;
      attribute vec3 customColor;
      varying vec3 vColor;
      varying float vOpacity;
      uniform float time;
      uniform float opacity;
      
      void main() {
        vColor = customColor;
        vOpacity = opacity;
        
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = size * (350.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      precision highp float;
      varying vec3 vColor;
      varying float vOpacity;
      uniform float time;
      
      // Award-winning sparkle shader with advanced effects
      void main() {
        vec2 center = gl_PointCoord - vec2(0.5);
        float dist = length(center);
        float angle = atan(center.y, center.x);
        
        // Multi-frequency ray system with complex harmonics
        float rayCount1 = 6.0;
        float rayCount2 = 12.0;
        float rayCount3 = 18.0;
        float rayCount4 = 24.0;
        float rotation = time * 2.5;
        
        // Phase-shifted rays for complex interference patterns
        float rays1 = 0.5 + 0.5 * sin(angle * rayCount1 + rotation);
        float rays2 = 0.5 + 0.5 * sin(angle * rayCount2 - rotation * 0.75);
        float rays3 = 0.5 + 0.5 * sin(angle * rayCount3 + rotation * 0.5);
        float rays4 = 0.5 + 0.5 * sin(angle * rayCount4 - rotation * 0.4);
        
        // Weighted combination for rich interference
        float rays = rays1 * 0.3 + rays2 * 0.3 + rays3 * 0.25 + rays4 * 0.15;
        
        // Multi-zone star with exponential falloff for award-winning smoothness
        float starZone1 = smoothstep(0.7, 0.4, dist) * (0.4 + 0.6 * rays);
        float starZone2 = smoothstep(0.5, 0.25, dist) * (0.6 + 0.4 * rays);
        float starZone3 = smoothstep(0.35, 0.1, dist) * (0.8 + 0.2 * rays);
        float starZone4 = smoothstep(0.2, 0.02, dist) * (0.95 + 0.05 * rays);
        float star = max(max(max(starZone1, starZone2 * 1.4), starZone3 * 1.8), starZone4 * 2.2);
        
        // Ultra-smooth multi-layer core with harmonic pulsing
        float core1 = exp(-dist * 12.0);
        float core2 = exp(-dist * 25.0) * (0.5 + 0.5 * sin(time * 5.0));
        float core3 = exp(-dist * 45.0) * (0.4 + 0.6 * sin(time * 7.0 + 0.8));
        float core4 = exp(-dist * 70.0) * (0.3 + 0.7 * sin(time * 9.0 + 1.6));
        float core = max(max(max(core1, core2 * 2.0), core3 * 2.5), core4 * 3.0);
        
        // Sophisticated halo with radial gradient
        float haloInner = exp(-dist * 4.0) * smoothstep(0.3, 0.1, dist);
        float haloOuter = exp(-dist * 2.2) * (1.0 - smoothstep(0.2, 0.6, dist));
        float halo = max(haloInner * 0.6, haloOuter * 0.4);
        
        // Fresnel-like edge enhancement for premium feel
        float fresnel = pow(1.0 - smoothstep(0.0, 0.5, dist), 1.5);
        float edgeGlow = fresnel * 0.3;
        
        // Combine all layers with award-winning composition
        float alpha = (star * 0.55 + core * 1.3 + halo * 0.35 + edgeGlow) * vOpacity;
        
        if (alpha < 0.005) discard;
        
        // Advanced color processing with dynamic gradients
        vec3 colorShift1 = vec3(0.15, 0.3, 0.4) * sin(time * 3.5 + dist * 15.0) * 0.5;
        vec3 colorShift2 = vec3(0.25, 0.2, 0.35) * cos(time * 4.5 + dist * 18.0) * 0.3;
        vec3 baseColor = vColor * (1.0 + core * 1.4 + star * 0.3);
        vec3 finalColor = baseColor + colorShift1 + colorShift2 + vec3(0.6) * core;
        
        // Premium chromatic aberration with distance-based intensity
        float chromaIntensity = smoothstep(0.0, 0.4, dist) * 0.5;
        vec3 chroma = vec3(
          finalColor.r * (1.0 + chromaIntensity * 0.5),
          finalColor.g * (1.0 + chromaIntensity * 0.1),
          finalColor.b * (1.0 - chromaIntensity * 0.3)
        );
        
        // Award-winning rainbow diffraction effect
        float rainbowPhase = angle * 2.0 + time * 1.5;
        vec3 rainbow = vec3(
          sin(rainbowPhase) * 0.5 + 0.5,
          sin(rainbowPhase + 2.094) * 0.5 + 0.5,
          sin(rainbowPhase + 4.188) * 0.5 + 0.5
        );
        float rainbowMask = (1.0 - smoothstep(0.15, 0.5, dist)) * 0.2;
        chroma += rainbow * rainbowMask;
        
        // Subtle color temperature shift for warmth
        vec3 warmTint = vec3(1.05, 1.0, 0.95) * (0.7 + 0.3 * sin(time * 2.0));
        chroma *= mix(vec3(1.0), warmTint, 0.15);
        
        // Final gamma correction for award-winning brightness
        chroma = pow(chroma, vec3(0.95));
        
        gl_FragColor = vec4(chroma, alpha);
      }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  }), [])

  useFrame((state) => {
    if (!pointsRef.current || !materialRef.current) return
    
    const elapsed = state.clock.elapsedTime - explosion.startTime
    const duration = 1.6 // Award-winning duration for perfect visibility
    const progress = Math.min(elapsed / duration, 1.0)
    
    if (progress >= 1) {
      onComplete(explosion.id)
      return
    }
    
    // Update particle positions based on velocities
    const positions = pointsRef.current.geometry.attributes.position.array as Float32Array
    const sizes = pointsRef.current.geometry.attributes.size.array as Float32Array
    
    for (let i = 0; i < particleCount; i++) {
      const idx = i * 3
      
      // Award-winning physics with sophisticated easing
      const velocityDecay = Math.pow(1 - progress, 3.0) // Smooth exponential decay
      const velocityScale = velocityDecay * 0.028
      
      positions[idx] += explosion.velocities[idx] * velocityScale
      positions[idx + 1] += explosion.velocities[idx + 1] * velocityScale
      positions[idx + 2] += explosion.velocities[idx + 2] * velocityScale
      
      // Award-winning size animation with perfect per-particle curves
      const particlePhase = (i % 5) / 5.0 // Create 5 different phases
      const sizeVariation = 0.2 + particlePhase * 0.25
      const sizeDecay = 1 - Math.pow(progress, sizeVariation) * 0.7
      sizes[i] = explosion.sizes[i] * sizeDecay
      
      // Award-winning spiral motion with harmonic oscillation
      const spiralFreq = 2.8 + (i % 3) * 0.4
      const spiralPhase = i * 0.12
      const rotationOffset = Math.sin(elapsed * spiralFreq + spiralPhase) * 0.03 * (1 - progress)
      positions[idx] += rotationOffset * Math.cos(i * 0.6)
      positions[idx + 1] += rotationOffset * Math.sin(i * 0.6)
      
      // Subtle gravity effect for natural fall
      const gravity = progress * progress * 0.015
      positions[idx + 1] -= gravity
    }
    
    pointsRef.current.geometry.attributes.position.needsUpdate = true
    pointsRef.current.geometry.attributes.size.needsUpdate = true
    
    // Award-winning fade curve with perfect easing
    const fadeCurve = 1 - Math.pow(progress, 1.6)
    materialRef.current.uniforms.opacity.value = fadeCurve
    
    // Award-winning time animation for complex effects
    materialRef.current.uniforms.time.value = elapsed * 2.2
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={explosion.particles.slice()}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-customColor"
          count={particleCount}
          array={explosion.colors}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          count={particleCount}
          array={explosion.sizes.slice()}
          itemSize={1}
        />
      </bufferGeometry>
      <primitive object={shaderMaterial} ref={materialRef} attach="material" />
    </points>
  )
}

// Explosion manager - detects jabs and spawns explosions
function ExplosionManager({ whipState }: { whipState: React.MutableRefObject<WhipState> }) {
  const { clock } = useThree()
  const [explosions, setExplosions] = useState<Explosion[]>([])
  
  // Jab detection threshold - lowered for easier triggering
  const JAB_VELOCITY_THRESHOLD = 2.5
  const JAB_COOLDOWN = 0.12 // Minimum time between explosions
  
  const createExplosion = useCallback((x: number, y: number) => {
    const ws = whipState.current
    const particleCount = isMobileDevice() ? 70 : 120 // Award-winning particle density
    
    const particles = new Float32Array(particleCount * 3)
    const velocities = new Float32Array(particleCount * 3)
    const colors = new Float32Array(particleCount * 3)
    const sizes = new Float32Array(particleCount)
    
    // Award-winning color palette with sophisticated gradients
    const colorPalette = [
      new THREE.Color('#00D4FF'), // Bright cyan - primary
      new THREE.Color('#00FFFF'), // Pure cyan - vibrant
      new THREE.Color('#1AE5FF'), // Electric cyan - intense
      new THREE.Color('#4DA6FF'), // Sky blue - cool
      new THREE.Color('#66D9FF'), // Bright aqua - fresh
      new THREE.Color('#80FFFF'), // Pale cyan - soft
      new THREE.Color('#A8F0FF'), // Very light cyan - ethereal
      new THREE.Color('#B3E5FF'), // Light blue - gentle
      new THREE.Color('#C8F0FF'), // Ice blue - delicate
      new THREE.Color('#E0F7FF'), // Frost blue - subtle
      new THREE.Color('#FFFFFF'), // Pure white - highlight
      new THREE.Color('#F0FCFF'), // Off-white - warm
    ]
    
    for (let i = 0; i < particleCount; i++) {
      const idx = i * 3
      
      // Award-winning initial distribution with organic clustering
      const clusterRadius = 0.28
      const clusterAngle = Math.random() * Math.PI * 2
      const clusterDist = Math.random() * clusterRadius
      const baseX = x + Math.cos(clusterAngle) * clusterDist
      const baseY = y + Math.sin(clusterAngle) * clusterDist
      
      // Add micro-variation for natural feel
      const microSpread = 0.12
      particles[idx] = baseX + (Math.random() - 0.5) * microSpread
      particles[idx + 1] = baseY + (Math.random() - 0.5) * microSpread
      particles[idx + 2] = 1 + (Math.random() - 0.5) * 0.45
      
      // Award-winning velocity distribution with sophisticated physics
      const speedVariation = Math.random()
      let speed: number
      let speedMultiplier = 1.0
      
      if (speedVariation < 0.2) {
        // Ultra-fast particles (20%) - explosive leading edge
        speed = 7 + Math.random() * 10
        speedMultiplier = 1.15
      } else if (speedVariation < 0.5) {
        // Fast particles (30%) - primary burst
        speed = 5 + Math.random() * 7
        speedMultiplier = 1.05
      } else if (speedVariation < 0.8) {
        // Medium particles (30%) - main body
        speed = 3 + Math.random() * 5
      } else {
        // Slow particles (20%) - trailing sparkles
        speed = 1.5 + Math.random() * 3.5
        speedMultiplier = 0.9
      }
      
      // Radial velocity with sophisticated vertical bias
      const angle = Math.random() * Math.PI * 2
      const verticalBias = (Math.random() - 0.2) * 3.0
      
      // Award-winning spiral motion with varying intensities
      const spiralChance = Math.random()
      let spiralAmount = 0
      if (spiralChance < 0.4) {
        spiralAmount = 0.7 + Math.random() * 0.5 // Strong spiral
      } else if (spiralChance < 0.7) {
        spiralAmount = 0.3 + Math.random() * 0.3 // Medium spiral
      }
      const spiralAngle = angle + spiralAmount
      
      velocities[idx] = Math.cos(spiralAngle) * speed * speedMultiplier
      velocities[idx + 1] = Math.sin(spiralAngle) * speed * speedMultiplier + verticalBias
      velocities[idx + 2] = (Math.random() - 0.5) * speed * 0.5
      
      // Award-winning color selection with intelligent gradients
      const colorVariation = Math.random()
      let color: THREE.Color
      
      // Create color zones for visual hierarchy
      if (colorVariation < 0.15) {
        // Core colors (15%) - brightest, most saturated
        const coreColors = [0, 1, 2, 3, 4] // Brightest palette indices
        color = colorPalette[coreColors[Math.floor(Math.random() * coreColors.length)]].clone()
        color.multiplyScalar(1.0 + Math.random() * 0.2) // Extra bright
      } else if (colorVariation < 0.5) {
        // Primary colors (35%) - main sparkle body
        const primaryColors = [0, 1, 2, 3, 4, 5, 6]
        color = colorPalette[primaryColors[Math.floor(Math.random() * primaryColors.length)]].clone()
        color.multiplyScalar(0.9 + Math.random() * 0.15)
      } else if (colorVariation < 0.85) {
        // Secondary colors (35%) - supporting sparkles
        const secondaryColors = [4, 5, 6, 7, 8, 9]
        color = colorPalette[secondaryColors[Math.floor(Math.random() * secondaryColors.length)]].clone()
        color.multiplyScalar(0.8 + Math.random() * 0.15)
      } else {
        // Accent colors (15%) - subtle highlights
        const accentColors = [7, 8, 9, 10, 11]
        color = colorPalette[accentColors[Math.floor(Math.random() * accentColors.length)]].clone()
        color.multiplyScalar(0.75 + Math.random() * 0.15)
      }
      
      colors[idx] = color.r
      colors[idx + 1] = color.g
      colors[idx + 2] = color.b
      
      // Award-winning size distribution with perfect hierarchy
      const sizeVariation = Math.random()
      if (sizeVariation < 0.1) {
        // Ultra-large sparkles (10%) - dramatic focal points
        sizes[i] = 0.7 + Math.random() * 0.8
      } else if (sizeVariation < 0.3) {
        // Large sparkles (20%) - primary highlights
        sizes[i] = 0.45 + Math.random() * 0.5
      } else if (sizeVariation < 0.6) {
        // Medium sparkles (30%) - main body
        sizes[i] = 0.28 + Math.random() * 0.4
      } else {
        // Small sparkles (40%) - ambient sparkle field
        sizes[i] = 0.15 + Math.random() * 0.25
      }
    }
    
    const explosion: Explosion = {
      id: ws.nextExplosionId++,
      position: new THREE.Vector3(x, y, 1),
      startTime: clock.elapsedTime,
      particles,
      velocities,
      colors,
      sizes,
    }
    
    setExplosions(prev => [...prev, explosion])
  }, [clock, whipState])
  
  const removeExplosion = useCallback((id: number) => {
    setExplosions(prev => prev.filter(e => e.id !== id))
  }, [])
  
  useFrame(() => {
    const ws = whipState.current
    
    if (ws.isDragging) {
      // Calculate velocity magnitude
      const velocityMag = Math.sqrt(ws.velocity.x ** 2 + ws.velocity.y ** 2)
      const currentTime = clock.elapsedTime
      
      // Check for jab (sudden velocity spike)
      if (velocityMag > JAB_VELOCITY_THRESHOLD && 
          currentTime - ws.lastJabTime > JAB_COOLDOWN) {
        
        // Create explosion at approximate whip tip position
        // Scale targetX/Y to match 3D world coordinates
        const explosionX = ws.targetX * 1.5 + ws.sceneOffsetX
        const explosionY = ws.targetY * 1.5 + ws.sceneOffsetY
        
        createExplosion(explosionX, explosionY)
        ws.lastJabTime = currentTime
      }
    }
  })
  
  return (
    <>
      {explosions.map(explosion => (
        <ExplosionParticles
          key={explosion.id}
          explosion={explosion}
          onComplete={removeExplosion}
        />
      ))}
    </>
  )
}

// Velocity decay component (mouse tracking is now handled globally)
function VelocityDecay({ whipState }: { whipState: React.MutableRefObject<WhipState> }) {
  useFrame(() => {
    const ws = whipState.current
    
    if (!ws.isDragging) {
      // Decay velocity when not dragging
      ws.velocity.x *= 0.92
      ws.velocity.y *= 0.92
      
      // Decay target position back toward center
      ws.targetX *= 0.98
      ws.targetY *= 0.98
    }
  })
  
  return null
}

// Loading fallback
function LoadingFallback() {
  return (
    <mesh>
      <sphereGeometry args={[0.5, 16, 16]} />
      <meshBasicMaterial color="#00D4FF" wireframe />
    </mesh>
  )
}

// Scene setup with optimized counts
function Scene({ whipState, segmentCount, particleCount }: { 
  whipState: React.MutableRefObject<WhipState>
  segmentCount: number
  particleCount: number
}) {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} color="#ffffff" />
      <pointLight position={[-3, 2, 2]} intensity={1.5} color="#00D4FF" distance={10} />
      <pointLight position={[3, -2, 1]} intensity={1} color="#4DA6FF" distance={8} />
      
      <VelocityDecay whipState={whipState} />
      <Whip whipState={whipState} segmentCount={segmentCount} />
      <GlowParticles whipState={whipState} particleCount={particleCount} />
      <ExplosionManager whipState={whipState} />
    </>
  )
}

// Main exported component
export function Whip3D() {
  const whipState = useRef<WhipState>({
    isDragging: false,
    isHovering: false,
    mouseX: 0,
    mouseY: 0,
    targetX: 0,
    targetY: 0,
    returnProgress: 1,
    velocity: { x: 0, y: 0 },
    sceneOffsetX: 0,
    sceneOffsetY: 0,
    lastJabTime: 0,
    explosions: [],
    nextExplosionId: 0,
  })
  
  const containerRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isHovering, setIsHovering] = useState(false)
  const lastMousePos = useRef({ x: 0, y: 0 })
  const originalCenter = useRef({ x: 0, y: 0 }) // Store original center when drag starts
  
  // Get optimized counts on mount (stable values)
  const segmentCount = useMemo(() => getSegmentCount(), [])
  const particleCount = useMemo(() => getParticleCount(), [])
  const dpr = useMemo(() => getCappedDpr(), [])
  
  // Convert page coordinates to normalized coordinates relative to original container center
  const pageToNormalized = useCallback((pageX: number, pageY: number) => {
    const centerX = originalCenter.current.x
    const centerY = originalCenter.current.y
    
    // Calculate distance from original center, normalized but allowing values beyond -1 to 1
    // Use viewport dimensions for larger range
    const x = (pageX - centerX) / (window.innerWidth / 3)
    const y = -(pageY - centerY) / (window.innerHeight / 3) // Invert Y for 3D coords
    
    return { x, y }
  }, [])
  
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault()
    
    // Store original center position before expanding to full viewport
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      originalCenter.current = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      }
      
      // Calculate scene offset to keep whip at original visual position
      // Convert pixel offset to 3D world units (approximate based on camera FOV and distance)
      const viewportCenterX = window.innerWidth / 2
      const viewportCenterY = window.innerHeight / 2
      const pixelOffsetX = originalCenter.current.x - viewportCenterX
      const pixelOffsetY = originalCenter.current.y - viewportCenterY
      
      // Convert to 3D units (camera is at z=4.5 with fov=50)
      // At z=4.5 with fov=50, viewport height ≈ 4.2 units
      const unitsPerPixel = 4.2 / window.innerHeight
      whipState.current.sceneOffsetX = pixelOffsetX * unitsPerPixel
      whipState.current.sceneOffsetY = -pixelOffsetY * unitsPerPixel // Invert Y
    }
    
    const normalized = pageToNormalized(e.pageX, e.pageY)
    lastMousePos.current = normalized
    whipState.current.targetX = normalized.x
    whipState.current.targetY = normalized.y
    whipState.current.isDragging = true
    whipState.current.returnProgress = 0
    
    // Use requestAnimationFrame to ensure smooth transition start
    requestAnimationFrame(() => {
      setIsDragging(true)
    })
  }, [pageToNormalized])
  
  // Global pointer move handler - works across the entire page
  useEffect(() => {
    if (!isDragging) return
    
    const handleGlobalPointerMove = (e: PointerEvent) => {
      const normalized = pageToNormalized(e.pageX, e.pageY)
      
      // Calculate velocity
      whipState.current.velocity.x = (normalized.x - lastMousePos.current.x) * 15
      whipState.current.velocity.y = (normalized.y - lastMousePos.current.y) * 15
      
      // Update target
      whipState.current.targetX = normalized.x
      whipState.current.targetY = normalized.y
      
      lastMousePos.current = normalized
    }
    
    const handleGlobalPointerUp = () => {
      whipState.current.isDragging = false
      whipState.current.returnProgress = 0
      setIsDragging(false)
    }
    
    // Add global listeners
    window.addEventListener('pointermove', handleGlobalPointerMove)
    window.addEventListener('pointerup', handleGlobalPointerUp)
    
    return () => {
      window.removeEventListener('pointermove', handleGlobalPointerMove)
      window.removeEventListener('pointerup', handleGlobalPointerUp)
    }
  }, [isDragging, pageToNormalized])
  
  // Handle escape key to cancel drag
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && whipState.current.isDragging) {
        whipState.current.isDragging = false
        whipState.current.returnProgress = 0
        setIsDragging(false)
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])
  
  // Check if mobile on mount and enable hover state by default on mobile
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const mobile = isMobileDevice()
    setIsMobile(mobile)
    // On mobile, enable the pulsing glow effect by default
    if (mobile) {
      whipState.current.isHovering = true
    }
  }, [])

  const handleMouseEnter = useCallback(() => {
    setIsHovering(true)
    whipState.current.isHovering = true
  }, [])

  const handleMouseLeave = useCallback(() => {
    setIsHovering(false)
    whipState.current.isHovering = false
  }, [])

  // Show hint when hovering (desktop) or always on mobile, but not when dragging
  const showClickHint = (isHovering || isMobile) && !isDragging
  
  return (
    <div 
      ref={containerRef}
      className={`whip-3d-container ${isDragging ? 'whipping' : ''}`}
      onPointerDown={handlePointerDown}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      aria-label="Hold and drag to whip"
    >
      <Canvas
        camera={{ position: [0, 0, 4.5], fov: 50 }}
        dpr={dpr} // Capped DPR for performance
        gl={{ 
          antialias: !isMobileDevice(), // Disable antialiasing on mobile
          alpha: true,
          powerPreference: 'high-performance'
        }}
        style={{ background: 'transparent', touchAction: 'none' }}
      >
        <Suspense fallback={<LoadingFallback />}>
          <Scene 
            whipState={whipState} 
            segmentCount={segmentCount}
            particleCount={particleCount}
          />
        </Suspense>
      </Canvas>
      
      <div className={`click-hold-hint ${showClickHint ? 'visible' : ''}`}>
        click + hold
      </div>
      
      {isDragging && (
        <div className="whip-hint">whip it vigorously | release to let go</div>
      )}
    </div>
  )
}
