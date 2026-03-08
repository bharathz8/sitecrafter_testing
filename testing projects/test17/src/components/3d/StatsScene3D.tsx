import React, { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Sparkles, useScroll, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

/**
 * StatPillar Component
 * Represents a single animated 3D bar/pillar for the stats section.
 * Reacts to scroll position and hover states.
 */
const StatPillar = ({ 
  position, 
  maxHeight, 
  color, 
  index 
}: { 
  position: [number, number, number], 
  maxHeight: number, 
  color: string, 
  index: number 
}) => {
  const meshRef = useRef<THREE.Mesh>(null!);
  const scroll = useScroll();
  const [hovered, setHovered] = useState(false);

  // Initial random offset for organic floating feel
  const randomOffset = useMemo(() => Math.random() * Math.PI * 2, []);

  useFrame((state) => {
    if (!meshRef.current) return;

    const time = state.clock.elapsedTime;
    
    // The stats section is typically in the middle/bottom of the page.
    // We calculate a visibility factor based on scroll offset.
    // Assuming stats are roughly in the 0.4 to 0.7 range of the scrollable area.
    const scrollOffset = scroll.offset;
    const activationThreshold = 0.3;
    const growthFactor = THREE.MathUtils.smoothstep(scrollOffset, activationThreshold, activationThreshold + 0.2);
    
    // Base height calculation: scroll growth + subtle idle breathing
    const breathing = Math.sin(time * 1.5 + randomOffset) * 0.15;
    const targetYScale = (maxHeight * growthFactor) + breathing + 0.1; // Ensure it's never 0
    
    // Smoothly lerp the scale
    meshRef.current.scale.y = THREE.MathUtils.lerp(
      meshRef.current.scale.y, 
      targetYScale, 
      0.08
    );

    // Adjust position so the base stays at Y=0
    meshRef.current.position.y = meshRef.current.scale.y / 2;

    // Hover effect: scale width/depth and boost emissive intensity
    const hoverScale = hovered ? 1.25 : 1.0;
    meshRef.current.scale.x = THREE.MathUtils.lerp(meshRef.current.scale.x, hoverScale, 0.15);
    meshRef.current.scale.z = THREE.MathUtils.lerp(meshRef.current.scale.z, hoverScale, 0.15);

    // Dynamic rotation based on time
    meshRef.current.rotation.y = Math.sin(time * 0.5 + index) * 0.1;
  });

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onPointerOver={() => {
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = 'default';
        }}
      >
        <boxGeometry args={[0.8, 1, 0.8]} />
        <meshPhysicalMaterial
          color={color}
          emissive={color}
          emissiveIntensity={hovered ? 2.5 : 0.8}
          metalness={0.9}
          roughness={0.1}
          clearcoat={1}
          clearcoatRoughness={0.1}
        />
      </mesh>
      
      {/* Decorative "Energy Ring" at the base */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.01, 0]}>
        <torusGeometry args={[0.6, 0.02, 16, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.3} />
      </mesh>
    </group>
  );
};

/**
 * StatsScene3D
 * Cinematic 3D fragment for the Aethelgard Arboretum stats section.
 * Features 5 pillars representing different growth metrics.
 */
export const StatsScene3D = () => {
  // Theme colors: primary=#ef4444, secondary=#f97316, accent=#fbbf24
  const statsData = [
    { pos: [-3, 0, 0], height: 4.5, color: "#ef4444" }, // Students Enrolled
    { pos: [-1.5, 0, 1], height: 3.2, color: "#f97316" }, // Courses Available
    { pos: [0, 0, 0], height: 5.5, color: "#fbbf24" }, // Expert Instructors
    { pos: [1.5, 0, 1], height: 2.8, color: "#ef4444" }, // Success Rate
    { pos: [3, 0, 0], height: 4.0, color: "#f97316" }, // Community Members
  ];

  return (
    <>
      {/* Cinematic Lighting */}
      <ambientLight intensity={0.2} />
      <spotLight 
        position={[10, 20, 10]} 
        angle={0.15} 
        penumbra={1} 
        intensity={2} 
        color="#fbbf24" 
        castShadow 
      />
      <pointLight position={[-10, -10, -10]} intensity={1} color="#ef4444" />
      <directionalLight position={[0, 5, 5]} intensity={0.5} color="#ffffff" />

      {/* Atmospheric Fog - Fiery Dark Tone */}
      <fog attach="fog" args={["#1c1917", 5, 25]} />

      {/* Floating Elements for Serenity Theme */}
      <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
        <group position={[0, 2, -5]}>
          <Sparkles 
            count={60} 
            scale={12} 
            size={3} 
            speed={0.4} 
            color="#fbbf24" 
            opacity={0.6} 
          />
        </group>
      </Float>

      {/* Main Stats Pillars */}
      <group position={[0, -2, 0]}>
        {statsData.map((stat, i) => (
          <StatPillar 
            key={i}
            index={i}
            position={stat.pos as [number, number, number]}
            maxHeight={stat.height}
            color={stat.color}
          />
        ))}

        {/* Ground Shadows and Reflections */}
        <ContactShadows 
          position={[0, 0, 0]} 
          opacity={0.4} 
          scale={15} 
          blur={2.5} 
          far={4} 
          color="#000000" 
        />
        
        {/* Subtle Grid Base */}
        <mesh rotation-x={-Math.PI / 2} position={[0, -0.05, 0]}>
          <planeGeometry args={[20, 20]} />
          <meshStandardMaterial 
            color="#1c1917" 
            transparent 
            opacity={0.5} 
            roughness={1}
          />
        </mesh>
      </group>

      {/* Distant background particles */}
      <Sparkles 
        count={40} 
        scale={20} 
        size={1.5} 
        speed={0.2} 
        color="#f97316" 
      />
    </>
  );
};

export default StatsScene3D;