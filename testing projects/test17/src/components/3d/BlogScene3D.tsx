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
 * BlogScene3D - A cinematic 3D environment for the Article Grid section.
 * Theme: Sage Serenity / Fiery-Dark
 * Features: Floating abstract "knowledge nodes", scroll-reactive parallax, 
 * and organic fiery light effects.
 */
export const BlogScene3D = () => {
  const groupRef = useRef<THREE.Group>(null);
  const scroll = useScroll();
  const { viewport } = useThree();

  // Generate stable random positions for floating "Article Nodes"
  const nodes = useMemo(() => {
    return Array.from({ length: 8 }).map((_, i) => ({
      position: [
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 15 - 2,
        (Math.random() - 0.5) * 5,
      ] as [number, number, number],
      scale: 0.2 + Math.random() * 0.5,
      speed: 1 + Math.random(),
      distort: 0.2 + Math.random() * 0.4,
      color: i % 3 === 0 ? "#ef4444" : i % 3 === 1 ? "#f97316" : "#fbbf24",
    }));
  }, []);

  useFrame((state) => {
    if (!groupRef.current) return;

    // Scroll-driven interaction: Rotate and slightly "zoom-burst" the scene
    const scrollOffset = scroll.offset;
    
    // Smooth rotation based on scroll
    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      scrollOffset * Math.PI * 0.5,
      0.1
    );

    // Subtle vertical parallax
    groupRef.current.position.y = THREE.MathUtils.lerp(
      groupRef.current.position.y,
      scrollOffset * 2,
      0.1
    );

    // Floating movement for the whole group
    const time = state.clock.getElapsedTime();
    groupRef.current.position.x = Math.sin(time * 0.2) * 0.2;
  });

  return (
    <>
      {/* Cinematic Lighting */}
      <ambientLight intensity={0.2} />
      <spotLight 
        position={[10, 10, 10]} 
        angle={0.15} 
        penumbra={1} 
        intensity={2} 
        color="#f97316" 
        castShadow 
      />
      <pointLight position={[-10, -10, -10]} intensity={1} color="#ef4444" />
      
      {/* Fog for depth and "Sage Serenity" atmosphere */}
      <fog attach="fog" args={["#1c1917", 8, 25]} />

      <group ref={groupRef}>
        {/* Central Abstract "Arboretum Core" */}
        <Float speed={1.5} rotationIntensity={0.5} floatIntensity={1}>
          <mesh position={[0, 0, -2]} castShadow receiveShadow>
            <icosahedronGeometry args={[2, 2]} />
            <MeshDistortMaterial 
              color="#f97316" 
              speed={2} 
              distort={0.3} 
              emissive="#ef4444"
              emissiveIntensity={0.2}
              roughness={0.1}
              metalness={0.8}
            />
          </mesh>
        </Float>

        {/* Floating Article Nodes */}
        {nodes.map((node, i) => (
          <Float 
            key={i} 
            position={node.position} 
            speed={node.speed} 
            rotationIntensity={2}
          >
            <mesh 
              scale={node.scale}
              onPointerOver={() => { document.body.style.cursor = "pointer" }}
              onPointerOut={() => { document.body.style.cursor = "default" }}
            >
              <dodecahedronGeometry args={[1, 0]} />
              <MeshWobbleMaterial 
                color={node.color} 
                speed={node.speed} 
                factor={node.distort} 
                roughness={0.2}
                metalness={0.9}
              />
            </mesh>
          </Float>
        ))}

        {/* Background "Knowledge Dust" */}
        <Sparkles 
          count={30} 
          scale={15} 
          size={3} 
          speed={0.4} 
          color="#fbbf24" 
          opacity={0.6}
        />
      </group>

      {/* Ground shadows for grounded realism */}
      <ContactShadows 
        position={[0, -5, 0]} 
        opacity={0.4} 
        scale={20} 
        blur={2.5} 
        far={10} 
        color="#000000"
      />

      {/* Abstract background planes for texture */}
      <mesh position={[0, -8, -10]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial 
          color="#1c1917" 
          roughness={1} 
          metalness={0} 
          transparent 
          opacity={0.5} 
        />
      </mesh>
    </>
  );
};

export default BlogScene3D;