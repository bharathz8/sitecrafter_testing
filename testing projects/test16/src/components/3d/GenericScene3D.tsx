import { useRef, useMemo, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import {
  Float,
  Sparkles,
  Html,
  MeshWobbleMaterial,
  useScroll,
  ContactShadows
} from '@react-three/drei';
import * as THREE from 'three';

const CosmicSeed = ({ position = [0, 0, 0] as [number, number, number], color = '#f472b6' }) => {
  const meshRef = useRef<THREE.Mesh>(null!);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    meshRef.current.rotation.x = Math.sin(t * 0.5) * 0.2;
    meshRef.current.rotation.y += 0.01;
    const scale = hovered ? 1.2 : 1.0;
    meshRef.current.scale.lerp(new THREE.Vector3(scale, scale, scale), 0.1);
  });

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={2}>
      <mesh
        ref={meshRef}
        position={position}
        onPointerOver={() => { setHovered(true); document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { setHovered(false); document.body.style.cursor = 'default'; }}
      >
        <icosahedronGeometry args={[1, 3]} />
        <meshPhysicalMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.5}
          roughness={0.1}
          metalness={0.8}
          clearcoat={1}
        />
      </mesh>
    </Float>
  );
};

const NeonWheat = ({ position = [0, 0, 0] as [number, number, number], delay = 0 }) => {
  const meshRef = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    const t = state.clock.getElapsedTime() + delay;
    meshRef.current.rotation.z = Math.sin(t * 2) * 0.1;
  });

  return (
    <mesh ref={meshRef} position={position}>
      <cylinderGeometry args={[0.02, 0.05, 3, 8]} />
      <meshStandardMaterial color="#fb7185" emissive="#fb7185" emissiveIntensity={2} />
    </mesh>
  );
};

const SceneContent = () => {
  const scroll = useScroll();
  const groupRef = useRef<THREE.Group>(null!);
  const { viewport } = useThree();

  useFrame(() => {
    const offset = scroll.offset;
    groupRef.current.position.y = offset * viewport.height * 2;
  });

  const wheatPositions = useMemo(() => {
    return Array.from({ length: 12 }).map((_, i) => ({
      pos: [(Math.random() - 0.5) * 10, -5 - Math.random() * 5, (Math.random() - 0.5) * 5] as [number, number, number],
      delay: Math.random() * Math.PI
    }));
  }, []);

  return (
    <group ref={groupRef}>
      <CosmicSeed position={[0, 0, 0]} color="#f472b6" />
      <Html center transform distanceFactor={8} position={[0, -2, 0]}>
        <div style={{ color: 'white', textAlign: 'center', fontFamily: 'system-ui, sans-serif', width: '600px', pointerEvents: 'none' }}>
          <h1 style={{ fontSize: '4rem', fontWeight: 900, textTransform: 'uppercase', margin: 0, letterSpacing: '0.2em', textShadow: '0 0 30px #f472b6' }}>
            Cosmic Farm
          </h1>
          <p style={{ fontSize: '1rem', opacity: 0.8, letterSpacing: '0.5em' }}>HARVESTING THE STARS</p>
        </div>
      </Html>

      <group position={[0, -viewport.height, 0]}>
        <CosmicSeed position={[-2, 0, -2]} color="#fb7185" />
        <CosmicSeed position={[2, 1, -1]} color="#fda4af" />
        {wheatPositions.map((w, i) => (
          <NeonWheat key={i} position={w.pos} delay={w.delay} />
        ))}
        <Html center transform distanceFactor={8} position={[0, -2, 0]}>
          <div style={{ color: 'white', textAlign: 'center', fontFamily: 'system-ui, sans-serif', width: '600px' }}>
            <h2 style={{ fontSize: '3rem', fontWeight: 700, textTransform: 'uppercase', textShadow: '0 0 20px #fb7185' }}>
              Digital Crops
            </h2>
            <p style={{ fontSize: '0.9rem', maxWidth: '400px', margin: '0 auto', lineHeight: 1.6 }}>
              Our neural-link irrigation systems ensure every data-seed grows into a premium cryptographic asset.
            </p>
          </div>
        </Html>
      </group>

      <group position={[0, -viewport.height * 2, 0]}>
        <Float speed={5} rotationIntensity={2}>
          <mesh>
            <torusKnotGeometry args={[1.5, 0.4, 128, 32]} />
            <MeshWobbleMaterial color="#fdf2f8" factor={0.4} speed={2} metalness={0.9} roughness={0.1} />
          </mesh>
        </Float>
      </group>
    </group>
  );
};

export const GenericScene3D = () => {
  return (
    <>
      <ambientLight intensity={0.2} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} color="#f472b6" />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#fb7185" />
      <directionalLight position={[0, 5, 5]} intensity={0.5} color="#fda4af" />
      <fog attach="fog" args={['#050505', 5, 25]} />
      <Sparkles count={60} scale={15} size={2} speed={0.4} color="#f472b6" />
      <SceneContent />
      <ContactShadows position={[0, -4, 0]} opacity={0.4} scale={20} blur={2} far={4.5} />
    </>
  );
};

export default GenericScene3D;