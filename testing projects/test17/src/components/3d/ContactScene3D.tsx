import React, { useRef, useState, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Float, Sparkles, ContactShadows, MeshDistortMaterial, MeshWobbleMaterial, useScroll } from '@react-three/drei';
import * as THREE from 'three';

/**
 * ContactScene3D
 * An immersive, organic 3D scene representing the "Contact" section.
 * Features a central "Cyber-Lotus" - a series of distorted, glowing geometric shapes
 * that react to user interaction and scroll position.
 * 
 * Theme: Floral-Light / Neon Cyberpunk Expedition
 * Palette: #f472b6 (Primary), #fb7185 (Secondary), #fda4af (Accent)
 */

const CyberPetal = ({ index, total, hovered }: { index: number; total: number; hovered: boolean }) => {
  const meshRef = useRef<THREE.Mesh>(null!);
  const angle = (index / total) * Math.PI * 2;
  const radius = 2.2;

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    // Orbit rotation
    const currentAngle = angle + time * 0.2;
    const targetX = Math.cos(currentAngle) * radius;
    const targetZ = Math.sin(currentAngle) * radius;
    
    meshRef.current.position.x = THREE.MathUtils.lerp(meshRef.current.position.x, targetX, 0.1);
    meshRef.current.position.z = THREE.MathUtils.lerp(meshRef.current.position.z, targetZ, 0.1);
    meshRef.current.position.y = Math.sin(time + index) * 0.5;
    
    // Rotation
    meshRef.current.rotation.x += 0.01;
    meshRef.current.rotation.y += 0.02;

    // Hover response
    const scale = hovered ? 1.3 : 1.0;
    meshRef.current.scale.lerp(new THREE.Vector3(scale, scale, scale), 0.1);
  });

  return (
    <mesh ref={meshRef}>
      <icosahedronGeometry args={[0.4, 2]} />
      <MeshWobbleMaterial 
        color={index % 2 === 0 ? "#f472b6" : "#fb7185"} 
        speed={2} 
        factor={0.4} 
        emissive="#f472b6"
        emissiveIntensity={0.5}
      />
    </mesh>
  );
};

export const ContactScene3D = () => {
  const groupRef = useRef<THREE.Group>(null!);
  const coreRef = useRef<THREE.Mesh>(null!);
  const scroll = useScroll();
  const [hovered, setHovered] = useState(false);

  // Floating particles around the core
  const particlesCount = 40;
  const positions = useMemo(() => {
    const pos = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 10;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 10;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    return pos;
  }, []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const scrollOffset = scroll.offset; // 0 to 1

    // Rotate main group based on scroll and time
    if (groupRef.current) {
      groupRef.current.rotation.y = time * 0.1 + scrollOffset * Math.PI;
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, -scrollOffset * 2, 0.1);
    }

    // Core pulsing and interaction
    if (coreRef.current) {
      const s = (hovered ? 1.5 : 1.2) + Math.sin(time * 2) * 0.1;
      coreRef.current.scale.lerp(new THREE.Vector3(s, s, s), 0.1);
      coreRef.current.rotation.z = time * 0.5;
    }
  });

  const handlePointerOver = () => {
    setHovered(true);
    document.body.style.cursor = 'pointer';
  };

  const handlePointerOut = () => {
    setHovered(false);
    document.body.style.cursor = 'default';
  };

  return (
    <>
      {/* Lighting setup for cinematic floral feel */}
      <ambientLight intensity={0.6} />
      <pointLight position={[10, 10, 10]} intensity={1.5} color="#fda4af" />
      <pointLight position={[-10, -10, -10]} intensity={0.8} color="#f472b6" />
      <spotLight 
        position={[0, 5, 0]} 
        intensity={2} 
        penumbra={1} 
        color="#ffffff" 
        angle={0.5}
      />
      
      <fog attach="fog" args={["#fdf2f8", 5, 25]} />

      <group ref={groupRef}>
        {/* Central Organic Core */}
        <Float speed={2} rotationIntensity={1.5} floatIntensity={2}>
          <mesh 
            ref={coreRef}
            onPointerOver={handlePointerOver}
            onPointerOut={handlePointerOut}
          >
            <icosahedronGeometry args={[1, 2]} />
            <MeshDistortMaterial 
              color="#f472b6" 
              speed={3} 
              distort={0.4} 
              radius={1}
              metalness={0.6}
              roughness={0.2}
              emissive="#fb7185"
              emissiveIntensity={0.4}
            />
          </mesh>
        </Float>

        {/* Floating Petals / Satellites */}
        {Array.from({ length: 6 }).map((_, i) => (
          <CyberPetal key={i} index={i} total={6} hovered={hovered} />
        ))}

        {/* Ambient Sparkles for "Pollen" or Cyber-Dust */}
        <Sparkles 
          count={60} 
          scale={12} 
          size={2} 
          speed={0.4} 
          color="#fda4af" 
          opacity={0.6}
        />
      </group>

      {/* Ground shadows for depth */}
      <ContactShadows 
        position={[0, -4.5, 0]} 
        opacity={0.4} 
        scale={20} 
        blur={2.5} 
        far={4.5} 
        color="#f472b6"
      />

      {/* Background depth elements */}
      <group position={[0, 0, -5]}>
        {Array.from({ length: 15 }).map((_, i) => (
          <Float key={`bg-${i}`} speed={1} rotationIntensity={0.5}>
            <mesh position={[(Math.random() - 0.5) * 20, (Math.random() - 0.5) * 20, (Math.random() - 0.5) * 5]}>
              <boxGeometry args={[0.1, 0.1, 0.1]} />
              <meshStandardMaterial color="#fda4af" transparent opacity={0.3} />
            </mesh>
          </Float>
        ))}
      </group>
    </>
  );
};

export default ContactScene3D;