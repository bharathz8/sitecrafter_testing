import React, { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Float, Sparkles, useScroll, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

/**
 * BackgroundScene3D
 * 
 * An immersive, ambient 3D background layer for the Neon Cyberpunk Expedition.
 * Features floating geometric shapes with a "floral-light" aesthetic.
 * Uses parallax scrolling and organic distortions to create a high-end cinematic feel.
 * 
 * Type: TYPE 1: 3D SCENE COMPONENT
 */
export const BackgroundScene3D = () => {
  const { viewport } = useThree();
  const scroll = useScroll();
  const groupRef = useRef<THREE.Group>(null!);

  // Generate a collection of floating elements with varying properties
  // We use useMemo to ensure these values are stable across renders
  const elements = useMemo(() => {
    return Array.from({ length: 16 }).map((_, i) => ({
      // Spread positions across the viewport width and deep into the Z-axis
      position: [
        (Math.random() - 0.5) * viewport.width * 2.5,
        (Math.random() - 0.5) * viewport.height * 5,
        -2 - Math.random() * 6 // Depth range -2 to -8 as requested
      ] as [number, number, number],
      rotation: [
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      ] as [number, number, number],
      scale: 0.3 + Math.random() * 0.8,
      speed: 0.2 + Math.random() * 0.5,
      // Cycle through theme colors: #f472b6 (primary), #fb7185 (secondary), #fda4af (accent)
      color: i % 3 === 0 ? "#f472b6" : i % 3 === 1 ? "#fb7185" : "#fda4af",
      type: i % 4 // used to determine geometry type
    }));
  }, [viewport]);

  useFrame((state) => {
    if (!groupRef.current) return;

    // 1. SCROLL PARALLAX
    // scroll.offset ranges from 0 to 1 based on page scroll position
    const scrollOffset = scroll.offset;
    const targetY = scrollOffset * viewport.height * 3;
    
    // Smoothly interpolate the group position for a cinematic parallax effect
    groupRef.current.position.y = THREE.MathUtils.lerp(
      groupRef.current.position.y,
      targetY,
      0.05
    );

    // 2. AMBIENT ROTATION
    const time = state.clock.getElapsedTime();
    groupRef.current.rotation.z = Math.sin(time * 0.1) * 0.02;
    groupRef.current.rotation.y = Math.cos(time * 0.05) * 0.02;
  });

  return (
    <>
      {/* 
          CINEMATIC LIGHTING 
          Designed for the "floral-light" theme with Neon Cyberpunk accents
      */}
      <ambientLight intensity={0.4} />
      <spotLight 
        position={[15, 20, 5]} 
        angle={0.3} 
        penumbra={1} 
        intensity={2.5} 
        color="#f472b6" 
      />
      <pointLight position={[-10, -10, -5]} intensity={1.5} color="#fb7185" />
      <pointLight position={[0, 5, -10]} intensity={0.8} color="#fda4af" />
      
      {/* Fog creates depth and blends the 3D scene with the HTML background color (#fdf2f8) */}
      <fog attach="fog" args={["#fdf2f8", 5, 22]} />

      <group ref={groupRef}>
        {elements.map((el, i) => (
          <Float
            key={i}
            speed={el.speed * 2.5}
            rotationIntensity={2}
            floatIntensity={1.5}
            position={el.position}
          >
            <mesh rotation={el.rotation} scale={el.scale}>
              {/* Variety of geometries for a tech-organic hybrid look */}
              {el.type === 0 && <icosahedronGeometry args={[1, 2]} />}
              {el.type === 1 && <torusKnotGeometry args={[0.6, 0.2, 64, 12]} />}
              {el.type === 2 && <sphereGeometry args={[0.8, 32, 32]} />}
              {el.type === 3 && <dodecahedronGeometry args={[0.9, 0]} />}

              {/* 
                  Hybrid Materials: 
                  Alternating between MeshDistortMaterial for organic "floral" feel
                  and meshPhysicalMaterial for "cyberpunk" sleek glass/metal feel.
              */}
              {i % 2 === 0 ? (
                <MeshDistortMaterial
                  color={el.color}
                  speed={2}
                  distort={0.4}
                  radius={1}
                  transparent
                  opacity={0.3}
                  roughness={0.2}
                  metalness={0.8}
                />
              ) : (
                <meshPhysicalMaterial
                  color={el.color}
                  transparent
                  opacity={0.3}
                  roughness={0.1}
                  metalness={0.9}
                  clearcoat={1}
                  clearcoatRoughness={0.1}
                  reflectivity={1}
                />
              )}
            </mesh>
          </Float>
        ))}
      </group>

      {/* 
          ATMOSPHERIC PARTICLES
          Subtle floating "pollen" or "data bits" to enhance immersion 
      */}
      <Sparkles
        count={40}
        scale={25}
        size={1.5}
        speed={0.4}
        color="#f472b6"
        opacity={0.4}
      />
      
      {/* Distant star-like points for additional texture */}
      <Sparkles
        count={20}
        scale={30}
        size={0.8}
        speed={0.2}
        color="#fda4af"
        opacity={0.3}
      />
    </>
  );
};

export default BackgroundScene3D;