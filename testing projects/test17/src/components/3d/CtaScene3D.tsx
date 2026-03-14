import React, { useRef, useMemo } from 'react';
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
 * TYPE 1: 3D SCENE COMPONENT
 * Implements a high-energy, cinematic CTA scene with neon cyberpunk aesthetics.
 * Features a pulsing "Cyber-Core" with orbiting rings and reactive lighting.
 */
export const CtaScene3D = () => {
  const coreRef = useRef<THREE.Mesh>(null);
  const ring1Ref = useRef<THREE.Group>(null);
  const ring2Ref = useRef<THREE.Group>(null);
  const ring3Ref = useRef<THREE.Group>(null);
  const lightRef = useRef<THREE.PointLight>(null);
  
  const scroll = useScroll();
  const { viewport } = useThree();

  // Create high-contrast lighting colors from the floral-light/cyberpunk palette
  const colors = {
    primary: "#f472b6",
    secondary: "#fb7185",
    accent: "#fda4af",
    glow: "#ff007f"
  };

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();
    const scrollOffset = scroll ? scroll.offset : 0;

    // Pulse the central core and lights
    if (coreRef.current) {
      coreRef.current.rotation.y += delta * 0.4;
      coreRef.current.rotation.z += delta * 0.2;
      const pulse = Math.sin(time * 2) * 0.1 + 0.9;
      coreRef.current.scale.setScalar(pulse + scrollOffset * 0.5);
    }

    // Dynamic light intensity based on time and scroll
    if (lightRef.current) {
      lightRef.current.intensity = (Math.sin(time * 4) * 0.5 + 2) * (1 + scrollOffset);
    }

    // Orbiting rings animation
    if (ring1Ref.current) {
      ring1Ref.current.rotation.x += delta * 0.3;
      ring1Ref.current.rotation.y += delta * 0.5;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.y -= delta * 0.4;
      ring2Ref.current.rotation.z += delta * 0.2;
    }
    if (ring3Ref.current) {
      ring3Ref.current.rotation.x -= delta * 0.2;
      ring3Ref.current.rotation.z -= delta * 0.6;
    }
  });

  return (
    <>
      {/* Cinematic Environment & Atmosphere */}
      <color attach="background" args={["#050505"]} />
      <fog attach="fog" args={["#050505", 5, 15]} />
      
      <ambientLight intensity={0.4} />
      <pointLight 
        ref={lightRef} 
        position={[2, 2, 2]} 
        color={colors.primary} 
        intensity={2} 
        distance={10} 
      />
      <spotLight 
        position={[-5, 5, 5]} 
        angle={0.25} 
        penumbra={1} 
        intensity={1.5} 
        color={colors.accent} 
        castShadow 
      />

      {/* Central "Cyber-Core" Entity */}
      <Float speed={3} rotationIntensity={1.5} floatIntensity={2}>
        <mesh 
          ref={coreRef}
          onPointerOver={() => { document.body.style.cursor = "pointer" }}
          onPointerOut={() => { document.body.style.cursor = "default" }}
        >
          <icosahedronGeometry args={[1, 4]} />
          <MeshDistortMaterial 
            color={colors.primary} 
            speed={4} 
            distort={0.4} 
            emissive={colors.glow}
            emissiveIntensity={0.5}
            roughness={0.1}
            metalness={0.9}
          />
        </mesh>

        {/* Orbiting Tech Rings */}
        <group ref={ring1Ref}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[1.6, 0.03, 16, 100]} />
            <meshStandardMaterial color={colors.accent} emissive={colors.accent} emissiveIntensity={2} />
          </mesh>
        </group>

        <group ref={ring2Ref}>
          <mesh rotation={[0, Math.PI / 4, 0]}>
            <torusGeometry args={[1.9, 0.02, 16, 100]} />
            <MeshWobbleMaterial color={colors.secondary} speed={2} factor={0.4} emissive={colors.secondary} emissiveIntensity={1} />
          </mesh>
        </group>

        <group ref={ring3Ref}>
          <mesh rotation={[Math.PI / 3, 0, Math.PI / 6]}>
            <torusGeometry args={[2.2, 0.01, 16, 100]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.5} />
          </mesh>
        </group>
      </Float>

      {/* Atmospheric Particles */}
      <Sparkles 
        count={70} 
        scale={10} 
        size={3} 
        speed={0.8} 
        color={colors.primary} 
        noise={1} 
      />
      
      <Sparkles 
        count={30} 
        scale={8} 
        size={1.5} 
        speed={1.5} 
        color={colors.accent} 
      />

      {/* Ground Reflections & Shadows */}
      <ContactShadows 
        position={[0, -3, 0]} 
        opacity={0.6} 
        scale={10} 
        blur={2.5} 
        far={10} 
        color={colors.primary}
      />
    </>
  );
};

export default CtaScene3D;