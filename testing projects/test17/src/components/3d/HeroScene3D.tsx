import React, { useRef, useState, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { 
  Float, 
  Sparkles, 
  ContactShadows, 
  MeshDistortMaterial, 
  MeshWobbleMaterial, 
  useScroll,
  Icosahedron,
  Sphere,
  TorusKnot
} from '@react-three/drei';
import * as THREE from 'three';

/**
 * HeroScene3D Component
 * An immersive, cinematic 3D experience for Aethelgard's Arboretum.
 * Features:
 * - Procedural organic geometry (The Arboretum Core)
 * - Scroll-driven rotation and translation
 * - Interactive hover states with smooth lerping
 * - Fiery-dark cinematic lighting and fog
 */
export const HeroScene3D = () => {
  const scroll = useScroll();
  const { viewport } = useThree();
  
  // Refs for animation
  const groupRef = useRef<THREE.Group>(null!);
  const coreRef = useRef<THREE.Mesh>(null!);
  const ringRef = useRef<THREE.Mesh>(null!);
  const orbitRef = useRef<THREE.Group>(null!);

  // Hover states
  const [hovered, setHovered] = useState(false);

  // Memoized positions for orbiting "seeds"
  const seeds = useMemo(() => {
    return Array.from({ length: 5 }).map((_, i) => ({
      position: [
        Math.sin(i * (Math.PI * 2) / 5) * 3,
        Math.cos(i * (Math.PI * 2) / 5) * 3,
        (Math.random() - 0.5) * 2
      ] as [number, number, number],
      speed: 1 + Math.random(),
      factor: 0.2 + Math.random() * 0.4
    }));
  }, []);

  useFrame((state, delta) => {
    const scrollOffset = scroll.offset;

    // 1. Scroll-driven animations
    // Rotate the entire group based on scroll
    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, scrollOffset * Math.PI * 2, 0.1);
    groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, scrollOffset * -10, 0.1);
    
    // 2. Continuous idle animations
    const time = state.clock.getElapsedTime();
    
    // Core breathing and rotation
    coreRef.current.rotation.x += delta * 0.2;
    coreRef.current.rotation.z += delta * 0.3;
    
    // Orbiting group rotation
    orbitRef.current.rotation.z -= delta * 0.15;
    
    // 3. Interaction: Smooth scale lerp on hover
    const targetScale = hovered ? 1.2 : 1;
    coreRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);

    // 4. Parallax effect based on mouse
    const mouseX = (state.mouse.x * viewport.width) / 4;
    const mouseY = (state.mouse.y * viewport.height) / 4;
    groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, mouseX, 0.05);
    groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, mouseY, 0.05);
  });

  return (
    <>
      {/* Cinematic Atmosphere */}
      <color attach="background" args={["#050505"]} />
      <fog attach="fog" args={["#050505", 5, 20]} />
      
      {/* Lighting Rig */}
      <ambientLight intensity={0.2} />
      <spotLight 
        position={[10, 10, 10]} 
        angle={0.15} 
        penumbra={1} 
        intensity={2} 
        color="#ef4444" 
        castShadow
      />
      <pointLight position={[-10, -10, -10]} intensity={1} color="#fbbf24" />
      <pointLight position={[0, 5, 0]} intensity={1.5} color="#f97316" />

      {/* Main Scene Group */}
      <group ref={groupRef}>
        
        {/* The Central Arboretum Core */}
        <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
          <Icosahedron 
            ref={coreRef} 
            args={[1, 3]} 
            onPointerOver={() => {
              setHovered(true);
              document.body.style.cursor = "pointer";
            }}
            onPointerOut={() => {
              setHovered(false);
              document.body.style.cursor = "default";
            }}
          >
            <MeshDistortMaterial 
              color="#ef4444" 
              speed={3} 
              distort={0.4} 
              roughness={0.2} 
              metalness={0.8}
              emissive="#ef4444"
              emissiveIntensity={0.2}
            />
          </Icosahedron>
        </Float>

        {/* The Serenity Ring */}
        <Float speed={2} rotationIntensity={2} floatIntensity={1}>
          <TorusKnot ref={ringRef} args={[2, 0.02, 128, 32]}>
            <meshPhysicalMaterial 
              color="#fbbf24" 
              roughness={0} 
              metalness={1} 
              emissive="#fbbf24"
              emissiveIntensity={0.5}
            />
          </TorusKnot>
        </Float>

        {/* Orbiting Seeds */}
        <group ref={orbitRef}>
          {seeds.map((seed, i) => (
            <Float key={i} speed={seed.speed} floatIntensity={seed.factor}>
              <Sphere position={seed.position} args={[0.2, 32, 32]}>
                <MeshWobbleMaterial 
                  color="#f97316" 
                  speed={seed.speed} 
                  factor={seed.factor} 
                  roughness={0.1}
                />
              </Sphere>
            </Float>
          ))}
        </group>

        {/* Atmospheric Particles */}
        <Sparkles 
          count={60} 
          scale={12} 
          size={2} 
          speed={0.4} 
          color="#fbbf24" 
          opacity={0.6}
        />
      </group>

      {/* Grounding Shadows */}
      <ContactShadows 
        position={[0, -3.5, 0]} 
        opacity={0.4} 
        scale={15} 
        blur={2} 
        far={4.5} 
      />
    </>
  );
};

export default HeroScene3D;