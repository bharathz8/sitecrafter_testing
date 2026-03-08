import React, { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Float, ContactShadows, Sparkles, MeshDistortMaterial, useScroll } from '@react-three/drei';
import * as THREE from 'three';

/**
 * CtaScene3D Component
 * 
 * An immersive, high-energy 3D scene for the CTA section of Aethelgard's Arboretum.
 * Features a "fiery-dark" cinematic aesthetic with a pulsating crystalline seed,
 * orbiting energy rings, and dynamic lighting.
 * 
 * Rules:
 * - Returns a React Fragment (<>...</>)
 * - Contains ONLY R3F elements
 * - Reacts to scroll for parallax and entrance effects
 */
export const CtaScene3D = () => {
  const orbRef = useRef<THREE.Mesh>(null);
  const ring1Ref = useRef<THREE.Group>(null);
  const ring2Ref = useRef<THREE.Group>(null);
  const lightRef = useRef<THREE.PointLight>(null);
  const groupRef = useRef<THREE.Group>(null);
  
  const scroll = useScroll();
  const { viewport } = useThree();

  // Color palette from design specs
  const colors = {
    primary: "#ef4444",   // Fiery Red
    secondary: "#f97316", // Orange
    accent: "#fbbf24",    // Golden Yellow
    void: "#050505"       // Dark background
  };

  // Generate some random points for orbiting debris
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < 20; i++) {
      const t = Math.random() * Math.PI * 2;
      const u = Math.random() * Math.PI * 2;
      const r = 2 + Math.random() * 1.5;
      const x = r * Math.sin(t) * Math.cos(u);
      const y = r * Math.sin(t) * Math.sin(u);
      const z = r * Math.cos(t);
      temp.push(new THREE.Vector3(x, y, z));
    }
    return temp;
  }, []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    
    // Scroll-based interactions
    // scroll.range(start, end) returns 0 to 1 as we scroll through the section
    const scrollOffset = scroll.range(0.7, 0.3); // Adjusting for CTA position at bottom
    
    if (groupRef.current) {
      // Entrance "zoom-burst" effect based on scroll
      groupRef.current.scale.setScalar(0.8 + scrollOffset * 0.4);
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, -viewport.height * 0.1, 0.1);
    }

    // Pulsating central orb
    if (orbRef.current) {
      orbRef.current.rotation.y = time * 0.4;
      orbRef.current.rotation.z = time * 0.2;
      const pulse = Math.sin(time * 2) * 0.1 + 1;
      orbRef.current.scale.setScalar(pulse);
    }

    // Orbiting rings animation
    if (ring1Ref.current) {
      ring1Ref.current.rotation.z = time * 0.5;
      ring1Ref.current.rotation.x = Math.sin(time * 0.3) * 0.5;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.z = -time * 0.8;
      ring2Ref.current.rotation.y = Math.cos(time * 0.4) * 0.5;
    }

    // Dynamic light intensity pulse
    if (lightRef.current) {
      lightRef.current.intensity = 15 + Math.sin(time * 4) * 5;
    }
  });

  return (
    <>
      {/* Cinematic Fog for depth */}
      <fog attach="fog" args={[colors.void, 5, 20]} />

      {/* Lighting Rig */}
      <ambientLight intensity={0.2} />
      <pointLight 
        ref={lightRef} 
        position={[0, 0, 0]} 
        color={colors.accent} 
        distance={10} 
        decay={2} 
      />
      <spotLight 
        position={[5, 5, 5]} 
        angle={0.25} 
        penumbra={1} 
        intensity={2} 
        color={colors.primary} 
        castShadow 
      />
      <directionalLight position={[-5, 2, 2]} intensity={1} color={colors.secondary} />

      <group ref={groupRef}>
        {/* Central Crystalline Seed */}
        <Float speed={3} rotationIntensity={1.5} floatIntensity={2}>
          <mesh 
            ref={orbRef}
            onPointerOver={() => { document.body.style.cursor = "pointer" }}
            onPointerOut={() => { document.body.style.cursor = "default" }}
          >
            <icosahedronGeometry args={[1, 3]} />
            <MeshDistortMaterial 
              color={colors.primary}
              emissive={colors.secondary}
              emissiveIntensity={2}
              speed={4} 
              distort={0.4} 
              radius={1}
              metalness={0.8}
              roughness={0.2}
            />
          </mesh>
        </Float>

        {/* Orbiting Energy Rings */}
        <group ref={ring1Ref}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[1.8, 0.015, 16, 100]} />
            <meshPhysicalMaterial 
              color={colors.accent} 
              emissive={colors.accent} 
              emissiveIntensity={5}
              transparent
              opacity={0.6}
            />
          </mesh>
        </group>

        <group ref={ring2Ref}>
          <mesh rotation={[Math.PI / 4, Math.PI / 4, 0]}>
            <torusGeometry args={[2.2, 0.01, 16, 100]} />
            <meshPhysicalMaterial 
              color={colors.secondary} 
              emissive={colors.secondary} 
              emissiveIntensity={3}
              transparent
              opacity={0.4}
            />
          </mesh>
        </group>

        {/* Orbiting Debris (Crystalline shards) */}
        {particles.map((pos, i) => (
          <Float key={i} speed={2} rotationIntensity={2} floatIntensity={1}>
            <mesh position={pos} rotation={[Math.random(), Math.random(), 0]}>
              <dodecahedronGeometry args={[0.05, 0]} />
              <meshStandardMaterial 
                color={colors.accent} 
                emissive={colors.primary} 
                emissiveIntensity={2} 
              />
            </mesh>
          </Float>
        ))}
      </group>

      {/* Energetic Particles */}
      <Sparkles 
        count={60} 
        scale={8} 
        size={3} 
        speed={1.5} 
        color={colors.accent} 
        opacity={0.8}
      />

      {/* Subtle Ground Shadows for grounding the floating scene */}
      <ContactShadows
        position={[0, -3.5, 0]}
        opacity={0.4}
        scale={15}
        blur={2.5}
        far={4}
        color={colors.primary}
      />
    </>
  );
};

export default CtaScene3D;