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
  Trail, MeshPortalMaterial, Cloud,
  PresentationControls, AdaptiveDpr, AdaptiveEvents,
  AccumulativeShadows, RandomizedLight,
} from '@react-three/drei';

// Post-processing
import { EffectComposer, Bloom, Vignette, Noise, ChromaticAberration, DepthOfField, HueSaturation } from '@react-three/postprocessing';

=== CANVAS SETUP ===

The Canvas component creates the WebGL context and THREE.Scene automatically.
ONLY pages own a <Canvas>. Scene components NEVER contain <Canvas>.

<Canvas
  gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
  dpr={[1, 2]}
  shadows
  camera={{ position: [0, 0, 8], fov: 60, near: 0.1, far: 1000 }}
>
  <color attach="background" args={['#050505']} />
  <AdaptiveDpr pixelated />
  <AdaptiveEvents />
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
  <planeGeometry args={[width, height, widthSegments, heightSegments]} />
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

<mesh>
  <dodecahedronGeometry args={[radius, detail]} />
  <meshStandardMaterial color="#f472b6" />
</mesh>

<mesh>
  <octahedronGeometry args={[radius, detail]} />
  <meshStandardMaterial color="#818cf8" />
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

Glass effect with meshPhysicalMaterial:
  transmission={0.9}
  thickness={0.5}
  ior={1.5}
  roughness={0}
  clearcoat={1}
  
=== CUSTOM ShaderMaterial (CRITICAL FOR CINEMATIC SCENES) ===

Custom GLSL shaders are the KEY to award-winning visuals.
Use <shaderMaterial> (lowercase intrinsic) with vertexShader + fragmentShader strings.

PATTERN: Declarative shader inside mesh
<mesh>
  <planeGeometry args={[10, 10, 64, 64]} />
  <shaderMaterial
    ref={shaderRef}
    vertexShader={vertexShader}
    fragmentShader={fragmentShader}
    uniforms={uniforms}
    transparent
    side={THREE.DoubleSide}
  />
</mesh>

Animate in useFrame:
useFrame((_, delta) => {
  if (shaderRef.current) {
    shaderRef.current.uniforms.uTime.value += delta;
  }
});

uniforms must be created with useMemo to avoid re-creation:
const uniforms = useMemo(() => ({
  uTime: { value: 0 },
  uColorA: { value: new THREE.Color('#ff0066') },
  uColorB: { value: new THREE.Color('#00ffcc') },
}), []);

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
<hemisphereLight args={['#ffeeb1', '#080820', 0.5]} />

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

=== DREI: PresentationControls ===

Interactive drag/rotate controls for product showcases:

<PresentationControls
  global
  snap
  speed={1}
  zoom={0.7}
  rotation={[0, -Math.PI / 6, 0]}
  polar={[-Math.PI / 6, Math.PI / 6]}
  azimuth={[-Math.PI / 6, Math.PI / 6]}
>
  <mesh>
    <torusKnotGeometry />
    <meshPhysicalMaterial clearcoat={1} metalness={0.9} />
  </mesh>
</PresentationControls>

=== DREI: ScrollControls + Scroll ===

Scroll-driven 3D experiences:

<ScrollControls pages={8} damping={0.03}>
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
      const s = scroll.offset;
      groupRef.current.rotation.y = s * Math.PI * 2;
      groupRef.current.position.y = s * -10;
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

=== DREI: Cloud ===

Volumetric cloud for atmosphere:

<Cloud opacity={0.5} speed={0.4} width={10} depth={1.5} segments={20} />

=== THREE.js: CatmullRomCurve3 (Cinematic Camera Paths) ===

Create smooth camera fly-through paths:

const curve = useMemo(() => new THREE.CatmullRomCurve3([
  new THREE.Vector3(0, 3, 12),
  new THREE.Vector3(0, 0, 2),
  new THREE.Vector3(-4, 1, 3),
  new THREE.Vector3(4, 1, 3),
  new THREE.Vector3(0, 6, 6),
  new THREE.Vector3(0, 1, 10),
]), []);

useFrame(() => {
  const t = scroll.offset;
  const point = curve.getPoint(t);
  camera.position.lerp(point, 0.05);
  camera.lookAt(0, 0, 0);
});

=== THREE.js: BufferGeometry Particles (Particle Morphing) ===

Create particle systems that morph between shapes:

const count = 3000;
const positions = useMemo(() => new Float32Array(count * 3), []);

// Generate shape positions:
function generateSphere(n: number, radius = 3): Float32Array {
  const arr = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    arr[i*3]   = radius * Math.sin(phi) * Math.cos(theta);
    arr[i*3+1] = radius * Math.sin(phi) * Math.sin(theta);
    arr[i*3+2] = radius * Math.cos(phi);
  }
  return arr;
}

function generateScatter(n: number, range = 8): Float32Array {
  const arr = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    arr[i*3]   = (Math.random() - 0.5) * range;
    arr[i*3+1] = (Math.random() - 0.5) * range;
    arr[i*3+2] = (Math.random() - 0.5) * range;
  }
  return arr;
}

// Morph in useFrame:
useFrame(() => {
  const t = scroll.offset;
  const geo = pointsRef.current.geometry;
  const pos = geo.attributes.position.array as Float32Array;
  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    pos[i3]   = THREE.MathUtils.lerp(shapeA[i3],   shapeB[i3],   t);
    pos[i3+1] = THREE.MathUtils.lerp(shapeA[i3+1], shapeB[i3+1], t);
    pos[i3+2] = THREE.MathUtils.lerp(shapeA[i3+2], shapeB[i3+2], t);
  }
  geo.attributes.position.needsUpdate = true;
});

<points ref={pointsRef}>
  <bufferGeometry>
    <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
  </bufferGeometry>
  <pointsMaterial size={0.03} color="#ff66aa" sizeAttenuation transparent opacity={0.8} />
</points>

=== POST-PROCESSING ===

EffectComposer wraps post-processing effects INSIDE Canvas but OUTSIDE ScrollControls:

<Canvas>
  <ScrollControls pages={8} damping={0.03}>
    {/* ... */}
  </ScrollControls>

  <Environment preset="city" />

  <EffectComposer>
    <Bloom intensity={1.5} luminanceThreshold={0.2} luminanceSmoothing={0.9} />
    <Vignette eskil={false} offset={0.1} darkness={0.8} />
    <Noise opacity={0.04} />
    <ChromaticAberration offset={[0.002, 0.002]} />
  </EffectComposer>
</Canvas>

Animate postprocessing with refs:
const bloomRef = useRef<any>(null!);
const vignetteRef = useRef<any>(null!);

useFrame(() => {
  const s = scroll.offset;
  if (bloomRef.current) bloomRef.current.intensity = THREE.MathUtils.lerp(0.3, 3.5, Math.min(s * 3, 1));
  if (vignetteRef.current) vignetteRef.current.darkness = THREE.MathUtils.lerp(0.85, 0.1, s);
});

<EffectComposer>
  <Bloom ref={bloomRef} intensity={0.3} luminanceThreshold={0.2} />
  <Vignette ref={vignetteRef} darkness={0.85} />
</EffectComposer>

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

Mouse parallax with useThree:

const { pointer } = useThree();
useFrame(() => {
  if (groupRef.current) {
    groupRef.current.position.x = THREE.MathUtils.lerp(
      groupRef.current.position.x, pointer.x * 0.3, 0.05
    );
    groupRef.current.position.y = THREE.MathUtils.lerp(
      groupRef.current.position.y, pointer.y * 0.3, 0.05
    );
  }
});

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
import { ScrollControls, Scroll, Environment, PerspectiveCamera, AdaptiveDpr, AdaptiveEvents } from '@react-three/drei';
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

      <div className="fixed inset-0 w-full h-screen bg-black overflow-hidden" style={{ zIndex: 0 }}>
        <Suspense fallback={<div className="w-full h-full bg-black" />}>
          <Canvas
            gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
            dpr={[1, 2]}
            shadows
            camera={{ position: [0, 0, 8], fov: 60, near: 0.1, far: 1000 }}
          >
            <color attach="background" args={['#050505']} />
            <AdaptiveDpr pixelated />
            <AdaptiveEvents />

            <ScrollControls pages={8} damping={0.03}>
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

=== GLSL SHADER LIBRARY (COPY-PASTE READY) ===

Use these shader patterns for atmospheric backgrounds and effects.
Pick the shader that matches the business type being generated.

--- SHADER 1: AURORA WAVE ---
Best for: wellness, nature, calm, tech, SaaS
Best geometry: planeGeometry args={[20, 20, 128, 128]} positioned at z=-5
Color recommendations: cool blues + warm pinks for wellness, cyan + purple for tech

vertexShader:
  varying vec2 vUv;
  varying float vElevation;
  uniform float uTime;
  void main() {
    vUv = uv;
    vec4 modelPos = modelMatrix * vec4(position, 1.0);
    float elevation = sin(modelPos.x * 3.0 + uTime) * 0.3
                    + sin(modelPos.z * 2.0 + uTime * 0.8) * 0.2;
    modelPos.y += elevation;
    vElevation = elevation;
    gl_Position = projectionMatrix * viewMatrix * modelPos;
  }

fragmentShader:
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform float uTime;
  varying vec2 vUv;
  varying float vElevation;
  void main() {
    float mixStr = (vElevation + 0.5) * 0.8;
    vec3 color = mix(uColorA, uColorB, mixStr);
    float alpha = 0.6 + sin(vUv.x * 10.0 + uTime) * 0.2;
    gl_FragColor = vec4(color, alpha);
  }

uniforms: { uTime: {value:0}, uColorA: {value:new THREE.Color('#primaryColor')}, uColorB: {value:new THREE.Color('#accentColor')} }
Animate: shaderRef.current.uniforms.uTime.value += delta in useFrame

--- SHADER 2: HOLOGRAM SCANLINE ---
Best for: tech, cybersecurity, AI, gaming, data
Best geometry: sphereGeometry args={[3, 64, 64]} or cylinderGeometry
Color recommendations: cyan/green for cyber, blue for AI, neon for gaming

vertexShader:
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }

fragmentShader:
  uniform float uTime;
  uniform vec3 uColor;
  varying vec2 vUv;
  void main() {
    float scanline = sin(vUv.y * 200.0 + uTime * 5.0) * 0.04;
    float flicker = sin(uTime * 30.0) * 0.01 + 0.99;
    float edgeGlow = 1.0 - smoothstep(0.4, 0.5, length(vUv - 0.5));
    vec3 color = uColor * (1.0 + edgeGlow * 2.0 + scanline) * flicker;
    float alpha = edgeGlow * 0.8 + 0.1;
    gl_FragColor = vec4(color, alpha);
  }

uniforms: { uTime: {value:0}, uColor: {value:new THREE.Color('#00ffcc')} }

--- SHADER 3: PLASMA ENERGY FIELD ---
Best for: energy, fintech, crypto, sports, music
Best geometry: planeGeometry args={[15, 15, 1, 1]} or sphereGeometry
Color recommendations: orange/gold for energy, purple/gold for fintech, neon for music

vertexShader:
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }

fragmentShader:
  uniform float uTime;
  uniform vec3 uColor;
  varying vec2 vUv;
  void main() {
    float v1 = sin(vUv.x * 10.0 + uTime);
    float v2 = sin(vUv.y * 10.0 + uTime * 0.8);
    float v3 = sin((vUv.x + vUv.y) * 10.0 + uTime * 1.2);
    float plasma = (v1 + v2 + v3) / 3.0;
    vec3 color = uColor * (plasma * 0.5 + 0.5) * 2.0;
    gl_FragColor = vec4(color, abs(plasma) * 0.7 + 0.1);
  }

uniforms: { uTime: {value:0}, uColor: {value:new THREE.Color('#ff6600')} }

--- SHADER 4: DEEP SPACE VOID ---
Best for: luxury, mystery, premium services, fashion, real estate
Best geometry: sphereGeometry args={[50, 64, 64]} with side={THREE.BackSide} (skybox)
Color recommendations: deep purple for luxury, dark blue for premium, black/gold for fashion

vertexShader:
  varying vec2 vUv;
  varying vec3 vPosition;
  void main() {
    vUv = uv;
    vPosition = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }

fragmentShader:
  uniform float uTime;
  uniform vec3 uColorDeep;
  uniform vec3 uColorHighlight;
  varying vec2 vUv;
  varying vec3 vPosition;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  void main() {
    vec2 uv = vUv;
    float nebula = noise(uv * 3.0 + uTime * 0.05) * 0.5
                 + noise(uv * 6.0 - uTime * 0.03) * 0.25
                 + noise(uv * 12.0 + uTime * 0.02) * 0.125;
    nebula = smoothstep(0.3, 0.8, nebula);
    vec3 color = mix(uColorDeep, uColorHighlight, nebula * 0.6);
    float stars = step(0.998, hash(floor(uv * 500.0)));
    float starTwinkle = sin(uTime * 2.0 + hash(floor(uv * 500.0)) * 6.28) * 0.5 + 0.5;
    color += vec3(stars * starTwinkle * 0.8);
    gl_FragColor = vec4(color, 1.0);
  }

uniforms: { uTime: {value:0}, uColorDeep: {value:new THREE.Color('#05001a')}, uColorHighlight: {value:new THREE.Color('#1a0033')} }

--- SHADER 5: LIQUID METAL ---
Best for: automotive, manufacturing, premium tech, industrial
Best geometry: planeGeometry args={[10, 10, 128, 128]} or sphereGeometry
Color recommendations: chrome/silver for automotive, copper for industrial, gold for premium

vertexShader:
  varying vec2 vUv;
  varying float vElevation;
  uniform float uTime;
  void main() {
    vUv = uv;
    vec3 pos = position;
    float ripple1 = sin(pos.x * 4.0 + uTime * 1.5) * cos(pos.y * 3.0 + uTime) * 0.15;
    float ripple2 = sin(pos.x * 7.0 - uTime * 0.8) * sin(pos.y * 5.0 + uTime * 1.2) * 0.08;
    float ripple3 = cos(length(pos.xy) * 3.0 - uTime * 2.0) * 0.1;
    pos.z += ripple1 + ripple2 + ripple3;
    vElevation = ripple1 + ripple2 + ripple3;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }

fragmentShader:
  uniform float uTime;
  uniform vec3 uColorBase;
  uniform vec3 uColorHighlight;
  varying vec2 vUv;
  varying float vElevation;
  void main() {
    float caustic = sin(vUv.x * 20.0 + uTime * 2.0) * sin(vUv.y * 20.0 - uTime * 1.5) * 0.5 + 0.5;
    float fresnel = pow(1.0 - abs(vElevation * 3.0), 3.0);
    vec3 color = mix(uColorBase, uColorHighlight, caustic * 0.4 + fresnel * 0.3);
    color += vec3(pow(caustic, 4.0)) * 0.3;
    float specular = pow(max(0.0, sin(vUv.x * 30.0 + uTime) * sin(vUv.y * 30.0 - uTime)), 8.0);
    color += vec3(specular) * 0.5;
    gl_FragColor = vec4(color, 0.9);
  }

uniforms: { uTime: {value:0}, uColorBase: {value:new THREE.Color('#888888')}, uColorHighlight: {value:new THREE.Color('#ffffff')} }

=== END GLSL SHADER LIBRARY ===

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

=== ALLOWED AND ENCOURAGED ===

ShaderMaterial, RawShaderMaterial (custom GLSL)
shaderMaterial (lowercase intrinsic in R3F JSX)
meshPhysicalMaterial with transmission + thickness + ior (glass effect)
useScroll, ScrollControls, Scroll from @react-three/drei
Float, Sparkles, Stars, Cloud, ContactShadows, Environment
PresentationControls, AccumulativeShadows, RandomizedLight
EffectComposer, Bloom, Vignette, ChromaticAberration, Noise, DepthOfField
useFrame, useThree, useRef, useMemo, useState, useEffect
THREE.CatmullRomCurve3, THREE.BufferGeometry, THREE.ShaderMaterial
THREE.MathUtils.lerp for smooth animations
GSAP for HTML overlay animations (gsap is installed)
framer-motion for HTML overlay animations

=== MATERIAL CASING RULES (CRITICAL FOR TypeScript) ===

INTRINSIC (Three.js built-in) -- LOWERCASE:
  <meshBasicMaterial />
  <meshStandardMaterial />
  <meshPhysicalMaterial />
  <meshLambertMaterial />
  <shaderMaterial />

DREI (imported from @react-three/drei) -- CAPITALIZED:
  <MeshDistortMaterial />
  <MeshWobbleMaterial />
  <MeshPortalMaterial />

Mixing these up (e.g., <MeshPhysicalMaterial> or <meshdistortmaterial>) will cause TypeScript errors.

=== PERFORMANCE GUIDELINES ===

1. Sparkles: max 80 particles
2. Stars: max 2000 count
3. IcosahedronGeometry: max detail=4
4. Canvas dpr: [1, 2]
5. Use React.lazy() for scene components
6. Wrap lazy components in <Suspense>
7. Use useFrame refs instead of setState for animation
8. Use <AdaptiveDpr pixelated /> for automatic DPR scaling
9. Use <AdaptiveEvents /> for automatic pointer event optimization

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