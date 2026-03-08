import { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import {
  Float,
  Sparkles,
  MeshDistortMaterial,
  useScroll,
  Stars
} from '@react-three/drei';
import * as THREE from 'three';

const FloatingCrystal = ({ position, color, speed, distort }: { position: [number, number, number], color: string, speed: number, distort: number }) => {
  const meshRef = useRef<THREE.Mesh>(null!);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    meshRef.current.rotation.x = Math.sin(time * 0.3) * 0.2;
    meshRef.current.rotation.y += 0.005 * speed;
    const s = hovered ? 1.4 : 1;
    meshRef.current.scale.lerp(new THREE.Vector3(s, s, s), 0.1);
  });

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={2}>
      <mesh
        ref={meshRef}
        position={position}
        onPointerOver={() => { setHovered(true); document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { setHovered(false); document.body.style.cursor = 'default'; }}
      >
        <icosahedronGeometry args={[1, 2]} />
        <MeshDistortMaterial
          color={color}
          speed={speed}
          distort={distort}
          radius={1}
          metalness={0.8}
          roughness={0.2}
          emissive={color}
          emissiveIntensity={0.5}
        />
      </mesh>
    </Float>
  );
};

const GeometricField = () => {
  const scroll = useScroll();
  const groupRef = useRef<THREE.Group>(null!);

  useFrame((state) => {
    const offset = scroll.offset;
    groupRef.current.position.y = offset * 10;
    groupRef.current.rotation.y = offset * Math.PI;
    const mouseX = (state.mouse.x * state.viewport.width) / 20;
    groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, mouseX, 0.05);
  });

  const items = useMemo(() => {
    return Array.from({ length: 12 }).map((_, i) => ({
      position: [
        (Math.random() - 0.5) * 15,
        (Math.random() - 0.5) * 20 - i * 2,
        (Math.random() - 0.5) * 10 - 5
      ] as [number, number, number],
      color: i % 2 === 0 ? '#f472b6' : '#fb7185',
      speed: 1 + Math.random() * 2,
      distort: 0.2 + Math.random() * 0.4
    }));
  }, []);

  return (
    <group ref={groupRef}>
      {items.map((item, i) => (
        <FloatingCrystal key={i} {...item} />
      ))}
    </group>
  );
};

export const BackgroundScene3D = () => {
  return (
    <>
      <GeometricField />
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={0.5} />
      <Sparkles count={40} scale={15} size={2} speed={0.3} color="#fdf2f8" />
    </>
  );
};

export default BackgroundScene3D;