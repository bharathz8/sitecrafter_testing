import { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import {
  Float,
  Sparkles,
  Html,
  MeshDistortMaterial,
  useScroll,
  ContactShadows,
  useCursor
} from '@react-three/drei';
import * as THREE from 'three';

const CosmicEntity = ({ position, color, speed, distort, radius }: { position: [number, number, number], color: string, speed: number, distort: number, radius: number }) => {
  const meshRef = useRef<THREE.Mesh>(null!);
  const [hovered, setHovered] = useState(false);
  useCursor(hovered);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    meshRef.current.position.y += Math.sin(time * speed) * 0.002;
    meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, hovered ? time * 0.5 : time * 0.2, 0.1);
    meshRef.current.scale.setScalar(THREE.MathUtils.lerp(meshRef.current.scale.x, hovered ? 1.2 : 1, 0.1));
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <mesh
        ref={meshRef}
        position={position}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <icosahedronGeometry args={[radius, 4]} />
        <MeshDistortMaterial
          color={color}
          speed={speed}
          distort={distort}
          radius={radius}
          metalness={0.8}
          roughness={0.2}
          emissive={color}
          emissiveIntensity={0.5}
        />
      </mesh>
    </Float>
  );
};

const TeamOrbs = () => {
  const scroll = useScroll();
  const groupRef = useRef<THREE.Group>(null!);

  const orbs = useMemo(() => [
    { pos: [-2, 0, 0] as [number, number, number], color: '#f472b6', label: 'VISIONARY' },
    { pos: [0, 1.5, -1] as [number, number, number], color: '#fb7185', label: 'CRAFTSMAN' },
    { pos: [2, -0.5, 1] as [number, number, number], color: '#fda4af', label: 'STRATEGIST' },
    { pos: [-1, -2, -2] as [number, number, number], color: '#f472b6', label: 'GROWER' },
  ], []);

  useFrame(() => {
    const r1 = scroll.range(0.6, 0.4);
    groupRef.current.rotation.y = r1 * Math.PI * 2;
    groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, r1 * 5, 0.1);
  });

  return (
    <group ref={groupRef}>
      {orbs.map((orb, i) => (
        <group key={i} position={orb.pos}>
          <CosmicEntity
            position={[0, 0, 0]}
            color={orb.color}
            speed={1.5 + i * 0.2}
            distort={0.4}
            radius={0.6}
          />
          <Html distanceFactor={8} position={[0, -1, 0]} center>
            <div style={{
              color: 'white',
              whiteSpace: 'nowrap',
              fontFamily: 'system-ui, sans-serif',
              fontSize: '0.8rem',
              fontWeight: 600,
              letterSpacing: '0.2em',
              opacity: 0.8,
              textShadow: '0 0 10px rgba(244,114,182,0.5)'
            }}>
              {orb.label}
            </div>
          </Html>
        </group>
      ))}
    </group>
  );
};

const SceneContent = () => {
  const scroll = useScroll();
  const heroRef = useRef<THREE.Group>(null!);
  const bgRef = useRef<THREE.Mesh>(null!);

  useFrame(() => {
    const offset = scroll.offset;
    heroRef.current.position.y = offset * 10;
    heroRef.current.rotation.z = offset * Math.PI * 0.5;
    if (bgRef.current) {
      bgRef.current.rotation.y += 0.001;
    }
  });

  return (
    <group ref={heroRef}>
      <Float speed={1.4} rotationIntensity={1} floatIntensity={2}>
        <mesh position={[0, 0, -2]}>
          <torusKnotGeometry args={[2, 0.4, 128, 32]} />
          <meshPhysicalMaterial
            color="#f472b6"
            metalness={0.9}
            roughness={0.1}
            clearcoat={1}
            emissive="#fb7185"
            emissiveIntensity={0.2}
            wireframe
          />
        </mesh>
      </Float>

      <TeamOrbs />

      <Sparkles count={60} scale={15} size={2} speed={0.4} color="#fda4af" />

      <mesh ref={bgRef} position={[0, 0, -10]}>
        <sphereGeometry args={[20, 32, 32]} />
        <meshBasicMaterial color="#0a0a0a" side={THREE.BackSide} />
      </mesh>
    </group>
  );
};

export const AboutScene3D = () => {
  return (
    <>
      <ambientLight intensity={0.2} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={2} color="#f472b6" castShadow />
      <pointLight position={[-10, -10, -10]} intensity={1} color="#fb7185" />
      <pointLight position={[0, 5, 0]} intensity={0.5} color="#fda4af" />
      <fog attach="fog" args={['#050505', 5, 25]} />
      <SceneContent />
      <ContactShadows position={[0, -4.5, 0]} opacity={0.4} scale={20} blur={2} far={4.5} />
    </>
  );
};

export default AboutScene3D;