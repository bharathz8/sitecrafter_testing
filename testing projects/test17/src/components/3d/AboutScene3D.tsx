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
 * AboutScene3D - An immersive 3D experience for the "Team" and "Mission" section.
 * Represents Aethelgard's Arboretum through organic, living geometries.
 * 
 * Rules:
 * - Pure R3F Fragment (No Canvas)
 * - Fiery-dark palette (#ef4444, #f97316, #fbbf24)
 * - Zoom-burst scroll animation
 * - Abstract geometry (Spheres = Unity, Cones = Growth)
 */
export const AboutScene3D = () => {
  const scroll = useScroll();
  const { viewport } = useThree();
  
  const groupRef = useRef<THREE.Group>(null!);
  const coreRef = useRef<THREE.Mesh>(null!);
  const ringRef = useRef<THREE.Group>(null!);

  // Generate random data for orbiting "Growth" cones
  const growthNodes = useMemo(() => {
    return Array.from({ length: 6 }).map((_, i) => ({
      position: [
        Math.sin((i / 6) * Math.PI * 2) * 3,
        Math.cos((i / 6) * Math.PI * 2) * 3,
        (Math.random() - 0.5) * 2
      ] as [number, number, number],
      rotation: [Math.random() * Math.PI, Math.random() * Math.PI, 0] as [number, number, number],
      scale: 0.4 + Math.random() * 0.4,
      speed: 0.5 + Math.random() * 1.5
    }));
  }, []);

  useFrame((state, delta) => {
    const scrollOffset = scroll.offset; // 0 to 1
    
    // Zoom-burst animation: Group scales up and moves forward as we scroll
    if (groupRef.current) {
      const targetScale = 1 + scrollOffset * 2.5;
      groupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
      groupRef.current.position.z = THREE.MathUtils.lerp(0, 5, scrollOffset);
      groupRef.current.rotation.y = scrollOffset * Math.PI;
    }

    // Core "Unity" rotation and pulse
    if (coreRef.current) {
      coreRef.current.rotation.x += delta * 0.2;
      coreRef.current.rotation.y += delta * 0.3;
      const pulse = Math.sin(state.clock.elapsedTime * 2) * 0.05;
      coreRef.current.scale.setScalar(1 + pulse);
    }

    // Orbiting ring of growth
    if (ringRef.current) {
      ringRef.current.rotation.z -= delta * 0.15;
    }
  });

  const handlePointerOver = () => {
    document.body.style.cursor = 'pointer';
  };

  const handlePointerOut = () => {
    document.body.style.cursor = 'default';
  };

  return (
    <>
      {/* Cinematic Lighting */}
      <ambientLight intensity={0.2} />
      <spotLight 
        position={[10, 10, 10]} 
        angle={0.15} 
        penumbra={1} 
        intensity={2} 
        color="#fbbf24" 
        castShadow 
      />
      <pointLight position={[-10, -10, -10]} color="#ef4444" intensity={1.5} />
      <directionalLight position={[0, 5, 5]} intensity={0.5} color="#f97316" />

      {/* Atmospheric Fog */}
      <fog attach="fog" args={["#1c1917", 5, 25]} />

      <group ref={groupRef}>
        {/* UNITY CORE: The central distorted sphere representing the heart of the Arboretum */}
        <Float speed={1.5} rotationIntensity={0.5} floatIntensity={1}>
          <mesh 
            ref={coreRef}
            onPointerOver={handlePointerOver}
            onPointerOut={handlePointerOut}
          >
            <icosahedronGeometry args={[1.2, 2]} />
            <MeshDistortMaterial 
              color="#ef4444" 
              speed={3} 
              distort={0.4} 
              roughness={0.2}
              metalness={0.8}
              emissive="#ef4444"
              emissiveIntensity={0.2}
            />
          </mesh>
        </Float>

        {/* GROWTH NODES: Orbiting cones representing the team's continuous development */}
        <group ref={ringRef}>
          {growthNodes.map((node, i) => (
            <Float key={i} speed={node.speed} rotationIntensity={2}>
              <mesh 
                position={node.position} 
                rotation={node.rotation} 
                scale={node.scale}
              >
                <coneGeometry args={[0.5, 1, 4]} />
                <MeshWobbleMaterial 
                  color="#f97316" 
                  speed={2} 
                  factor={0.4} 
                  metalness={0.6}
                  roughness={0.3}
                />
              </mesh>
            </Float>
          ))}
        </group>

        {/* WISDOM FACETS: Smaller floating accents */}
        <Float speed={4} rotationIntensity={1.5}>
          <mesh position={[2, -1.5, -2]}>
            <icosahedronGeometry args={[0.3, 1]} />
            <meshPhysicalMaterial 
              color="#fbbf24" 
              emissive="#fbbf24" 
              emissiveIntensity={0.5}
              clearcoat={1}
              metalness={0.9}
            />
          </mesh>
        </Float>
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

      {/* Grounding Shadows */}
      <ContactShadows 
        position={[0, -4, 0]} 
        opacity={0.4} 
        scale={20} 
        blur={2.5} 
        far={4.5} 
        color="#000000"
      />
    </>
  );
};

export default AboutScene3D;