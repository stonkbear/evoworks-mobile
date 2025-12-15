'use client'

import { Canvas } from '@react-three/fiber'
import { OrbitControls, Float, MeshDistortMaterial, Sphere } from '@react-three/drei'
import { useRef } from 'react'
import * as THREE from 'three'

/**
 * Animated 3D sphere with distortion effect
 */
function AnimatedSphere({ position, color, speed }: { position: [number, number, number], color: string, speed: number }) {
  const meshRef = useRef<THREE.Mesh>(null)

  return (
    <Float speed={speed} rotationIntensity={1} floatIntensity={2}>
      <Sphere ref={meshRef} args={[1, 64, 64]} position={position}>
        <MeshDistortMaterial
          color={color}
          attach="material"
          distort={0.4}
          speed={2}
          roughness={0.2}
          metalness={0.8}
        />
      </Sphere>
    </Float>
  )
}

/**
 * Floating geometric shapes
 */
function FloatingShapes() {
  return (
    <>
      <AnimatedSphere position={[3, 1, 0]} color="#ff6b35" speed={1.5} />
      <AnimatedSphere position={[-3, -1, 0]} color="#ff8555" speed={1.2} />
      <AnimatedSphere position={[0, 2, -2]} color="#ff6b35" speed={1.8} />
    </>
  )
}

/**
 * 3D Hero Scene Component
 * Animated background for homepage
 */
export function HeroScene() {
  return (
    <div className="absolute inset-0 -z-10">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 45 }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} color="#ff6b35" intensity={0.5} />
        
        <FloatingShapes />
        
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.5}
          maxPolarAngle={Math.PI / 2}
          minPolarAngle={Math.PI / 2}
        />
      </Canvas>
    </div>
  )
}

