export const threeDPromptContext = `
=== REACT THREE FIBER (R3F) + DREI COMPLETE REFERENCE ===
=== FOR GENERATING PRODUCTION-READY 3D WEB EXPERIENCES ===

This project uses React Three Fiber (R3F) with @react-three/drei and @react-three/postprocessing.
Do NOT use vanilla Three.js patterns (no new THREE.Scene(), no new THREE.WebGLRenderer(), etc.).
Everything is declarative JSX inside <Canvas>.

=== CORE IMPORTS ===

// React Three Fiber core
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

// Drei helpers (MOST COMMON)
import {
  Float, Sparkles, Stars, ContactShadows,
  Environment, PerspectiveCamera, OrbitControls,
  ScrollControls, Scroll, useScroll,
  MeshDistortMaterial, MeshWobbleMaterial,
  Html, Billboard, Grid,
  useProgress, useCursor, useIntersect,
  Sphere, Box, RoundedBox, Dodecahedron, Icosahedron, Plane,
  Trail, MeshPortalMaterial,
} from '@react-three/drei';

// Post-processing
import { EffectComposer, Bloom, Vignette, Noise, ChromaticAberration } from '@react-three/postprocessing';

=== CANVAS SETUP ===

The Canvas component creates the WebGL context and THREE.Scene automatically.
ONLY pages own a <Canvas>. Scene components NEVER contain <Canvas>.

<Canvas
  camera={{ position: [0, 0, 8], fov: 50 }}
  dpr={[1, 1.5]}
  gl={{ antialias: true, alpha: false }}
>
  <color attach="background" args={['#050505']} />
  {/* 3D content here */}
</Canvas>

=== GEOMETRY (intrinsic JSX -- lowercase) ===

All Three.js geometries are available as lowercase JSX:

<mesh>
  <boxGeometry args={[width, height, depth]} />
  <meshStandardMaterial color="#ff0000" />
</mesh>

<mesh>
  <sphereGeometry args={[radius, widthSegments, heightSegments]} />
  <meshPhysicalMaterial
    color="#ffffff"
    roughness={0.1}
    metalness={0.8}
    clearcoat={1}
  />
</mesh>

<mesh>
  <icosahedronGeometry args={[radius, detail]} />
  {/* detail max 4 for performance */}
  <meshStandardMaterial color="#00ff00" />
</mesh>

<mesh>
  <torusKnotGeometry args={[radius, tube, tubularSegments, radialSegments]} />
  <meshStandardMaterial color="#0000ff" />
</mesh>

<mesh>
  <planeGeometry args={[width, height]} />
  <meshBasicMaterial color="#333" side={THREE.DoubleSide} />
</mesh>

<mesh>
  <coneGeometry args={[radius, height, radialSegments]} />
  <meshStandardMaterial color="#ff00ff" />
</mesh>

<mesh>
  <cylinderGeometry args={[radiusTop, radiusBottom, height, radialSegments]} />
  <meshStandardMaterial color="#ffff00" />
</mesh>

<mesh>
  <torusGeometry args={[radius, tube, radialSegments, tubularSegments]} />
  <meshStandardMaterial color="#00ffff" />
</mesh>

=== MATERIALS ===

INTRINSIC materials (Three.js built-in) -- ALWAYS LOWERCASE in JSX:
  <meshBasicMaterial />        -- no lighting
  <meshStandardMaterial />     -- PBR standard
  <meshPhysicalMaterial />     -- PBR physical (clearcoat, transmission, etc.)
  <meshLambertMaterial />      -- non-PBR diffuse
  <meshPhongMaterial />        -- non-PBR specular

DREI materials (imported components) -- ALWAYS CAPITALIZED in JSX:
  <MeshDistortMaterial speed={2} distort={0.3} color="#f472b6" />
  <MeshWobbleMaterial speed={1} factor={0.3} color="#60a5fa" />

Properties for meshPhysicalMaterial (premium look):
  roughness={0.1}
  metalness={0.8}
  clearcoat={1}
  clearcoatRoughness={0.1}
  envMapIntensity={2}
  emissive="#ff0066"
  emissiveIntensity={0.5}

=== LIGHTS ===

All lights are lowercase intrinsic JSX:

<ambientLight intensity={0.2} />
<directionalLight position={[5, 5, 5]} intensity={1} color="#ffffff" />
<pointLight position={[0, 3, 0]} intensity={2} color="#f472b6" distance={20} decay={2} />
<spotLight
  position={[10, 10, 10]}
  angle={0.15}
  penumbra={1}
  intensity={1.5}
  color="#f472b6"
  castShadow
/>

=== FOG ===

<fog attach="fog" args={['#000000', 5, 20]} />

=== useFrame HOOK (animation loop) ===

Access the render loop for per-frame updates. ALWAYS use refs, NEVER setState.

import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';

const MyComponent = () => {
  const meshRef = useRef<THREE.Mesh>(null!);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.5;
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.5;
    }
  });

  return (
    <mesh ref={meshRef}>
      <icosahedronGeometry args={[1, 2]} />
      <meshStandardMaterial color="#f472b6" />
    </mesh>
  );
};

=== useThree HOOK ===

Access the Three.js state (camera, scene, renderer, viewport, etc.):

const { camera, viewport, size, pointer } = useThree();

=== DREI: Float ===

Makes children float with gentle animation:

<Float speed={2} rotationIntensity={1} floatIntensity={0.5}>
  <mesh>
    <sphereGeometry args={[1, 32, 32]} />
    <MeshDistortMaterial color="#f472b6" speed={2} distort={0.3} />
  </mesh>
</Float>

RULE: NEVER nest Float inside Float.

=== DREI: Sparkles ===

Floating particles for atmosphere:

<Sparkles count={60} scale={15} size={2} speed={0.3} color="#f472b6" />

RULE: Max 80 particles for performance.

=== DREI: Stars ===

Star field background:

<Stars radius={100} depth={50} count={1000} factor={4} speed={1} />

=== DREI: ContactShadows ===

Ground plane shadows without shadow maps:

<ContactShadows
  position={[0, -1.5, 0]}
  opacity={0.5}
  blur={2}
  far={4}
  resolution={256}
/>

=== DREI: Environment ===

HDR environment lighting:

<Environment preset="city" />
// presets: 'apartment', 'city', 'dawn', 'forest', 'lobby', 'night', 'park', 'studio', 'sunset', 'warehouse'

=== DREI: ScrollControls + Scroll ===

Scroll-driven 3D experiences:

<ScrollControls pages={5} damping={0.1}>
  <Scroll>
    {/* 3D objects -- positioned at Y offsets */}
    <HeroScene3D />
    <group position={[0, -10, 0]}>
      <FeaturesScene3D />
    </group>
    <group position={[0, -20, 0]}>
      <ShowcaseScene3D />
    </group>
  </Scroll>

  <Scroll html>
    {/* HTML overlay sections */}
    <section className="h-screen w-screen flex items-center justify-center">
      <h1 className="text-6xl text-white pointer-events-auto">Title</h1>
    </section>
  </Scroll>
</ScrollControls>

RULE: pointer-events-auto on ALL interactive HTML elements inside <Scroll html>.

=== DREI: useScroll ===

Access scroll offset inside a Scroll context:

import { useScroll } from '@react-three/drei';

const MyScene = () => {
  const scroll = useScroll();
  const groupRef = useRef<THREE.Group>(null!);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y = scroll.offset * Math.PI * 2;
      groupRef.current.position.y = scroll.offset * -10;
    }
  });

  return <group ref={groupRef}>{/* ... */}</group>;
};

=== DREI: useProgress ===

Track loading progress (for loading screens):

import { useProgress } from '@react-three/drei';

const Loader = () => {
  const { progress, active } = useProgress();
  // progress: 0-100, active: boolean
  return <div>{Math.round(progress)}%</div>;
};

=== DREI: Shaped Geometries ===

<Sphere args={[radius, widthSegments, heightSegments]} />
<Box args={[width, height, depth]} />
<RoundedBox args={[width, height, depth]} radius={0.1} smoothness={4} />
<Dodecahedron args={[radius]} />
<Icosahedron args={[radius, detail]} />
<Plane args={[width, height]} />

=== DREI: Grid ===

<Grid
  args={[10, 10]}
  position={[0, -1.5, 0]}
  cellSize={0.5}
  cellColor="#6f6f6f"
  sectionColor="#9d4b4b"
  fadeDistance={30}
  infiniteGrid
/>

=== DREI: Trail ===

Trail effect behind moving objects:

<Trail width={1} length={4} color="#f472b6" attenuation={(t) => t * t}>
  <mesh ref={meshRef}>
    <sphereGeometry args={[0.1]} />
    <meshStandardMaterial color="#f472b6" />
  </mesh>
</Trail>

=== POST-PROCESSING ===

EffectComposer wraps post-processing effects INSIDE Canvas but OUTSIDE ScrollControls:

<Canvas>
  <ScrollControls pages={5}>
    {/* ... */}
  </ScrollControls>

  <Environment preset="city" />

  <EffectComposer>
    <Bloom intensity={1.5} luminanceThreshold={0.2} luminanceSmoothing={0.9} />
    <Vignette eskil={false} offset={0.1} darkness={0.8} />
    <Noise opacity={0.04} />
  </EffectComposer>
</Canvas>

RULE: NEVER use disableNormalPass -- use enableNormalPass={false} if needed.
RULE: EffectComposer goes in the PAGE, NOT in scene components.

=== INTERACTIVITY ===

Make 3D objects interactive:

<mesh
  onPointerOver={() => { document.body.style.cursor = 'pointer'; }}
  onPointerOut={() => { document.body.style.cursor = 'default'; }}
  onClick={() => { /* action */ }}
>
  <boxGeometry />
  <meshStandardMaterial />
</mesh>

Hover scale animation with useFrame + refs:

const meshRef = useRef<THREE.Mesh>(null!);
const [hovered, setHovered] = useState(false);

useFrame(() => {
  if (meshRef.current) {
    const scale = hovered ? 1.2 : 1.0;
    meshRef.current.scale.lerp(new THREE.Vector3(scale, scale, scale), 0.1);
  }
});

<mesh
  ref={meshRef}
  onPointerOver={() => setHovered(true)}
  onPointerOut={() => setHovered(false)}
>

=== SCENE COMPONENT PATTERN (TYPE 1) ===

Scene components return a REACT FRAGMENT with ONLY R3F elements.
They NEVER contain: Canvas, div, Html, ScrollControls, Scroll, EffectComposer, Suspense.

export const HeroScene3D = () => {
  const groupRef = useRef<THREE.Group>(null!);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.1;
    }
  });

  return (
    <>
      <ambientLight intensity={0.2} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1.5} color="#f472b6" />
      <fog attach="fog" args={['#000', 5, 20]} />

      <group ref={groupRef}>
        <Float speed={2} rotationIntensity={1}>
          <mesh>
            <icosahedronGeometry args={[1.5, 2]} />
            <MeshDistortMaterial color="#f472b6" speed={2} distort={0.3} />
          </mesh>
        </Float>

        <Sparkles count={60} scale={15} size={2} speed={0.3} color="#f472b6" />
        <ContactShadows position={[0, -2, 0]} opacity={0.5} blur={2} />
      </group>
    </>
  );
};

export default HeroScene3D;

=== PAGE COMPONENT PATTERN ===

Pages own the single Canvas. All scenes are lazy-loaded.

import React, { Suspense, lazy } from 'react';
import { motion } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { ScrollControls, Scroll, Environment, PerspectiveCamera } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing';
import LoadingScreen3D from '@/components/3d/LoadingScreen3D';
import NavBar3D from '@/components/3d/NavBar3D';
import Footer3D from '@/components/3d/Footer3D';
import { useNavigate } from 'react-router-dom';

const HeroScene3D = lazy(() => import('@/components/3d/HeroScene3D'));
const FeaturesScene3D = lazy(() => import('@/components/3d/FeaturesScene3D'));

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <LoadingScreen3D>
      <NavBar3D />

      <div className="fixed inset-0 w-full h-screen bg-black overflow-hidden">
        <Suspense fallback={<div className="w-full h-full bg-black" />}>
          <Canvas camera={{ position: [0, 0, 8], fov: 50 }} dpr={[1, 1.5]}>
            <color attach="background" args={['#050505']} />
            <PerspectiveCamera makeDefault position={[0, 0, 8]} fov={50} />

            <ScrollControls pages={4} damping={0.1}>
              <Scroll>
                <HeroScene3D />
                <group position={[0, -10, 0]}>
                  <FeaturesScene3D />
                </group>
              </Scroll>

              <Scroll html>
                <section className="h-screen w-screen flex items-center justify-center">
                  <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1 }}
                    className="text-center px-4 pointer-events-auto"
                  >
                    <h1 className="text-6xl md:text-8xl font-bold text-white mb-6">Title</h1>
                    <p className="text-xl text-white/80 max-w-2xl mx-auto mb-10">Subtitle</p>
                    <button
                      onClick={() => navigate('/features')}
                      className="px-8 py-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl text-white"
                    >
                      Explore
                    </button>
                  </motion.div>
                </section>

                <section className="w-screen">
                  <Footer3D />
                </section>
              </Scroll>
            </ScrollControls>

            <Environment preset="city" />

            <EffectComposer>
              <Bloom intensity={1.5} luminanceThreshold={0.2} luminanceSmoothing={0.9} />
              <Vignette eskil={false} offset={0.1} darkness={0.8} />
              <Noise opacity={0.04} />
            </EffectComposer>
          </Canvas>
        </Suspense>
      </div>
    </LoadingScreen3D>
  );
};

export default HomePage;

=== NAVBAR3D PATTERN (pure HTML, NOT 3D) ===

import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const NavBar3D = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-black/30 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="text-white font-bold tracking-[0.2em] uppercase">
          BRAND
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex gap-8">
          <Link to="/" className="text-white/70 hover:text-white transition-colors">Home</Link>
          <Link to="/features" className="text-white/70 hover:text-white transition-colors">Features</Link>
        </div>

        {/* Mobile Hamburger */}
        <button onClick={() => setIsOpen(!isOpen)} className="md:hidden">
          <span className="block w-6 h-0.5 bg-white transition-transform" />
          <span className="block w-6 h-0.5 bg-white mt-1.5 transition-opacity" />
          <span className="block w-6 h-0.5 bg-white mt-1.5 transition-transform" />
        </button>
      </div>
    </nav>
  );
};

export default NavBar3D;

=== FOOTER3D PATTERN (pure HTML, NOT 3D) ===

Social icons use inline SVG paths. NO lucide-react.

=== LOADINGSCREEN3D PATTERN (pure HTML overlay) ===

import React, { useEffect, useState } from 'react';
import { useProgress } from '@react-three/drei';

const LoadingScreen3D = ({ children }: { children?: React.ReactNode }) => {
  const { progress, active } = useProgress();
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    if (progress >= 100 && !active) {
      const timer = setTimeout(() => setIsFinished(true), 500);
      return () => clearTimeout(timer);
    }
  }, [progress, active]);

  return (
    <>
      {children}
      {!isFinished && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backgroundColor: '#000',
          opacity: progress >= 100 ? 0 : 1,
          pointerEvents: progress >= 100 ? 'none' : 'auto',
          transition: 'opacity 0.8s ease'
        }}>
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ color: '#fff', fontSize: '3rem', letterSpacing: '0.2em' }}>LOADING</h1>
            <div style={{ width: '200px', height: '2px', background: '#333', margin: '20px auto' }}>
              <div style={{ height: '100%', background: '#f472b6', width: progress + '%', transition: 'width 0.3s' }} />
            </div>
            <p style={{ color: '#666', fontSize: '14px' }}>{Math.round(progress)}%</p>
          </div>
        </div>
      )}
    </>
  );
};

export default LoadingScreen3D;

CRITICAL: LoadingScreen3D must NEVER import from @/components/ui/.
The ONLY allowed external import is useProgress from @react-three/drei.

=== ABSOLUTE BANNED LIST (WILL CAUSE RUNTIME CRASHES) ===

1. NEVER use <Text> or <Text3D> from drei (requires font files not available)
2. NEVER use MeshTransmissionMaterial (GPU crash on many devices)
3. NEVER reference local font paths (/fonts/...)
4. NEVER use useGLTF or useTexture (no external 3D assets available)
5. NEVER import from lucide-react (not installed in 3D projects)
6. NEVER import from @/components/ui/ (Button, Card, Input, Badge, SplitText, ClickSpark, TextPressure DO NOT EXIST)
7. NEVER use disableNormalPass on EffectComposer (use enableNormalPass={false})
8. NEVER put Canvas inside a scene component (page owns Canvas)
9. NEVER put div or HTML inside a scene component (page handles HTML in <Scroll html>)
10. NEVER nest Float inside Float
11. NEVER use setState inside useFrame (causes re-render loop)
12. NEVER use <a href> for navigation (use <Link to> from react-router-dom)

=== MATERIAL CASING RULES (CRITICAL FOR TypeScript) ===

INTRINSIC (Three.js built-in) -- LOWERCASE:
  <meshBasicMaterial />
  <meshStandardMaterial />
  <meshPhysicalMaterial />
  <meshLambertMaterial />

DREI (imported from @react-three/drei) -- CAPITALIZED:
  <MeshDistortMaterial />
  <MeshWobbleMaterial />
  <MeshPortalMaterial />

Mixing these up (e.g., <MeshPhysicalMaterial> or <meshdistortmaterial>) will cause TypeScript errors.

=== PERFORMANCE GUIDELINES ===

1. Sparkles: max 80 particles
2. Stars: max 2000 count
3. IcosahedronGeometry: max detail=4
4. Canvas dpr: [1, 1.5] (not [1, 2])
5. Use React.lazy() for scene components
6. Wrap lazy components in <Suspense>
7. Use useFrame refs instead of setState for animation

=== ERROR BOUNDARY PATTERN ===

class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return this.props.fallback || <div>Something went wrong</div>;
    }
    return this.props.children;  // CORRECT: this.props.children, NOT this.children
  }
}

=== EXPORT PATTERN ===

Every component MUST have both named AND default export:

export const ComponentName = () => { /* ... */ };
export default ComponentName;

=== OUTPUT FORMAT ===

All generated code MUST be wrapped in chirAction tags:

<chirAction type="file" filePath="src/components/3d/ComponentName.tsx">
// code here
</chirAction>

NEVER use markdown code blocks. ONLY chirAction tags.
`;