import React, { useRef, useState, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
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
 * ContactScene3D
 * An immersive, cinematic 3D scene for the Contact section.
 * Features a "Fiery Organic Nexus" representing the heart of Aethelgard.
 * 
 * Theme: Fiery-Dark (Sage Serenity with a fiery twist)
 * Colors: #ef4444 (Primary), #f97316 (Secondary), #fbbf24 (Accent)
 */
export const ContactScene3D = () => {
  const coreRef = useRef<THREE.Mesh>(null!);
  const ringRef = useRef<THREE.Group>(null!);
  const [hovered, setHovered] = useState(false);
  const scroll = useScroll();
  const { viewport } = useThree();

  // Handle cursor state
  const onPointerOver = () => {
    setHovered(true);
    document.body.style.cursor = 'pointer';
  };

  const onPointerOut = () => {
    setHovered(false);
    document.body.style.cursor = 'default';
  };

  // Animation Loop
  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();
    
    // Core Rotation & Scaling
    if (coreRef.current) {
      coreRef.current.rotation.x += delta * 0.2;
      coreRef.current.rotation.y += delta * 0.3;
      
      // Smooth scale lerp on hover
      const targetScale = hovered ? 1.2 : 1.0;
      coreRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
      
      // Pulse effect based on time
      const pulse = Math.sin(t * 2) * 0.05;
      coreRef.current.scale.addScalar(pulse * delta);
    }

    // Ring system rotation
    if (ringRef.current) {
      ringRef.current.rotation.z += delta * 0.1;
      ringRef.current.rotation.y -= delta * 0.05;
      
      // React to scroll - subtle vertical movement
      const scrollOffset = scroll?.offset || 0;
      ringRef.current.position.y = THREE.MathUtils.lerp(ringRef.current.position.y, -scrollOffset * 2, 0.1);
    }
  });

  // Memoize geometry to prevent re-calculations
  const ringGeom = useMemo(() => new THREE.TorusKnotGeometry(1.5, 0.02, 128, 16), []);

  return (
    <>
      {/* Cinematic Lighting */}
      <ambientLight intensity={0.2} />
      <pointLight position={[5, 5, 5]} intensity={1.5} color="#ef4444" />
      <pointLight position={[-5, -5, -5]} intensity={1} color="#fbbf24" />
      <spotLight 
        position={[0, 10, 0]} 
        angle={0.3} 
        penumbra={1} 
        intensity={2} 
        castShadow 
        color="#f97316" 
      />
      
      {/* Ambient Fog for Depth */}
      <fog attach="fog" args={["#1c1917", 8, 25]} />

      {/* Main Interactive Nexus Core */}
      <Float speed={1.5} rotationIntensity={0.5} floatIntensity={1}>
        <mesh
          ref={coreRef}
          onPointerOver={onPointerOver}
          onPointerOut={onPointerOut}
          position={[0, 0, 0]}
        >
          <icosahedronGeometry args={[1, 3]} />
          <MeshDistortMaterial
            color="#ef4444"
            emissive="#7f1d1d"
            emissiveIntensity={0.5}
            speed={3}
            distort={0.4}
            roughness={0.2}
            metalness={0.8}
          />
        </mesh>
      </Float>

      {/* Outer Orbital Rings */}
      <group ref={ringRef}>
        <Float speed={2} rotationIntensity={2} floatIntensity={0.5}>
          <mesh geometry={ringGeom}>
            <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={2} />
          </mesh>
        </Float>
        
        {/* Secondary Wobbling Ring */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[2.2, 0.01, 16, 100]} />
          <MeshWobbleMaterial 
            color="#f97316" 
            speed={2} 
            factor={0.5} 
            transparent 
            opacity={0.6} 
          />
        </mesh>
      </group>

      {/* Atmospheric Particles (Embers) */}
      <Sparkles
        count={60}
        scale={10}
        size={1.5}
        speed={0.4}
        opacity={0.8}
        color="#fbbf24"
      />

      {/* Grounding Shadows */}
      <ContactShadows
        position={[0, -3.5, 0]}
        opacity={0.4}
        scale={15}
        blur={2.5}
        far={4}
        color="#000000"
      />

      {/* Distant Background Elements */}
      <group position={[0, 0, -10]}>
        <Float speed={0.5}>
          <mesh position={[-4, 2, 0]}>
            <dodecahedronGeometry args={[0.5, 0]} />
            <meshPhysicalMaterial 
              color="#ef4444" 
              roughness={0.1} 
              metalness={0.9} 
              clearcoat={1} 
            />
          </mesh>
        </Float>
        <Float speed={0.7}>
          <mesh position={[5, -3, -2]}>
            <icosahedronGeometry args={[0.3, 1]} />
            <meshPhysicalMaterial 
              color="#f97316" 
              roughness={0.1} 
              metalness={0.9} 
              clearcoat={1} 
            />
          </mesh>
        </Float>
      </group>
    </>
  );
};

export default ContactScene3D;