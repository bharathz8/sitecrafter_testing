import React, { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Float, Sparkles, MeshDistortMaterial, MeshWobbleMaterial, useScroll } from '@react-three/drei';
import * as THREE from 'three';

/**
 * GenericScene3D - Aethelgard's Arboretum: Sage Serenity Experience
 * 
 * This component provides a cinematic, fiery-dark 3D environment featuring
 * organic floating geometries that react to scroll and user interaction.
 * 
 * TYPE 1: 3D SCENE COMPONENT
 */
export const GenericScene3D = () => {
  const scroll = useScroll();
  const { viewport } = useThree();
  
  // Refs for animation and interaction
  const coreRef = useRef<THREE.Mesh>(null!);
  const ringRef = useRef<THREE.Group>(null!);
  const [hovered, setHovered] = React.useState(false);

  // Material colors based on the theme
  const colors = {
    primary: "#ef4444",   // Fiery Red
    secondary: "#f97316", // Orange
    accent: "#fbbf24",    // Golden Yellow
    bg: "#1c1917"         // Dark Stone
  };

  // Interaction handlers
  const onPointerOver = () => {
    setHovered(true);
    document.body.style.cursor = "pointer";
  };

  const onPointerOut = () => {
    setHovered(false);
    document.body.style.cursor = "default";
  };

  useFrame((state, delta) => {
    const scrollOffset = scroll?.offset || 0;

    // Smooth hover scale lerping
    const targetScale = hovered ? 1.2 : 1;
    coreRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);

    // Zoom-burst effect based on scroll
    // As user scrolls, the central core grows and the rings rotate faster
    if (coreRef.current) {
      coreRef.current.rotation.y += delta * 0.5;
      coreRef.current.rotation.z += delta * 0.3;
      
      // Burst effect: Scale and position reaction to scroll
      const burstScale = 1 + scrollOffset * 2;
      coreRef.current.position.z = THREE.MathUtils.lerp(coreRef.current.position.z, scrollOffset * 5, 0.1);
    }

    if (ringRef.current) {
      ringRef.current.rotation.z -= delta * 0.2;
      ringRef.current.rotation.x += delta * 0.1;
      
      // Rings expand outward as we scroll
      const ringSpread = scrollOffset * 4;
      ringRef.current.children.forEach((child, i) => {
        child.position.x = Math.cos(i + state.clock.elapsedTime * 0.5) * (2 + ringSpread);
        child.position.y = Math.sin(i + state.clock.elapsedTime * 0.5) * (2 + ringSpread);
      });
    }
  });

  return (
    <>
      {/* Cinematic Lighting */}
      <ambientLight intensity={0.4} />
      <spotLight 
        position={[10, 10, 10]} 
        angle={0.15} 
        penumbra={1} 
        intensity={2} 
        color={colors.accent} 
        castShadow 
      />
      <pointLight position={[-10, -10, -10]} intensity={1} color={colors.primary} />
      <pointLight position={[0, 5, 0]} intensity={1.5} color={colors.secondary} />
      
      {/* Depth and Atmosphere */}
      <fog attach="fog" args={[colors.bg, 5, 15]} />
      
      {/* Central "Seed of Growth" - The Core */}
      <Float speed={2} rotationIntensity={1.5} floatIntensity={2}>
        <mesh 
          ref={coreRef} 
          onPointerOver={onPointerOver} 
          onPointerOut={onPointerOut}
          position={[0, 0, 0]}
        >
          <icosahedronGeometry args={[1, 3]} />
          <MeshDistortMaterial 
            color={colors.primary} 
            emissive={colors.primary}
            emissiveIntensity={hovered ? 2 : 0.5}
            speed={3} 
            distort={0.4} 
            roughness={0.1}
            metalness={0.8}
          />
        </mesh>
      </Float>

      {/* Orbital "Vines" - Decorative Geometry */}
      <group ref={ringRef}>
        {[...Array(3)].map((_, i) => (
          <mesh key={i} position={[Math.random() * 2, Math.random() * 2, 0]}>
            <torusKnotGeometry args={[0.4, 0.05, 128, 16]} />
            <meshPhysicalMaterial 
              color={colors.secondary} 
              emissive={colors.secondary}
              emissiveIntensity={0.2}
              metalness={0.9}
              roughness={0.1}
              clearcoat={1}
            />
          </mesh>
        ))}
      </group>

      {/* Background Floating Elements */}
      <Float speed={1} rotationIntensity={0.5} floatIntensity={0.5}>
        <mesh position={[-4, 2, -5]}>
          <dodecahedronGeometry args={[0.8, 0]} />
          <MeshWobbleMaterial 
            color={colors.accent} 
            speed={2} 
            factor={0.4} 
            metalness={0.5} 
          />
        </mesh>
      </Float>

      <Float speed={1.5} rotationIntensity={2} floatIntensity={1}>
        <mesh position={[4, -2, -3]}>
          <octahedronGeometry args={[0.6, 0]} />
          <meshStandardMaterial 
            color={colors.secondary} 
            wireframe 
            transparent 
            opacity={0.3} 
          />
        </mesh>
      </Float>

      {/* Environmental Particles */}
      <Sparkles 
        count={70} 
        scale={10} 
        size={2} 
        speed={0.4} 
        color={colors.accent} 
        opacity={0.6}
      />

      <Sparkles 
        count={30} 
        scale={15} 
        size={4} 
        speed={0.2} 
        color={colors.primary} 
        opacity={0.3}
      />
    </>
  );
};

export default GenericScene3D;