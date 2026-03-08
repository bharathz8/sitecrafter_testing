import { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import {
  Float,
  ContactShadows,
  Sparkles,
  useScroll,
  useCursor,
} from '@react-three/drei';
import * as THREE from 'three';

const CosmicProduct = ({ position, color, index }: { position: [number, number, number], color: string, index: number }) => {
  const meshRef = useRef<THREE.Mesh>(null!);
  const [hovered, setHovered] = useState(false);
  useCursor(hovered);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, time * 0.15 + index, 0.1);
    meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, time * 0.2, 0.1);
    const targetScale = hovered ? 1.4 : 1.0;
    meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
    const yOffset = Math.sin(time + index) * 0.2;
    meshRef.current.position.y = position[1] + yOffset;
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <mesh
        ref={meshRef}
        position={position}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <icosahedronGeometry args={[0.6, 2]} />
        <meshPhysicalMaterial
          color={color}
          emissive={color}
          emissiveIntensity={hovered ? 2 : 0.5}
          roughness={0.1}
          metalness={0.8}
          clearcoat={1}
        />
      </mesh>
    </Float>
  );
};

const SortingGrid = () => {
  const scroll = useScroll();
  const groupRef = useRef<THREE.Group>(null!);

  const products = useMemo(() => [
    { color: '#f472b6', pos: [-2, 0, 0] as [number, number, number] },
    { color: '#fb7185', pos: [0, 1, -1] as [number, number, number] },
    { color: '#fda4af', pos: [2, -0.5, 0.5] as [number, number, number] },
    { color: '#d946ef', pos: [-1.5, 2, -2] as [number, number, number] },
    { color: '#a855f7', pos: [1.5, 2.5, -1] as [number, number, number] },
    { color: '#ec4899', pos: [0, -2, 0] as [number, number, number] },
  ], []);

  useFrame(() => {
    const r1 = scroll.range(0, 1 / 3);
    const r2 = scroll.range(1 / 3, 1 / 3);
    groupRef.current.rotation.y = THREE.MathUtils.lerp(0, Math.PI, r1);
    groupRef.current.position.z = THREE.MathUtils.lerp(0, -5, r2);
  });

  return (
    <group ref={groupRef}>
      {products.map((p, i) => (
        <CosmicProduct key={i} index={i} position={p.pos} color={p.color} />
      ))}
    </group>
  );
};

export const ShowcaseScene3D = () => {
  return (
    <>
      <ambientLight intensity={0.2} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={2} color="#f472b6" />
      <pointLight position={[-10, -10, -10]} intensity={1} color="#a855f7" />
      <fog attach="fog" args={['#0a0a0a', 5, 25]} />

      <SortingGrid />

      <Sparkles count={50} scale={10} size={2} speed={0.4} color="#fda4af" />
      <ContactShadows position={[0, -4.5, 0]} opacity={0.4} scale={20} blur={2} far={4.5} />
    </>
  );
};

export default ShowcaseScene3D;