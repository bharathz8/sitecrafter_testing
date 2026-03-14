import React, { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { 
  Float, 
  Sparkles, 
  MeshDistortMaterial, 
  MeshWobbleMaterial, 
  useScroll 
} from '@react-three/drei';
import * as THREE from 'three';

/**
 * FeatureItem handles individual interactive 3D objects with hover states 
 * and smooth lerped animations.
 */
const FeatureItem = ({ 
  position, 
  color, 
  geometry, 
  materialType = 'physical',
  index 
}: { 
  position: [number, number, number], 
  color: string, 
  geometry: React.ReactNode,
  materialType?: 'distort' | 'wobble' | 'physical',
  index: number
}) => {
  const meshRef = useRef<THREE.Mesh>(null!);
  const [hovered, setHover] = useState(false);

  useFrame((state) => {
    if (!meshRef.current) return;
    
    // Smooth scale lerp on hover
    const targetScale = hovered ? 1.3 : 1;
    meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
    
    // Subtle individual rotation based on index and time
    const t = state.clock.getElapsedTime();
    meshRef.current.rotation.x = Math.sin(t * 0.5 + index) * 0.2;
    meshRef.current.rotation.y = Math.cos(t * 0.3 + index) * 0.2;
  });

  return (
    <Float speed={1.5 + index * 0.2} rotationIntensity={1} floatIntensity={1.5}>
      <mesh
        ref={meshRef}
        position={position}
        onPointerOver={() => {
          setHover(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          setHover(false);
          document.body.style.cursor = 'default';
        }}
      >
        {geometry}
        {materialType === 'distort' && (
          <MeshDistortMaterial 
            color={color} 
            speed={3} 
            distort={0.4} 
            emissive={color} 
            emissiveIntensity={0.5} 
          />
        )}
        {materialType === 'wobble' && (
          <MeshWobbleMaterial 
            color={color} 
            speed={2} 
            factor={0.6} 
            emissive={color} 
            emissiveIntensity={0.3} 
          />
        )}
        {materialType === 'physical' && (
          <meshPhysicalMaterial 
            color={color}
            emissive={color}
            emissiveIntensity={0.8}
            roughness={0.1}
            metalness={0.9}
            clearcoat={1}
            reflectivity={1}
          />
        )}
      </mesh>
    </Float>
  );
};

/**
 * FeaturesScene3D: An immersive 3D fragment showcasing key features.
 * Responds to scroll position and contains interactive floral-cyberpunk elements.
 */
export const FeaturesScene3D = () => {
  const groupRef = useRef<THREE.Group>(null!);
  const scroll = useScroll();

  // Create a circular layout for the features
  const features = useMemo(() => [
    {
      type: 'distort' as const,
      color: '#f472b6', // Primary Pink
      geometry: <icosahedronGeometry args={[0.8, 2]} />,
      position: [3, 0, 0] as [number, number, number]
    },
    {
      type: 'physical' as const,
      color: '#fb7185', // Secondary Coral
      geometry: <torusKnotGeometry args={[0.5, 0.2, 128, 32]} />,
      position: [1.5, 2.5, -1] as [number, number, number]
    },
    {
      type: 'wobble' as const,
      color: '#fda4af', // Accent Rose
      geometry: <dodecahedronGeometry args={[0.7, 0]} />,
      position: [-1.5, 2.5, -1] as [number, number, number]
    },
    {
      type: 'physical' as const,
      color: '#f472b6',
      geometry: <sphereGeometry args={[0.6, 32, 32]} />,
      position: [-3, 0, 0] as [number, number, number]
    },
    {
      type: 'distort' as const,
      color: '#fb7185',
      geometry: <octahedronGeometry args={[0.8, 0]} />,
      position: [0, -2.5, -1] as [number, number, number]
    }
  ], []);

  useFrame(() => {
    if (!groupRef.current) return;
    
    // Rotate the entire group based on scroll position
    // scroll.offset goes from 0 to 1
    const rotationY = scroll.offset * Math.PI * 2;
    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, rotationY, 0.05);
    
    // Subtle breathing scale for the whole group
    const scale = 1 + Math.sin(Date.now() * 0.001) * 0.05;
    groupRef.current.scale.set(scale, scale, scale);
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
      <pointLight position={[-10, -10, -10]} intensity={1} color="#fda4af" />
      <directionalLight position={[0, 5, 5]} intensity={0.5} color="#ffffff" />

      {/* Atmospheric Fog */}
      <fog attach="fog" args={["#000", 5, 25]} />

      {/* Main Feature Group */}
      <group ref={groupRef}>
        {features.map((feature, i) => (
          <FeatureItem 
            key={i}
            index={i}
            position={feature.position}
            color={feature.color}
            geometry={feature.geometry}
            materialType={feature.type}
          />
        ))}
      </group>

      {/* Ambient Visual Effects */}
      <Sparkles 
        count={50} 
        scale={12} 
        size={2} 
        speed={0.4} 
        color="#f472b6" 
        opacity={0.6}
      />
      
      <Sparkles 
        count={30} 
        scale={15} 
        size={1.5} 
        speed={0.2} 
        color="#fda4af" 
        opacity={0.4}
      />

      {/* Floor Depth */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -5, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial 
          color="#050505" 
          transparent 
          opacity={0.5} 
          roughness={1}
        />
      </mesh>
    </>
  );
};

export default FeaturesScene3D;