'use client'

import { Canvas, useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'

/**
 * Animated wave mesh
 */
function WaveMesh() {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (!meshRef.current) return
    
    const time = state.clock.getElapsedTime()
    const position = meshRef.current.geometry.attributes.position
    
    // Animate vertices
    for (let i = 0; i < position.count; i++) {
      const x = position.getX(i)
      const y = position.getY(i)
      
      const wave1 = Math.sin(x * 0.5 + time) * 0.3
      const wave2 = Math.sin(y * 0.5 + time * 0.5) * 0.2
      
      position.setZ(i, wave1 + wave2)
    }
    
    position.needsUpdate = true
    meshRef.current.rotation.z = time * 0.05
  })

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 4, 0, 0]} position={[0, -2, 0]}>
      <planeGeometry args={[20, 20, 50, 50]} />
      <meshStandardMaterial
        color="#ff6b35"
        wireframe
        transparent
        opacity={0.2}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}

/**
 * Wave Background Component
 * Animated wireframe wave for backgrounds
 */
export function WaveBackground() {
  return (
    <div className="absolute inset-0 -z-10">
      <Canvas
        camera={{ position: [0, 5, 10], fov: 60 }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[0, 10, 5]} intensity={1} color="#ff6b35" />
        
        <WaveMesh />
      </Canvas>
    </div>
  )
}

