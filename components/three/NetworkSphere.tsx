'use client'

import { Canvas, useFrame } from '@react-three/fiber'
import { Sphere } from '@react-three/drei'
import { useRef, useMemo } from 'react'
import * as THREE from 'three'

/**
 * Network connection lines
 */
function NetworkLines() {
  const linesRef = useRef<THREE.LineSegments>(null)
  
  const { positions, colors } = useMemo(() => {
    const positions = []
    const colors = []
    const nodes = 50
    const radius = 3
    
    // Create nodes on sphere surface
    const nodePositions = []
    for (let i = 0; i < nodes; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      
      const x = radius * Math.sin(phi) * Math.cos(theta)
      const y = radius * Math.sin(phi) * Math.sin(theta)
      const z = radius * Math.cos(phi)
      
      nodePositions.push(new THREE.Vector3(x, y, z))
    }
    
    // Connect nearby nodes
    for (let i = 0; i < nodes; i++) {
      for (let j = i + 1; j < nodes; j++) {
        if (nodePositions[i].distanceTo(nodePositions[j]) < 2.5) {
          positions.push(
            nodePositions[i].x, nodePositions[i].y, nodePositions[i].z,
            nodePositions[j].x, nodePositions[j].y, nodePositions[j].z
          )
          
          // Orange color with varying opacity
          const opacity = Math.random() * 0.5 + 0.2
          colors.push(1, 0.42, 0.21, opacity)
          colors.push(1, 0.42, 0.21, opacity)
        }
      }
    }
    
    return {
      positions: new Float32Array(positions),
      colors: new Float32Array(colors)
    }
  }, [])

  useFrame((state) => {
    if (!linesRef.current) return
    linesRef.current.rotation.y = state.clock.getElapsedTime() * 0.1
    linesRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.2) * 0.2
  })

  return (
    <lineSegments ref={linesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={colors.length / 4}
          array={colors}
          itemSize={4}
        />
      </bufferGeometry>
      <lineBasicMaterial
        vertexColors
        transparent
        opacity={0.6}
        blending={THREE.AdditiveBlending}
      />
    </lineSegments>
  )
}

/**
 * Network Sphere Component
 * Animated network visualization (AI agent connections)
 */
export function NetworkSphere({ className = '' }: { className?: string }) {
  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 8], fov: 50 }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={0.5} />
        
        <Sphere args={[3, 32, 32]}>
          <meshBasicMaterial
            color="#0a0a0a"
            wireframe
            transparent
            opacity={0.1}
          />
        </Sphere>
        
        <NetworkLines />
      </Canvas>
    </div>
  )
}

