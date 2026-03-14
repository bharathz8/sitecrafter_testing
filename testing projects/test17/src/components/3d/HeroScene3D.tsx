import React, { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { 
  Float, 
  Sparkles, 
  ContactShadows, 
  MeshDistortMaterial, 
  MeshWobbleMaterial, 
  useScroll 
} from '@react-three/drei';
import * as THREE from 'three';

/**
 * HeroScene3D Component
 * An immersive, cinematic 3D experience for the "Neon Cyberpunk Expedition".
 * Features procedural geometry, scroll-driven choreography, and interactive hover states.
 */
export const HeroScene3D = () => {
  const scroll = useScroll();
  const mainGroup = useRef<THREE.Group>(null);
  
  // Refs for interactive elements
  const coreRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const orbitalRef = useRef<THREE.Group>(null);

  // Interaction states
  const [hovered, setHovered] = useState(false);

  // Procedural positions for floating debris
  const debrisPositions = useMemo(() => {
    return Array.from({ length: 15 }, () => ({
      position: [
        (Math.random() - 0.5) * 15,
        (Math.random() - 0.5) * 15,
        (Math.random() - 0.5) * 10
      ] as [number, number, number],
      scale: Math.random() * 0.4 + 0.1,
      speed: Math.random() * 2
    }));
  }, []);

  useFrame((state, delta) => {
    if (!mainGroup.current) return;

    // 1. Scroll-driven animation
    const offset = scroll.offset; // 0 to 1
    mainGroup.current.rotation.y = THREE.MathUtils.lerp(mainGroup.current.rotation.y, offset * Math.PI * 2, 0.1);
    mainGroup.current.position.z = THREE.MathUtils.lerp(mainGroup.current.position.z, offset * -5, 0.1);

    // 2. Interactive Hover Lerp
    if (coreRef.current) {
      const targetScale = hovered ? 1.3 : 1;
      coreRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
    }

    // 3. Constant subtle rotations
    if (orbitalRef.current) {
      orbitalRef.current.rotation.z += delta * 0.2;
      orbitalRef.current.rotation.y += delta * 0.1;
    }

    if (ringRef.current) {
      ringRef.current.rotation.x += delta * 0.5;
    }
  });

  return (
    <>
      {/* Cinematic Lighting */}
      <ambientLight intensity={0.2} />
      <spotLight 
        position={[10, 15, 10]} 
        angle={0.3} 
        penumbra={1} 
        intensity={2} 
        castShadow 
        color="#f472b6" 
      />
      <pointLight position={[-10, -10, -10]} color="#fb7185" intensity={1.5} />
      <pointLight position={[0, 5, 5]} color="#fda4af" intensity={0.8} />

      {/* Atmospheric Fog */}
      <fog attach="fog" args={["#050505", 8, 25]} />

      {/* Main Experience Group */}
      <group ref={mainGroup}>
        
        {/* Central Hero Object: The Cyber-Core */}
        <Float speed={1.5} rotationIntensity={0.5} floatIntensity={1}>
          <mesh 
            ref={coreRef}
            onPointerOver={() => {
              setHovered(true);
              document.body.style.cursor = "pointer";
            }}
            onPointerOut={() => {
              setHovered(false);
              document.body.style.cursor = "default";
            }}
          >
            <icosahedronGeometry args={[1.2, 4]} />
            <MeshDistortMaterial 
              color="#f472b6" 
              speed={3} 
              distort={0.4} 
              radius={1}
              emissive="#f472b6"
              emissiveIntensity={0.2}
              roughness={0.1}
              metalness={0.8}
            />
          </mesh>
        </Float>

        {/* Orbiting Tech Ring */}
        <Float speed={2} rotationIntensity={2} floatIntensity={0.5}>
          <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[2.5, 0.02, 16, 100]} />
            <meshPhysicalMaterial 
              color="#fda4af" 
              emissive="#fda4af" 
              emissiveIntensity={2} 
              toneMapped={false} 
            />
          </mesh>
        </Float>

        {/* Orbital Data Particles */}
        <group ref={orbitalRef}>
          {debrisPositions.map((item, i) => (
            <mesh key={i} position={item.position} scale={item.scale}>
              <sphereGeometry args={[1, 16, 16]} />
              <MeshWobbleMaterial 
                color={i % 2 === 0 ? "#f472b6" : "#fb7185"} 
                speed={item.speed} 
                factor={0.4} 
              />
            </mesh>
          ))}
        </group>

        {/* Background Depth Elements */}
        <Sparkles 
          count={60} 
          scale={15} 
          size={2} 
          speed={0.4} 
          color="#f472b6" 
          opacity={0.6}
        />

        {/* Grounding Shadows */}
        <ContactShadows 
          position={[0, -4, 0]} 
          opacity={0.4} 
          scale={20} 
          blur={2.5} 
          far={4.5} 
          color="#000000" 
        />
      </group>

      {/* Subtle Starfield for Cyberpunk Vibe */}
      <group rotation={[0, 0, Math.PI / 4]}>
        <Sparkles 
          count={40} 
          scale={20} 
          size={1} 
          speed={0.1} 
          color="#ffffff" 
        />
      </group>
    </>
  );
};

export default HeroScene3D;