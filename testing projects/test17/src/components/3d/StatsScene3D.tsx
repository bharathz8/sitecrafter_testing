import React, { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Float, Sparkles, ContactShadows, useScroll } from '@react-three/drei';
import * as THREE from 'three';

/**
 * Individual Stat Pillar Component
 * Animates scale and position to create a "growing" effect.
 */
const StatPillar = ({ 
  position, 
  color, 
  targetHeight, 
  delay 
}: { 
  position: [number, number, number], 
  color: string, 
  targetHeight: number, 
  delay: number 
}) => {
  const meshRef = useRef<THREE.Mesh>(null!);
  const scroll = useScroll();

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    
    // Calculate scroll influence (0 to 1)
    const scrollOffset = scroll ? scroll.offset : 0;
    
    // Base growth animation + subtle breathing
    // We want the pillars to grow based on scroll but also have a default "entry" animation
    const entryAnimation = Math.min(1, time * 0.5 - delay);
    const growthFactor = THREE.MathUtils.lerp(0.1, targetHeight, entryAnimation > 0 ? entryAnimation : 0);
    
    // Add extra height based on scroll
    const finalHeight = growthFactor + (scrollOffset * 2);
    
    // Smoothly interpolate scale.y
    meshRef.current.scale.y = THREE.MathUtils.lerp(meshRef.current.scale.y, finalHeight, 0.1);
    
    // Adjust position so it grows from the base (y=0)
    // Since box geometry is centered, we offset by half the scale
    meshRef.current.position.y = meshRef.current.scale.y / 2 - 2;
    
    // Subtle rotation based on time
    meshRef.current.rotation.y = Math.sin(time * 0.5 + delay) * 0.05;
  });

  return (
    <mesh 
      ref={meshRef} 
      position={position}
      onPointerOver={() => { document.body.style.cursor = "pointer" }}
      onPointerOut={() => { document.body.style.cursor = "default" }}
    >
      <boxGeometry args={[0.8, 1, 0.8]} />
      <meshStandardMaterial 
        color={color}
        emissive={color}
        emissiveIntensity={2}
        metalness={0.9}
        roughness={0.1}
      />
    </mesh>
  );
};

/**
 * StatsScene3D
 * An immersive 3D scene featuring neon pillars that represent data/stats.
 * Designed for the "Mission Statement" section with a Cyberpunk Floral aesthetic.
 */
export const StatsScene3D = () => {
  const { viewport } = useThree();

  // Define pillar data based on the Neon Cyberpunk Floral theme
  const pillars = useMemo(() => [
    { pos: [-2.4, 0, 0], color: '#f472b6', height: 3.5, delay: 0.1 }, // Primary Pink
    { pos: [-1.2, 0, 0], color: '#fb7185', height: 5.2, delay: 0.3 }, // Secondary Rose
    { pos: [0, 0, 0],    color: '#fda4af', height: 4.0, delay: 0.5 }, // Accent Light Rose
    { pos: [1.2, 0, 0],  color: '#f472b6', height: 6.1, delay: 0.2 }, // Primary Pink
    { pos: [2.4, 0, 0],  color: '#fb7185', height: 4.8, delay: 0.4 }, // Secondary Rose
  ], []);

  return (
    <>
      {/* Cinematic Lighting */}
      <ambientLight intensity={0.2} />
      <pointLight position={[10, 10, 10]} intensity={1.5} color="#f472b6" />
      <spotLight 
        position={[-10, 20, 10]} 
        angle={0.15} 
        penumbra={1} 
        intensity={2} 
        color="#fb7185" 
        castShadow 
      />
      
      {/* Scene Atmosphere */}
      <fog attach="fog" args={["#000", 5, 25]} />
      
      <group position={[0, -1, 0]}>
        <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
          {pillars.map((pillar, index) => (
            <StatPillar 
              key={index}
              position={pillar.pos as [number, number, number]}
              color={pillar.color}
              targetHeight={pillar.height}
              delay={pillar.delay}
            />
          ))}
        </Float>

        {/* Floating Decorative Elements (Cyber-Petals) */}
        <Float speed={3} rotationIntensity={2} floatIntensity={1}>
          <mesh position={[-4, 2, -2]}>
            <icosahedronGeometry args={[0.3, 1]} />
            <meshStandardMaterial color="#fda4af" emissive="#fda4af" emissiveIntensity={1} />
          </mesh>
          <mesh position={[4, 3, -3]}>
            <icosahedronGeometry args={[0.4, 2]} />
            <meshStandardMaterial color="#f472b6" emissive="#f472b6" emissiveIntensity={1} />
          </mesh>
        </Float>

        {/* Ground Shadows */}
        <ContactShadows 
          position={[0, -2, 0]} 
          opacity={0.4} 
          scale={15} 
          blur={2.5} 
          far={4} 
          color="#000000" 
        />
      </group>

      {/* Particle Effects */}
      <Sparkles 
        count={60} 
        scale={10} 
        size={1.5} 
        speed={0.4} 
        color="#f472b6" 
        opacity={0.6}
      />

      {/* Distant Stars for depth */}
      <group rotation={[0, 0, Math.PI / 4]}>
        <Sparkles 
          count={40} 
          scale={20} 
          size={0.5} 
          speed={0.1} 
          color="#ffffff" 
        />
      </group>
    </>
  );
};

export default StatsScene3D;