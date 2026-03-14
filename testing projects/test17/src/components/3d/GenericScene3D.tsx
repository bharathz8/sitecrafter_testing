import React, { useRef, useState, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { 
  Float, 
  Sparkles, 
  ContactShadows, 
  MeshDistortMaterial, 
  MeshWobbleMaterial, 
  useScroll,
  Stars
} from '@react-three/drei';
import * as THREE from 'three';

/**
 * TYPE 1: 3D SCENE COMPONENT
 * GenericScene3D - Designed for the "StorySection" of the Neon Cyberpunk Expedition.
 * Features a "Digital Sakura" aesthetic: organic distorted geometries meets neon lighting.
 */
export const GenericScene3D = () => {
  const scroll = useScroll();
  const { viewport } = useThree();
  
  // Refs for animations
  const coreRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Group>(null);
  const particlesRef = useRef<THREE.Group>(null);
  
  // Interaction states
  const [hovered, setHovered] = useState(false);
  
  // Generate random positions for floating "petals"
  const petals = useMemo(() => {
    return Array.from({ length: 12 }).map((_, i) => ({
      position: [
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 5,
      ] as [number, number, number],
      rotation: [Math.random() * Math.PI, Math.random() * Math.PI, 0] as [number, number, number],
      scale: 0.2 + Math.random() * 0.4,
      speed: 0.5 + Math.random(),
    }));
  }, []);

  useFrame((state, delta) => {
    const scrollOffset = scroll.offset; // 0 to 1

    // Core Animation: Rotate and respond to scroll
    if (coreRef.current) {
      coreRef.current.rotation.y += delta * 0.2;
      coreRef.current.rotation.z += delta * 0.1;
      
      // Move core based on scroll
      coreRef.current.position.y = THREE.MathUtils.lerp(coreRef.current.position.y, -scrollOffset * 5, 0.1);
      
      // Scale pulse on hover
      const targetScale = hovered ? 1.2 : 1;
      coreRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
    }

    // Floating ring animation
    if (ringRef.current) {
      ringRef.current.rotation.z -= delta * 0.15;
      ringRef.current.rotation.x = THREE.MathUtils.lerp(ringRef.current.rotation.x, scrollOffset * Math.PI, 0.05);
    }

    // Subtle parallax for particles
    if (particlesRef.current) {
      particlesRef.current.position.y = scrollOffset * 2;
    }
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
        color="#f472b6" 
        castShadow
      />
      <pointLight position={[-10, -10, -10]} intensity={1} color="#fb7185" />
      <pointLight position={[0, 5, 0]} intensity={0.5} color="#fda4af" />
      
      {/* Atmosphere */}
      <fog attach="fog" args={["#000", 5, 25]} />
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      <Sparkles 
        count={60} 
        scale={15} 
        size={2} 
        speed={0.4} 
        color="#f472b6" 
        opacity={0.6}
      />

      {/* Main Interactive Core (The "Digital Heart") */}
      <Float speed={1.5} rotationIntensity={0.5} floatIntensity={1}>
        <mesh 
          ref={coreRef}
          onPointerOver={() => {
            setHovered(true);
            document.body.style.cursor = "pointer";
          }}
          onPointerOut={() => {
            setHovered(false);
            document.body.style.cursor = "default";
          }}
        >
          <icosahedronGeometry args={[1.5, 3]} />
          <MeshDistortMaterial 
            color="#f472b6" 
            speed={2} 
            distort={0.4} 
            radius={1}
            emissive="#fb7185"
            emissiveIntensity={0.5}
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>
      </Float>

      {/* Orbital Rings */}
      <group ref={ringRef}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[3, 0.02, 16, 100]} />
          <meshPhysicalMaterial 
            color="#fda4af" 
            emissive="#f472b6" 
            emissiveIntensity={2} 
            transparent 
            opacity={0.5} 
          />
        </mesh>
        <mesh rotation={[Math.PI / 2.5, 0.5, 0]}>
          <torusGeometry args={[3.5, 0.01, 16, 100]} />
          <meshStandardMaterial color="#fb7185" emissive="#fb7185" emissiveIntensity={1} />
        </mesh>
      </group>

      {/* Floating "Data Petals" */}
      <group ref={particlesRef}>
        {petals.map((petal, i) => (
          <Float key={i} speed={petal.speed} rotationIntensity={2} floatIntensity={2}>
            <mesh position={petal.position} rotation={petal.rotation} scale={petal.scale}>
              <dodecahedronGeometry args={[1, 0]} />
              <MeshWobbleMaterial 
                color={i % 2 === 0 ? "#f472b6" : "#fda4af"} 
                speed={2} 
                factor={0.4} 
                metalness={0.9}
                roughness={0.1}
              />
            </mesh>
          </Float>
        ))}
      </group>

      {/* Ground Shadow for Depth */}
      <ContactShadows 
        position={[0, -4, 0]} 
        opacity={0.4} 
        scale={20} 
        blur={2} 
        far={4.5} 
        color="#f472b6" 
      />
    </>
  );
};

export default GenericScene3D;