import React, { useRef, useState, useMemo } from 'react';
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
 * FeaturesScene3D Component
 * 
 * An immersive 3D scene designed for the "Featured Articles" section.
 * Features organic, fiery-dark geometric forms that respond to scroll and interaction.
 * 
 * TYPE 1: 3D SCENE COMPONENT
 */

const FeatureItem = ({ 
  position, 
  color, 
  type = 'icosahedron', 
  distort = 0.3, 
  speed = 2 
}: { 
  position: [number, number, number], 
  color: string, 
  type?: 'icosahedron' | 'torusKnot' | 'dodecahedron' | 'sphere',
  distort?: number,
  speed?: number
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (!meshRef.current) return;
    
    // Smooth hover scaling
    const targetScale = hovered ? 1.4 : 1;
    meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
    
    // Subtle additional rotation
    meshRef.current.rotation.x += 0.005;
    meshRef.current.rotation.y += 0.005;
  });

  return (
    <Float speed={speed} rotationIntensity={1.5} floatIntensity={2}>
      <mesh
        ref={meshRef}
        position={position}
        onPointerOver={() => {
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = 'default';
        }}
      >
        {type === 'icosahedron' && <icosahedronGeometry args={[1, 2]} />}
        {type === 'torusKnot' && <torusKnotGeometry args={[0.6, 0.2, 128, 32]} />}
        {type === 'dodecahedron' && <dodecahedronGeometry args={[0.8, 0]} />}
        {type === 'sphere' && <sphereGeometry args={[0.8, 32, 32]} />}

        {type === 'icosahedron' ? (
          <MeshDistortMaterial 
            color={color} 
            speed={speed} 
            distort={distort} 
            emissive={color}
            emissiveIntensity={0.5}
            metalness={0.8}
            roughness={0.2}
          />
        ) : (
          <MeshWobbleMaterial 
            color={color} 
            speed={speed} 
            factor={distort} 
            emissive={color}
            emissiveIntensity={0.4}
            metalness={0.9}
            roughness={0.1}
          />
        )}
      </mesh>
    </Float>
  );
};

export const FeaturesScene3D = () => {
  const groupRef = useRef<THREE.Group>(null);
  const scroll = useScroll();
  const { viewport } = useThree();

  // Features data: Positioned in a circular arrangement
  const features = useMemo(() => [
    { pos: [-3, 1.5, 0], color: "#ef4444", type: "icosahedron" as const, distort: 0.4, speed: 2.5 },
    { pos: [3, 1.5, -1], color: "#f97316", type: "torusKnot" as const, distort: 0.3, speed: 1.8 },
    { pos: [-2.5, -1.8, 1], color: "#fbbf24", type: "dodecahedron" as const, distort: 0.2, speed: 2.2 },
    { pos: [2.8, -2, 0.5], color: "#ef4444", type: "sphere" as const, distort: 0.5, speed: 3.0 },
    { pos: [0, 0, -2], color: "#f97316", type: "icosahedron" as const, distort: 0.3, speed: 1.5 },
  ], []);

  useFrame((state) => {
    if (!groupRef.current) return;

    // Get scroll offset (0 to 1)
    const offset = scroll.offset;

    // Zoom-burst effect: Group moves forward and expands as user scrolls
    groupRef.current.position.z = offset * 10;
    groupRef.current.rotation.z = offset * Math.PI * 0.5;
    
    // Subtle parallax based on mouse
    const mouseX = (state.mouse.x * viewport.width) / 10;
    const mouseY = (state.mouse.y * viewport.height) / 10;
    groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, mouseX, 0.1);
    groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, mouseY, 0.1);
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
        color="#ef4444" 
        castShadow 
      />
      <pointLight position={[-10, -10, -10]} intensity={1} color="#fbbf24" />
      <pointLight position={[0, 5, 5]} intensity={0.5} color="#f97316" />

      {/* Atmospheric Effects */}
      <fog attach="fog" args={["#1c1917", 5, 25]} />
      <Sparkles 
        count={80} 
        scale={15} 
        size={2} 
        speed={0.4} 
        color="#fbbf24" 
        opacity={0.6}
      />

      {/* Main Content Group */}
      <group ref={groupRef}>
        {features.map((f, i) => (
          <FeatureItem 
            key={i} 
            position={f.pos} 
            color={f.color} 
            type={f.type} 
            distort={f.distort}
            speed={f.speed}
          />
        ))}
      </group>

      {/* Ground shadows for depth */}
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

export default FeaturesScene3D;