import { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import {
  Float,
  ContactShadows,
  Sparkles,
  Html,
  useScroll,
  Stars
} from '@react-three/drei';
import * as THREE from 'three';

interface FeatureItemProps {
  position: [number, number, number];
  color: string;
  title: string;
  description: string;
  index: number;
}

const FeatureObject = ({ position, color, title, description, index }: FeatureItemProps) => {
  const meshRef = useRef<THREE.Mesh>(null!);
  const [hovered, setHovered] = useState(false);
  const scroll = useScroll();

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const offset = scroll.offset;
    meshRef.current.rotation.x = Math.sin(time * 0.5 + index) * 0.2;
    meshRef.current.rotation.y += 0.008;
    const targetScale = hovered ? 1.4 : 1;
    meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
    const scrollEffect = Math.sin(offset * Math.PI - (index * 0.5));
    meshRef.current.position.y = position[1] + scrollEffect * 2;
  });

  return (
    <group position={position}>
      <Float speed={2} rotationIntensity={1} floatIntensity={2}>
        <mesh
          ref={meshRef}
          onPointerOver={() => { setHovered(true); document.body.style.cursor = 'pointer'; }}
          onPointerOut={() => { setHovered(false); document.body.style.cursor = 'default'; }}
        >
          {index === 0 && <icosahedronGeometry args={[1, 2]} />}
          {index === 1 && <torusKnotGeometry args={[0.7, 0.2, 128, 32]} />}
          {index === 2 && <octahedronGeometry args={[1.2, 0]} />}
          {index === 3 && <dodecahedronGeometry args={[1.1, 0]} />}

          <meshPhysicalMaterial
            color={color}
            emissive={color}
            emissiveIntensity={hovered ? 2 : 0.5}
            metalness={0.9}
            roughness={0.1}
            clearcoat={1}
          />
        </mesh>
      </Float>

      <Html
        center
        distanceFactor={10}
        position={[0, -2, 0]}
        style={{
          transition: 'all 0.5s',
          opacity: hovered ? 1 : 0.2,
          transform: `scale(${hovered ? 1.1 : 0.9})`,
          pointerEvents: 'none',
        }}
      >
        <div style={{
          textAlign: 'center',
          color: 'white',
          width: '220px',
          fontFamily: 'system-ui, sans-serif',
          background: 'rgba(0,0,0,0.6)',
          padding: '1rem',
          borderRadius: '12px',
          border: `1px solid ${color}`,
          backdropFilter: 'blur(10px)',
        }}>
          <h3 style={{ margin: 0, fontSize: '1.2rem', textTransform: 'uppercase', color: '#f472b6' }}>{title}</h3>
          <p style={{ margin: '0.5rem 0 0', fontSize: '0.85rem', color: '#fda4af' }}>{description}</p>
        </div>
      </Html>
    </group>
  );
};

const features = [
  { title: 'Nebula Soil', description: 'Enriched with cosmic minerals for faster growth.', color: '#f472b6' },
  { title: 'Starlight Irrigation', description: 'Pure filtered water harvested from lunar dew.', color: '#fb7185' },
  { title: 'Quantum Harvest', description: 'Precision picking at the peak of purple ripeness.', color: '#fda4af' },
];

export const FeaturesScene3D = () => {
  return (
    <>
      <ambientLight intensity={0.2} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={2} color="#f472b6" />
      <pointLight position={[-10, -10, -10]} intensity={1} color="#a855f7" />
      <fog attach="fog" args={['#0a0a0a', 8, 30]} />

      {features.map((f, i) => (
        <FeatureObject
          key={i}
          index={i}
          position={[(i - 1) * 4, 0, 0]}
          color={f.color}
          title={f.title}
          description={f.description}
        />
      ))}

      <Sparkles count={50} scale={15} size={2} speed={0.4} color="#fda4af" />
      <Stars radius={80} depth={30} count={3000} factor={3} saturation={0} fade speed={0.5} />
      <ContactShadows position={[0, -4.5, 0]} opacity={0.4} scale={20} blur={2} far={4.5} />
    </>
  );
};

export default FeaturesScene3D;