import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import {
  Float,
  Sparkles,
  Html,
  MeshDistortMaterial,
  useScroll,
  ContactShadows
} from '@react-three/drei';
import * as THREE from 'three';

const CosmicSeed = ({ position, color, speed, distort }: { position: [number, number, number], color: string, speed: number, distort: number }) => {
  const meshRef = useRef<THREE.Mesh>(null!);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    meshRef.current.position.y += Math.sin(time * speed) * 0.002;
    meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, hovered ? time * 2 : time * 0.5, 0.1);
    const scale = hovered ? 1.4 : 1;
    meshRef.current.scale.lerp(new THREE.Vector3(scale, scale, scale), 0.1);
  });

  return (
    <mesh
      ref={meshRef}
      position={position}
      onPointerOver={() => { setHovered(true); document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { setHovered(false); document.body.style.cursor = 'default'; }}
    >
      <icosahedronGeometry args={[0.5, 3]} />
      <MeshDistortMaterial
        color={color}
        speed={speed * 2}
        distort={distort}
        radius={1}
        emissive={color}
        emissiveIntensity={0.5}
        metalness={0.8}
        roughness={0.2}
      />
    </mesh>
  );
};

const SceneContent = () => {
  const scroll = useScroll();
  const groupRef = useRef<THREE.Group>(null!);
  const portalRef = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    const offset = scroll.offset;
    groupRef.current.position.y = offset * 15;
    groupRef.current.rotation.y = offset * Math.PI;
    const time = state.clock.getElapsedTime();
    portalRef.current.rotation.x = Math.sin(time * 0.5) * 0.2;
    portalRef.current.rotation.y = Math.cos(time * 0.3) * 0.2;
  });

  return (
    <group ref={groupRef}>
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        <mesh ref={portalRef} position={[0, 0, 0]}>
          <torusKnotGeometry args={[1.5, 0.4, 128, 32]} />
          <meshPhysicalMaterial
            color="#f472b6"
            emissive="#fb7185"
            emissiveIntensity={0.5}
            clearcoat={1}
            roughness={0.1}
            metalness={0.9}
          />
        </mesh>
      </Float>

      <CosmicSeed position={[-3, 2, -2]} color="#fb7185" speed={1.2} distort={0.4} />
      <CosmicSeed position={[4, -1, -3]} color="#fda4af" speed={0.8} distort={0.3} />
      <CosmicSeed position={[-5, -4, -1]} color="#f472b6" speed={1.5} distort={0.5} />
      <CosmicSeed position={[2, 5, -4]} color="#fb7185" speed={1.0} distort={0.2} />

      <Sparkles count={60} scale={10} size={2} speed={0.5} color="#fda4af" />
    </group>
  );
};

export const ContactScene3D = () => {
  return (
    <>
      <ambientLight intensity={0.2} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} color="#f472b6" />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#fb7185" />
      <directionalLight position={[0, 5, 5]} intensity={0.5} color="#fda4af" />
      <fog attach="fog" args={['#050505', 5, 15]} />
      <SceneContent />
      <ContactShadows position={[0, -4, 0]} opacity={0.4} scale={20} blur={2} far={4.5} />
    </>
  );
};

export default ContactScene3D;