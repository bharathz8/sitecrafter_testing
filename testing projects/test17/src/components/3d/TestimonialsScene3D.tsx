import React, { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Sparkles, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

/**
 * TestimonialPanel
 * Individual floating glass-like panel representing a testimonial card in 3D space.
 */
const TestimonialPanel = ({ 
  position, 
  rotation, 
  index, 
  color = "#f472b6" 
}: { 
  position: [number, number, number]; 
  rotation: [number, number, number]; 
  index: number;
  color?: string;
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  // Smoothly interpolate scale and emissive intensity on hover
  useFrame((state) => {
    if (!meshRef.current) return;
    
    const t = state.clock.getElapsedTime();
    const targetScale = hovered ? 1.1 : 1.0;
    meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
    
    // Subtle additional floating motion independent of the Float component
    meshRef.current.position.y += Math.sin(t + index) * 0.002;
  });

  return (
    <Float
      speed={1.2 + index * 0.3} 
      rotationIntensity={0.4} 
      floatIntensity={0.8}
      position={position}
    >
      <group rotation={rotation}>
        {/* Main Glass Panel */}
        <mesh
          ref={meshRef}
          onPointerOver={() => { setHovered(true); document.body.style.cursor = 'pointer'; }}
          onPointerOut={() => { setHovered(false); document.body.style.cursor = 'default'; }}
        >
          <boxGeometry args={[3.2, 2.2, 0.1]} />
          <meshPhysicalMaterial
            color={color}
            metalness={0.1}
            roughness={0.05}
            transparent
            opacity={0.4}
            transmission={0} // Using opacity instead of transmission per performance safety
            clearcoat={1}
            clearcoatRoughness={0.1}
            reflectivity={0.5}
            emissive={color}
            emissiveIntensity={hovered ? 0.6 : 0.2}
          />
        </mesh>

        {/* Decorative Neon Border/Frame */}
        <mesh position={[0, 0, -0.06]}>
          <boxGeometry args={[3.3, 2.3, 0.02]} />
          <meshStandardMaterial 
            color={color} 
            emissive={color} 
            emissiveIntensity={2} 
            transparent 
            opacity={0.8} 
          />
        </mesh>

        {/* Inner Glow Mesh */}
        <mesh position={[0, 0, 0.01]}>
          <planeGeometry args={[3, 2]} />
          <meshBasicMaterial 
            color={color} 
            transparent 
            opacity={0.05} 
            side={THREE.DoubleSide} 
          />
        </mesh>
      </group>
    </Float>
  );
};

/**
 * TestimonialsScene3D
 * An immersive 3D scene featuring floating, interactive glass panels arranged in an arc.
 * Designed for a Neon Cyberpunk floral-light aesthetic.
 */
export const TestimonialsScene3D = () => {
  // Define positions in a gentle arc
  const panels = useMemo(() => [
    {
      pos: [-4.5, 0.5, -2] as [number, number, number],
      rot: [0, 0.6, 0] as [number, number, number],
      color: "#f472b6" // Primary Pink
    },
    {
      pos: [0, 0, 0] as [number, number, number],
      rot: [0, 0, 0] as [number, number, number],
      color: "#fb7185" // Secondary Rose
    },
    {
      pos: [4.5, -0.5, -2] as [number, number, number],
      rot: [0, -0.6, 0] as [number, number, number],
      color: "#fda4af" // Accent Coral
    }
  ], []);

  return (
    <>
      {/* Cinematic Lighting */}
      <ambientLight intensity={0.4} />
      
      {/* Key Neon Lights */}
      <pointLight position={[-10, 5, 5]} intensity={2} color="#f472b6" />
      <pointLight position={[10, -5, 5]} intensity={2} color="#fb7185" />
      <pointLight position={[0, 10, -5]} intensity={1.5} color="#ffffff" />

      {/* Atmospheric Elements */}
      <fog attach="fog" args={["#000", 5, 25]} />
      
      <Sparkles 
        count={70} 
        scale={15} 
        size={2.5} 
        speed={0.4} 
        color="#f472b6" 
        opacity={0.6}
      />

      {/* Floating Interactive Testimonial Panels */}
      <group position={[0, 0, -2]}>
        {panels.map((panel, i) => (
          <TestimonialPanel 
            key={i}
            index={i}
            position={panel.pos}
            rotation={panel.rot}
            color={panel.color}
          />
        ))}
      </group>

      {/* Subtle Ground Shadows for Depth */}
      <ContactShadows
        position={[0, -4, 0]}
        opacity={0.4}
        scale={20}
        blur={2.5}
        far={4.5}
        color="#f472b6"
      />

      {/* Background Depth Elements */}
      <Float speed={0.5} rotationIntensity={0.1} floatIntensity={0.5}>
        <mesh position={[0, 0, -10]} rotation={[Math.PI / 4, 0, 0]}>
          <torusKnotGeometry args={[10, 0.02, 128, 16]} />
          <meshBasicMaterial color="#f472b6" transparent opacity={0.1} />
        </mesh>
      </Float>
    </>
  );
};

export default TestimonialsScene3D;