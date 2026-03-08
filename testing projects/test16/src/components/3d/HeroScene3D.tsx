import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import {
  Float,
  Sparkles,
  MeshDistortMaterial,
  useScroll,
  ContactShadows
} from '@react-three/drei';
import * as THREE from 'three';

const CosmicFlower = ({ position, color, scale = 1 }: { position: [number, number, number], color: string, scale?: number }) => {
  const meshRef = useRef<THREE.Mesh>(null!);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    meshRef.current.rotation.x = Math.cos(t / 6) / 8;
    meshRef.current.rotation.y = Math.sin(t / 6) / 8;
    meshRef.current.rotation.z += 0.003;
    const targetScale = hovered ? scale * 1.2 : scale;
    meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
  });

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onPointerOver={() => { setHovered(true); document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { setHovered(false); document.body.style.cursor = 'default'; }}
      >
        <icosahedronGeometry args={[1, 2]} />
        <MeshDistortMaterial
          color={color}
          speed={2}
          distort={0.4}
          radius={1}
          emissive={color}
          emissiveIntensity={hovered ? 1.5 : 0.5}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
      {[...Array(5)].map((_, i) => (
        <group key={i} rotation={[0, 0, (i * Math.PI * 2) / 5]}>
          <mesh position={[1.2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <coneGeometry args={[0.3, 1, 4]} />
            <meshPhysicalMaterial color={color} emissive={color} emissiveIntensity={0.2} clearcoat={1} />
          </mesh>
        </group>
      ))}
    </group>
  );
};

const AnimatedBackground = () => {
  const scroll = useScroll();
  const groupRef = useRef<THREE.Group>(null!);

  useFrame(() => {
    const offset = scroll.offset;
    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, offset * Math.PI, 0.1);
    groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, offset * -5, 0.1);
  });

  return (
    <group ref={groupRef}>
      <Sparkles count={60} scale={15} size={2} speed={0.3} color="#f472b6" />
      <Float speed={2} rotationIntensity={1} floatIntensity={2}>
        <CosmicFlower position={[0, 0, 0]} color="#f472b6" scale={1.5} />
      </Float>
      <Float speed={1.5} rotationIntensity={0.5} floatIntensity={1}>
        <CosmicFlower position={[-4, 2, -3]} color="#fb7185" scale={0.8} />
      </Float>
      <Float speed={1.8} rotationIntensity={0.8} floatIntensity={1.2}>
        <CosmicFlower position={[4, -2, -4]} color="#fda4af" scale={1} />
      </Float>
      {[...Array(10)].map((_, i) => (
        <group key={i} position={[Math.sin(i) * 8, -5, Math.cos(i) * 8]}>
          <mesh>
            <cylinderGeometry args={[0.05, 0.1, 4, 8]} />
            <meshStandardMaterial color="#f472b6" emissive="#f472b6" emissiveIntensity={0.2} />
          </mesh>
          <mesh position={[0, 2, 0]}>
            <coneGeometry args={[0.2, 0.8, 4]} />
            <meshStandardMaterial color="#fb7185" />
          </mesh>
        </group>
      ))}
    </group>
  );
};

export const HeroScene3D = () => {
  return (
    <>
      <ambientLight intensity={0.2} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} color="#f472b6" />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#fb7185" />
      <directionalLight position={[0, 5, 5]} intensity={0.5} color="#fda4af" />
      <fog attach="fog" args={['#000', 5, 20]} />
      <AnimatedBackground />
      <ContactShadows opacity={0.4} scale={20} blur={2.4} far={4.5} color="#f472b6" />
    </>
  );
};

export default HeroScene3D;