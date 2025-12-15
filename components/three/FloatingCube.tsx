'use client'

import { Canvas, useFrame } from '@react-three/fiber'
import { RoundedBox, MeshWobbleMaterial } from '@react-three/drei'
import { useRef } from 'react'
import * as THREE from 'three'

/**
 * Animated floating cube
 */
function AnimatedCube() {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (!meshRef.current) return
    
    const time = state.clock.getElapsedTime()
    meshRef.current.rotation.x = time * 0.3
    meshRef.current.rotation.y = time * 0.4
    meshRef.current.position.y = Math.sin(time) * 0.3
  })

  return (
    <RoundedBox ref={meshRef} args={[2, 2, 2]} radius={0.1} smoothness={4}>
      <MeshWobbleMaterial
        color="#ff6b35"
        attach="material"
        factor={0.3}
        speed={2}
        roughness={0.1}
        metalness={0.9}
      />
    </RoundedBox>
  )
}

/**
 * Floating Cube Component
 * Small animated cube for cards/sections
 */
export function FloatingCube({ className = '' }: { className?: string }) {
  return (
    <div className={`w-32 h-32 ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} color="#ff6b35" intensity={0.5} />
        
        <AnimatedCube />
      </Canvas>
    </div>
  )
}

