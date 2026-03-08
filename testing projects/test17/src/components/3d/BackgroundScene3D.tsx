import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Sparkles, MeshDistortMaterial, useScroll } from '@react-three/drei';
import * as THREE from 'three';

/**
 * BackgroundScene3D
 * Type 1: 3D Scene Component
 * 
 * An immersive, ambient background layer featuring floating organic geometries,
 * cinematic lighting, and scroll-reactive parallax effects.
 * 
 * Theme: Fiery-Dark (Aethelgard's Arboretum)
 */
export const BackgroundScene3D = () => {
  const groupRef = useRef<THREE.Group>(null);
  const scroll = useScroll();

  // Generate random data for floating geometry
  const shapes = useMemo(() => {
    return Array.from({ length: 12 }).map((_, i) => ({
      position: [
        (Math.random() - 0.5) * 15,
        (Math.random() - 0.5) * 15,
        -2 - Math.random() * 6,
      ] as [number, number, number],
      scale: 0.4 + Math.random() * 0.8,
      speed: 0.5 + Math.random(),
      distort: 0.2 + Math.random() * 0.4,
      color: i % 3 === 0 ? "#ef4444" : i % 3 === 1 ? "#f97316" : "#fbbf24",
      type: i % 3, // 0: Icosahedron, 1: TorusKnot, 2: Sphere
    }));
  }, []);

  useFrame((state) => {
    if (!groupRef.current) return;

    // Subtle parallax based on scroll position
    // offset is 0 at top, 1 at bottom
    const scrollOffset = scroll.offset;
    groupRef.current.position.y = THREE.MathUtils.lerp(
      groupRef.current.position.y,
      scrollOffset * 5,
      0.1
    );

    // Continuous floating rotation
    groupRef.current.rotation.z += 0.001;
    groupRef.current.rotation.y += 0.0005;
  });

  return (
    <>
      {/* Cinematic Lighting */}
      <ambientLight intensity={0.2} />
      <pointLight position={[10, 10, 10]} intensity={1.5} color="#ef4444" />
      <pointLight position={[-10, -10, -5]} intensity={1} color="#fbbf24" />
      <spotLight 
        position={[0, 5, 10]} 
        angle={0.3} 
        penumbra={1} 
        intensity={2} 
        color="#f97316" 
        castShadow 
      />
      
      {/* Background Fog for Depth */}
      <fog attach="fog" args={["#1c1917", 5, 25]} />

      {/* Floating Elements Group */}
      <group ref={groupRef}>
        {shapes.map((shape, index) => (
          <Float 
            key={index} 
            speed={shape.speed} 
            rotationIntensity={1.5} 
            floatIntensity={2}
            position={shape.position}
          >
            <mesh 
              scale={shape.scale}
              onPointerOver={() => { document.body.style.cursor = "pointer" }}
              onPointerOut={() => { document.body.style.cursor = "default" }}
            >
              {shape.type === 0 && <icosahedronGeometry args={[1, 2]} />}
              {shape.type === 1 && <torusKnotGeometry args={[0.6, 0.2, 64, 16]} />}
              {shape.type === 2 && <sphereGeometry args={[0.8, 32, 32]} />}

              <MeshDistortMaterial
                color={shape.color}
                speed={shape.speed * 2}
                distort={shape.distort}
                radius={1}
                emissive={shape.color}
                emissiveIntensity={0.2}
                transparent
                opacity={0.35}
                roughness={0.1}
                metalness={0.8}
              />
            </mesh>
          </Float>
        ))}

        {/* Supporting static geometric "nodes" with meshPhysicalMaterial */}
        {Array.from({ length: 8 }).map((_, i) => (
          <mesh 
            key={`node-${i}`} 
            position={[
              (Math.random() - 0.5) * 20,
              (Math.random() - 0.5) * 20,
              -10
            ]}
            rotation={[Math.random() * Math.PI, 0, 0]}
          >
            <boxGeometry args={[0.2, 0.2, 0.2]} />
            <meshPhysicalMaterial 
              color="#fbbf24" 
              transparent 
              opacity={0.2} 
              metalness={0.9} 
              roughness={0.1} 
              clearcoat={1}
            />
          </mesh>
        ))}
      </group>

      {/* Fiery Dust Particles */}
      <Sparkles 
        count={40} 
        scale={15} 
        size={2} 
        speed={0.4} 
        color="#f97316" 
        opacity={0.6}
      />
      
      <Sparkles 
        count={20} 
        scale={20} 
        size={4} 
        speed={0.2} 
        color="#fbbf24" 
        opacity={0.4}
      />

      {/* Subtle Ground Shadows for Depth perception */}
      <ContactShadows
        position={[0, -10, 0]}
        opacity={0.4}
        scale={40}
        blur={2}
        far={20}
        color="#000000"
      />
    </>
  );
};

export default BackgroundScene3D;