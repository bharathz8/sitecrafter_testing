import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { 
  Float, 
  ContactShadows, 
  Sparkles, 
  MeshDistortMaterial, 
  MeshWobbleMaterial, 
  useScroll 
} from '@react-three/drei';
import * as THREE from 'three';

/**
 * AboutScene3D
 * An immersive 3D scene for the About Page header.
 * Represents brand values: Spheres (Unity), Cones (Growth), and Icosahedrons (Innovation).
 * Theme: Neon Cyberpunk Floral-Light (#f472b6, #fb7185, #fda4af)
 */
export const AboutScene3D = () => {
  const scroll = useScroll();
  const mainGroupRef = useRef<THREE.Group>(null);
  const unityGroupRef = useRef<THREE.Group>(null);
  const growthGroupRef = useRef<THREE.Group>(null);

  // Animation loop for smooth orbital motion and scroll reactivity
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const scrollOffset = scroll?.offset || 0;

    if (mainGroupRef.current) {
      // Rotate the entire scene based on scroll
      mainGroupRef.current.rotation.y = THREE.MathUtils.lerp(
        mainGroupRef.current.rotation.y,
        scrollOffset * Math.PI * 2,
        0.1
      );
      // Subtle floating movement
      mainGroupRef.current.position.y = Math.sin(time * 0.5) * 0.2;
    }

    if (unityGroupRef.current) {
      // Spheres orbiting slowly
      unityGroupRef.current.rotation.z = time * 0.2;
      unityGroupRef.current.rotation.x = Math.cos(time * 0.3) * 0.1;
    }

    if (growthGroupRef.current) {
      // Cones pulsing and rotating
      growthGroupRef.current.rotation.y = -time * 0.15;
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
        color="#f472b6" 
        castShadow 
      />
      <pointLight position={[-10, -10, -10]} color="#fb7185" intensity={1.5} />
      <fog attach="fog" args={["#fdf2f8", 5, 25]} />

      <group ref={mainGroupRef}>
        {/* INNOVATION CORE: Central Icosahedron */}
        <Float speed={2} rotationIntensity={1.5} floatIntensity={2}>
          <mesh 
            onPointerOver={() => { document.body.style.cursor = "pointer" }}
            onPointerOut={() => { document.body.style.cursor = "default" }}
          >
            <icosahedronGeometry args={[1, 2]} />
            <meshPhysicalMaterial 
              color="#f472b6"
              emissive="#f472b6"
              emissiveIntensity={0.5}
              roughness={0.1}
              metalness={0.8}
              clearcoat={1}
            />
          </mesh>
        </Float>

        {/* UNITY: Orbiting Spheres */}
        <group ref={unityGroupRef}>
          {[...Array(3)].map((_, i) => (
            <Float key={`sphere-${i}`} speed={1.5} position={[Math.cos(i * 2) * 3, Math.sin(i * 2) * 3, 0]}>
              <mesh>
                <sphereGeometry args={[0.4, 32, 32]} />
                <MeshWobbleMaterial 
                  color="#fb7185" 
                  speed={2} 
                  factor={0.4} 
                  roughness={0.2}
                  metalness={0.9}
                />
              </mesh>
            </Float>
          ))}
        </group>

        {/* GROWTH: Abstract Cones */}
        <group ref={growthGroupRef}>
          {[...Array(4)].map((_, i) => (
            <Float key={`cone-${i}`} speed={1.2} position={[Math.sin(i * 1.5) * 4, -1, Math.cos(i * 1.5) * 4]}>
              <mesh rotation={[Math.PI / 4, 0, i]}>
                <coneGeometry args={[0.3, 0.8, 16]} />
                <MeshDistortMaterial 
                  color="#fda4af" 
                  speed={3} 
                  distort={0.4} 
                  radius={1}
                />
              </mesh>
            </Float>
          ))}
        </group>
      </group>

      {/* Atmospheric Elements */}
      <Sparkles 
        count={60} 
        scale={10} 
        size={1.5} 
        speed={0.4} 
        color="#f472b6" 
      />
      
      <ContactShadows 
        position={[0, -3.5, 0]} 
        opacity={0.4} 
        scale={20} 
        blur={2} 
        far={4.5} 
      />
    </>
  );
};

export default AboutScene3D;