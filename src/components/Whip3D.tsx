import { useRef, useMemo, Suspense, useState, useCallback, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float } from '@react-three/drei'
import * as THREE from 'three'
import './Whip3D.css'

// Shared state for mouse interaction
interface WhipState {
  isDragging: boolean
  mouseX: number
  mouseY: number
  targetX: number
  targetY: number
  returnProgress: number
  velocity: { x: number; y: number }
  sceneOffsetX: number
  sceneOffsetY: number
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
      bevelSegments: 2,
    }
    
    return new THREE.ExtrudeGeometry(shape, extrudeSettings)
  }, [progress])

  useFrame((state) => {
    if (!meshRef.current) return
    
    const time = state.clock.elapsedTime
    const ws = whipState.current
    
    // Update shader time and intensity
    if (materialRef.current.uniforms) {
      materialRef.current.uniforms.time.value = time
      // Glow more intensely when being whipped
      const targetIntensity = ws.isDragging ? 1.5 : 1.0
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
    
    // Rotate to follow the path (accounting for offset)
    const nextAngle = angle + 0.15
    const tangentX = -Math.sin(nextAngle) + currentOffset.current.x * 0.3
    const tangentY = Math.cos(nextAngle) * 0.7 + currentOffset.current.y * 0.3
    meshRef.current.rotation.z = Math.atan2(tangentY, tangentX) + Math.PI / 2
    meshRef.current.rotation.y = Math.sin(time * 0.6 + index * 0.08) * 0.15 + currentOffset.current.x * 0.2
  })

  return (
    <mesh ref={meshRef} geometry={geometry} material={materialRef.current} />
  )
}

// Whip tip - larger arrow head
function WhipTip({ whipState }: { whipState: React.MutableRefObject<WhipState> }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const materialRef = useRef<THREE.ShaderMaterial>(createGlowMaterial())
  const currentOffset = useRef({ x: 0, y: 0 })
  
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
      bevelSegments: 3,
    }
    
    return new THREE.ExtrudeGeometry(shape, extrudeSettings)
  }, [])

  useFrame((state) => {
    if (!meshRef.current) return
    
    const time = state.clock.elapsedTime
    const ws = whipState.current
    
    if (materialRef.current.uniforms) {
      materialRef.current.uniforms.time.value = time
      const targetIntensity = ws.isDragging ? 1.8 : 1.0
      materialRef.current.uniforms.intensity.value += (targetIntensity - materialRef.current.uniforms.intensity.value) * 0.1
    }
    
    const progress = 1
    const waveOffset = 30 * 0.25
    const wave1 = Math.sin(time * 1.8 + waveOffset) * 0.12
    
    const angle = progress * Math.PI * 2.2 + time * 0.4
    const radius = 1.2 + progress * 1.0 + wave1
    
    const idleX = Math.cos(angle) * radius + Math.cos(time * 1.3 + 7) * 0.08
    const idleY = Math.sin(angle) * radius * 0.7 + Math.sin(time * 0.9 + 10) * 0.06 - 0.3
    const idleZ = progress * 0.3 + Math.sin(time * 0.7 + 30 * 0.15) * 0.08 + 0.15
    
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
    
    const nextAngle = angle + 0.15
    const tangentX = -Math.sin(nextAngle) + currentOffset.current.x * 0.4
    const tangentY = Math.cos(nextAngle) * 0.7 + currentOffset.current.y * 0.4
    meshRef.current.rotation.z = Math.atan2(tangentY, tangentX)
    meshRef.current.rotation.y = Math.sin(time * 0.6) * 0.2 + currentOffset.current.x * 0.3
  })

  return (
    <mesh ref={meshRef} geometry={geometry} material={materialRef.current} />
  )
}

// Main whip assembly
function Whip({ whipState }: { whipState: React.MutableRefObject<WhipState> }) {
  const groupRef = useRef<THREE.Group>(null)
  const offsetGroupRef = useRef<THREE.Group>(null)
  const segmentCount = 30
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
          <WhipTip whipState={whipState} />
        </Float>
      </group>
    </group>
  )
}

// Ambient glow particles
function GlowParticles({ whipState }: { whipState: React.MutableRefObject<WhipState> }) {
  const groupRef = useRef<THREE.Group>(null)
  const particlesRef = useRef<THREE.Points>(null)
  const count = 40
  const currentOffset = useRef({ x: 0, y: 0 })
  
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 * 2.2
      const radius = 1.2 + (i / count) * 1.0
      pos[i * 3] = Math.cos(angle) * radius + (Math.random() - 0.5) * 0.4
      pos[i * 3 + 1] = Math.sin(angle) * radius * 0.7 + (Math.random() - 0.5) * 0.4
      pos[i * 3 + 2] = (i / count) * 0.3 + (Math.random() - 0.5) * 0.2
    }
    return pos
  }, [])

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
            count={count}
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

// Scene setup
function Scene({ whipState }: { whipState: React.MutableRefObject<WhipState> }) {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} color="#ffffff" />
      <pointLight position={[-3, 2, 2]} intensity={1.5} color="#00D4FF" distance={10} />
      <pointLight position={[3, -2, 1]} intensity={1} color="#4DA6FF" distance={8} />
      
      <VelocityDecay whipState={whipState} />
      <Whip whipState={whipState} />
      <GlowParticles whipState={whipState} />
    </>
  )
}

// Main exported component
export function Whip3D() {
  const whipState = useRef<WhipState>({
    isDragging: false,
    mouseX: 0,
    mouseY: 0,
    targetX: 0,
    targetY: 0,
    returnProgress: 1,
    velocity: { x: 0, y: 0 },
    sceneOffsetX: 0,
    sceneOffsetY: 0,
  })
  
  const containerRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const lastMousePos = useRef({ x: 0, y: 0 })
  const originalCenter = useRef({ x: 0, y: 0 }) // Store original center when drag starts
  
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
    setIsDragging(true)
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
  
  return (
    <div 
      ref={containerRef}
      className={`whip-3d-container ${isDragging ? 'whipping' : ''}`}
      onPointerDown={handlePointerDown}
      aria-label="Hold and drag to whip"
    >
      <Canvas
        camera={{ position: [0, 0, 4.5], fov: 50 }}
        gl={{ 
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance'
        }}
        style={{ background: 'transparent', touchAction: 'none' }}
      >
        <Suspense fallback={<LoadingFallback />}>
          <Scene whipState={whipState} />
        </Suspense>
      </Canvas>
      
      {isDragging && (
        <div className="whip-hint">Release to let go</div>
      )}
    </div>
  )
}
