'use client'

import { Canvas, useFrame } from '@react-three/fiber'
import { Points, PointMaterial } from '@react-three/drei'
import { useRef, useMemo } from 'react'
import * as THREE from 'three'

/**
 * Animated particle field
 */
function Particles({ count = 2000 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null)
  
  // Generate random particle positions
  const positions = useMemo(() => {
    const positions = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      // Create a bat-wing-like distribution
      const angle = Math.random() * Math.PI * 2
      const radius = Math.random() * 10 + 5
      const y = (Math.random() - 0.5) * 10
      
      positions[i * 3] = Math.cos(angle) * radius
      positions[i * 3 + 1] = y
      positions[i * 3 + 2] = Math.sin(angle) * radius
    }
    return positions
  }, [count])

  // Animate particles
  useFrame((state) => {
    if (!ref.current) return
    
    const time = state.clock.getElapsedTime()
    ref.current.rotation.y = time * 0.05
    ref.current.rotation.x = Math.sin(time * 0.1) * 0.1
  })

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#ff6b35"
        size={0.05}
        sizeAttenuation={true}
        depthWrite={false}
        opacity={0.6}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  )
}

/**
 * Particle Field Component
 * Background particle animation
 */
export function ParticleField() {
  return (
    <div className="absolute inset-0 -z-10 opacity-40">
      <Canvas
        camera={{ position: [0, 0, 10], fov: 75 }}
        style={{ background: 'transparent' }}
      >
        <Particles count={2000} />
      </Canvas>
    </div>
  )
}

