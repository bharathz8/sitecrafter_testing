import React, { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Float, Sparkles, ContactShadows, useScroll, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

/**
 * TestimonialPanel
 * Individual floating glass-like panel representing a testimonial card.
 */
const TestimonialPanel = ({ 
  position, 
  rotation, 
  speed, 
  color, 
  index 
}: { 
  position: [number, number, number], 
  rotation: [number, number, number], 
  speed: number, 
  color: string,
  index: number 
}) => {
  const meshRef = useRef<THREE.Mesh>(null!);
  
  // Subtle hover animation logic
  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime();
    // Individual subtle internal wobble
    meshRef.current.rotation.z = Math.sin(t * 0.5 + index) * 0.05;
  });

  return (
    <Float 
      speed={speed} 
      rotationIntensity={0.5} 
      floatIntensity={0.5} 
      position={position}
    >
      <group rotation={rotation}>
        {/* Main Glass Panel */}
        <mesh 
          ref={meshRef}
          onPointerOver={() => { document.body.style.cursor = "pointer" }}
          onPointerOut={() => { document.body.style.cursor = "default" }}
        >
          <boxGeometry args={[3.5, 2, 0.1]} />
          <meshPhysicalMaterial 
            color={color}
            transparent
            opacity={0.4}
            roughness={0.1}
            metalness={0.3}
            clearcoat={1}
            clearcoatRoughness={0.1}
            reflectivity={0.9}
            emissive={color}
            emissiveIntensity={0.2}
          />
        </mesh>

        {/* Decorative Glowing Edge / Accent */}
        <mesh position={[0, 0, -0.06]}>
          <boxGeometry args={[3.6, 2.1, 0.02]} />
          <meshBasicMaterial color={color} transparent opacity={0.15} />
        </mesh>

        {/* Abstract "Avatar" Sphere */}
        <mesh position={[-1.2, 0.5, 0.15]}>
          <sphereGeometry args={[0.3, 32, 32]} />
          <MeshDistortMaterial 
            color={color} 
            speed={2} 
            distort={0.4} 
            radius={0.3} 
          />
        </mesh>
      </group>
    </Float>
  );
};

/**
 * TestimonialsScene3D
 * An immersive 3D scene featuring floating glass platforms in an arc for the testimonials section.
 * Theme: Fiery-dark (Sage Serenity with organic light).
 */
export const TestimonialsScene3D = () => {
  const groupRef = useRef<THREE.Group>(null!);
  const scroll = useScroll();
  const { viewport } = useThree();

  // Panel configuration for the arc
  const panels = useMemo(() => [
    { 
      pos: [-5, 1, -2] as [number, number, number], 
      rot: [0, 0.4, 0] as [number, number, number], 
      speed: 1.2, 
      color: "#ef4444" // Primary Red
    },
    { 
      pos: [-2, -1, 0] as [number, number, number], 
      rot: [0, 0.2, 0] as [number, number, number], 
      speed: 1.8, 
      color: "#f97316" // Secondary Orange
    },
    { 
      pos: [2, 1, 0] as [number, number, number], 
      rot: [0, -0.2, 0] as [number, number, number], 
      speed: 1.5, 
      color: "#fbbf24" // Accent Yellow
    },
    { 
      pos: [5, -1, -2] as [number, number, number], 
      rot: [0, -0.4, 0] as [number, number, number], 
      speed: 2.1, 
      color: "#ef4444" // Primary Red
    },
  ], []);

  useFrame((state) => {
    if (!groupRef.current) return;
    
    // Scroll-based rotation and movement
    const scrollOffset = scroll.offset; // 0 to 1
    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      scrollOffset * Math.PI * 0.5 - (Math.PI * 0.25),
      0.05
    );

    // Subtle drift
    const t = state.clock.getElapsedTime();
    groupRef.current.position.y = Math.sin(t * 0.2) * 0.1;
  });

  return (
    <>
      {/* Cinematic Lighting */}
      <ambientLight intensity={0.2} />
      <spotLight 
        position={[10, 10, 10]} 
        angle={0.15} 
        penumbra={1} 
        intensity={2} 
        color="#fbbf24" 
        castShadow 
      />
      <pointLight position={[-10, -5, -5]} intensity={1.5} color="#ef4444" />
      <pointLight position={[0, 5, 5]} intensity={0.5} color="#ffffff" />
      
      {/* Atmosphere */}
      <fog attach="fog" args={["#1c1917", 5, 25]} />
      <Sparkles 
        count={60} 
        scale={15} 
        size={2.5} 
        speed={0.4} 
        color="#f97316" 
        opacity={0.6}
      />

      {/* Content Group */}
      <group ref={groupRef}>
        {panels.map((panel, i) => (
          <TestimonialPanel 
            key={i}
            index={i}
            position={panel.pos}
            rotation={panel.rot}
            speed={panel.speed}
            color={panel.color}
          />
        ))}

        {/* Background Decorative Element: Large Distorted Orb */}
        <Float speed={0.5} rotationIntensity={2} floatIntensity={0.5}>
          <mesh position={[0, 0, -8]} scale={4}>
            <icosahedronGeometry args={[1, 2]} />
            <meshPhysicalMaterial 
              color="#1c1917"
              emissive="#ef4444"
              emissiveIntensity={0.05}
              wireframe
              transparent
              opacity={0.1}
            />
          </mesh>
        </Float>
      </group>

      {/* Floor Shadows for Depth */}
      <ContactShadows 
        position={[0, -4, 0]} 
        opacity={0.4} 
        scale={20} 
        blur={2.5} 
        far={4.5} 
        color="#000000"
      />
    </>
  );
};

export default TestimonialsScene3D;