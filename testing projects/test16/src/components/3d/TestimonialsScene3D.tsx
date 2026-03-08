import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import {
  Float,
  Sparkles,
  Html,
  RoundedBox,
  useScroll,
  ContactShadows
} from '@react-three/drei';
import * as THREE from 'three';

interface TestimonialData {
  id: number;
  name: string;
  role: string;
  text: string;
  color: string;
}

const TESTIMONIALS: TestimonialData[] = [
  {
    id: 1,
    name: 'Aria Sterling',
    role: 'Cosmic Botanist',
    text: 'The bioluminescent harvest surpassed all terrestrial expectations. Truly otherworldly quality.',
    color: '#f472b6'
  },
  {
    id: 2,
    name: 'Julian Vane',
    role: 'Luxury Purveyor',
    text: 'Our clients demand the ethereal. This farm delivers the cosmic essence in every petal.',
    color: '#fb7185'
  },
  {
    id: 3,
    name: 'Elena Thorne',
    role: 'Digital Architect',
    text: 'The integration of nature and celestial energy creates a product that feels alive.',
    color: '#fda4af'
  }
];

const TestimonialCard = ({ data, index, total }: { data: TestimonialData, index: number, total: number }) => {
  const meshRef = useRef<THREE.Group>(null!);
  const [hovered, setHovered] = useState(false);
  const scroll = useScroll();

  useFrame((state) => {
    const angle = (index / total) * Math.PI * 0.5 - Math.PI * 0.25;
    const radius = 6;
    const offset = scroll.offset;

    const targetX = Math.sin(angle + offset * Math.PI) * radius;
    const targetZ = Math.cos(angle + offset * Math.PI) * radius - 5;
    const targetY = Math.sin(state.clock.elapsedTime * 0.5 + index) * 0.2;

    meshRef.current.position.x = THREE.MathUtils.lerp(meshRef.current.position.x, targetX, 0.1);
    meshRef.current.position.z = THREE.MathUtils.lerp(meshRef.current.position.z, targetZ, 0.1);
    meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, targetY, 0.1);
    meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, -angle - offset * Math.PI, 0.1);

    const scale = hovered ? 1.1 : 1.0;
    meshRef.current.scale.lerp(new THREE.Vector3(scale, scale, scale), 0.1);
  });

  return (
    <group
      ref={meshRef}
      onPointerOver={() => { setHovered(true); document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { setHovered(false); document.body.style.cursor = 'default'; }}
    >
      <RoundedBox args={[3, 4, 0.1]} radius={0.1} smoothness={4}>
        <meshPhysicalMaterial
          color="#1a1a1a"
          metalness={0.9}
          roughness={0.1}
          clearcoat={1}
          transmission={0.5}
          thickness={0.5}
          envMapIntensity={2}
        />
      </RoundedBox>

      <Html
        transform
        distanceFactor={4}
        position={[0, 0, 0.06]}
        style={{ width: '280px', pointerEvents: 'none', userSelect: 'none' }}
      >
        <div style={{
          padding: '2rem',
          background: 'rgba(0,0,0,0.4)',
          backdropFilter: 'blur(10px)',
          borderRadius: '15px',
          border: `1px solid ${data.color}33`,
          color: 'white',
          fontFamily: 'system-ui, sans-serif',
          textAlign: 'center'
        }}>
          <p style={{ fontSize: '1rem', lineHeight: '1.6', marginBottom: '1.5rem', fontStyle: 'italic', color: '#e2e8f0' }}>
            "{data.text}"
          </p>
          <p style={{ fontSize: '1.1rem', fontWeight: 'bold', color: data.color, margin: '0' }}>
            {data.name}
          </p>
          <span style={{ fontSize: '0.75rem', opacity: 0.6, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            {data.role}
          </span>
        </div>
      </Html>
    </group>
  );
};

export const TestimonialsScene3D = () => {
  return (
    <>
      <ambientLight intensity={0.2} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={2} color="#f472b6" />
      <pointLight position={[-10, -10, -10]} intensity={1} color="#a855f7" />
      <fog attach="fog" args={['#050505', 5, 20]} />

      {TESTIMONIALS.map((t, i) => (
        <TestimonialCard key={t.id} data={t} index={i} total={TESTIMONIALS.length} />
      ))}

      <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
        <mesh position={[0, 0, -5]}>
          <torusGeometry args={[3, 0.1, 16, 100]} />
          <meshBasicMaterial color="#f472b6" transparent opacity={0.2} />
        </mesh>
      </Float>

      <Sparkles count={50} scale={15} size={2} speed={0.4} color="#fda4af" />
      <ContactShadows opacity={0.4} scale={20} blur={2} far={4.5} />
    </>
  );
};

export default TestimonialsScene3D;