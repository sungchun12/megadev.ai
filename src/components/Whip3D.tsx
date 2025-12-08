import { useRef, useMemo, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float } from '@react-three/drei'
import * as THREE from 'three'
import './Whip3D.css'

// Custom glowing material
const glowMaterial = new THREE.ShaderMaterial({
  uniforms: {
    time: { value: 0 },
    color: { value: new THREE.Color('#00D4FF') },
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
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    
    void main() {
      // Fresnel effect for edge glow
      vec3 viewDir = normalize(vViewPosition);
      float fresnel = pow(1.0 - abs(dot(viewDir, vNormal)), 2.0);
      
      // Pulsing glow
      float pulse = 0.7 + 0.3 * sin(time * 2.0);
      
      // Core color with fresnel glow
      vec3 coreColor = color * 0.9;
      vec3 glowColor = vec3(0.5, 1.0, 1.0);
      
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
}: { 
  index: number
  total: number
}) {
  const meshRef = useRef<THREE.Mesh>(null)
  const materialRef = useRef<THREE.ShaderMaterial>(glowMaterial.clone())
  const progress = index / total
  
  // Create arrow/chevron shape
  const geometry = useMemo(() => {
    const shape = new THREE.Shape()
    const size = 0.18 - progress * 0.06
    
    // Arrow/chevron pointing right
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
    
    // Update shader time
    if (materialRef.current.uniforms) {
      materialRef.current.uniforms.time.value = time
    }
    
    // Create flowing wave motion along the whip
    const waveOffset = index * 0.25
    const wave1 = Math.sin(time * 1.8 + waveOffset) * 0.12
    const wave2 = Math.cos(time * 1.3 + waveOffset * 0.8) * 0.08
    const wave3 = Math.sin(time * 0.9 + waveOffset * 1.2) * 0.06
    
    // Spiral path for the whip
    const angle = progress * Math.PI * 2.2 + time * 0.4
    const radius = 1.2 + progress * 1.0 + wave1
    
    const x = Math.cos(angle) * radius + wave2
    const y = Math.sin(angle) * radius * 0.7 + wave3
    const z = progress * 0.3 + Math.sin(time * 0.7 + index * 0.15) * 0.08
    
    meshRef.current.position.set(x, y, z)
    
    // Rotate to follow the path
    const nextAngle = angle + 0.15
    const tangentX = -Math.sin(nextAngle)
    const tangentY = Math.cos(nextAngle) * 0.7
    meshRef.current.rotation.z = Math.atan2(tangentY, tangentX) + Math.PI / 2
    meshRef.current.rotation.y = Math.sin(time * 0.6 + index * 0.08) * 0.15
  })

  return (
    <mesh ref={meshRef} geometry={geometry} material={materialRef.current} />
  )
}

// Whip tip - larger arrow head
function WhipTip() {
  const meshRef = useRef<THREE.Mesh>(null)
  const materialRef = useRef<THREE.ShaderMaterial>(glowMaterial.clone())
  
  const geometry = useMemo(() => {
    const shape = new THREE.Shape()
    const size = 0.25
    
    // Larger spear-like tip
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
    
    // Update shader time
    if (materialRef.current.uniforms) {
      materialRef.current.uniforms.time.value = time
    }
    
    // Position at the end of the whip spiral
    const progress = 1
    const waveOffset = 30 * 0.25
    const wave1 = Math.sin(time * 1.8 + waveOffset) * 0.12
    
    const angle = progress * Math.PI * 2.2 + time * 0.4
    const radius = 1.2 + progress * 1.0 + wave1
    
    const x = Math.cos(angle) * radius + Math.cos(time * 1.3 + 7) * 0.08
    const y = Math.sin(angle) * radius * 0.7 + Math.sin(time * 0.9 + 10) * 0.06 - 0.3
    const z = progress * 0.3 + Math.sin(time * 0.7 + 30 * 0.15) * 0.08 + 0.15
    
    meshRef.current.position.set(x, y, z)
    
    // Point in direction of movement
    const nextAngle = angle + 0.15
    const tangentX = -Math.sin(nextAngle)
    const tangentY = Math.cos(nextAngle) * 0.7
    meshRef.current.rotation.z = Math.atan2(tangentY, tangentX)
    meshRef.current.rotation.y = Math.sin(time * 0.6) * 0.2
  })

  return (
    <mesh ref={meshRef} geometry={geometry} material={materialRef.current} />
  )
}

// Main whip assembly
function Whip() {
  const groupRef = useRef<THREE.Group>(null)
  const segmentCount = 30
  
  useFrame((state) => {
    if (!groupRef.current) return
    const time = state.clock.elapsedTime
    
    // Gentle overall sway
    groupRef.current.rotation.x = Math.sin(time * 0.25) * 0.04
    groupRef.current.rotation.y = Math.cos(time * 0.18) * 0.04
  })

  return (
    <group ref={groupRef}>
      <Float
        speed={1.5}
        rotationIntensity={0.15}
        floatIntensity={0.25}
      >
        {/* Whip segments */}
        {Array.from({ length: segmentCount }).map((_, i) => (
          <WhipSegment
            key={i}
            index={i}
            total={segmentCount}
          />
        ))}
        
        {/* Whip tip */}
        <WhipTip />
      </Float>
    </group>
  )
}

// Ambient glow particles
function GlowParticles() {
  const particlesRef = useRef<THREE.Points>(null)
  const count = 40
  
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
    if (!particlesRef.current) return
    const time = state.clock.elapsedTime
    
    particlesRef.current.rotation.z = time * 0.08
    particlesRef.current.rotation.y = Math.sin(time * 0.15) * 0.08
  })

  return (
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
  )
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
function Scene() {
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} color="#ffffff" />
      <pointLight position={[-3, 2, 2]} intensity={1.5} color="#00D4FF" distance={10} />
      <pointLight position={[3, -2, 1]} intensity={1} color="#4DA6FF" distance={8} />
      
      {/* The whip */}
      <Whip />
      
      {/* Ambient particles */}
      <GlowParticles />
    </>
  )
}

// Main exported component
export function Whip3D({ onClick }: { onClick?: () => void }) {
  return (
    <div 
      className="whip-3d-container" 
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick?.()
        }
      }}
      aria-label="Click to visit claiw on GitHub"
    >
      <Canvas
        camera={{ position: [0, 0, 4.5], fov: 50 }}
        gl={{ 
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance'
        }}
        style={{ background: 'transparent' }}
      >
        <Suspense fallback={<LoadingFallback />}>
          <Scene />
        </Suspense>
      </Canvas>
    </div>
  )
}
