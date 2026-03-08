import React, { useRef, useMemo, Suspense } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame } from '@react-three/fiber'
import {
    OrbitControls,
    Environment,
    Float,
    Text,
    ContactShadows,
    Html,
    Stars,
    MeshReflectorMaterial,
    PresentationControls,
    MeshDistortMaterial
} from '@react-three/drei'

const GlassCard = () => {
    const meshRef = useRef<THREE.Mesh>(null!)

    return (
        <group>
            <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
                <mesh ref={meshRef}>
                    <boxGeometry args={[3, 4.5, 0.1]} />
                    <meshPhysicalMaterial
                        roughness={0}
                        transmission={1}
                        thickness={0.5}
                        envMapIntensity={1.5}
                        clearcoat={1}
                        clearcoatRoughness={0}
                        color="#ffffff"
                        attenuationColor="#ffffff"
                        attenuationDistance={0.5}
                    />

                    {/* ✅ Fix 1: Each Text in its own Suspense — font loads async */}
                    <Suspense fallback={null}>
                        <Text
                            position={[0, 1.6, 0.06]}
                            fontSize={0.25}
                            color="#222"
                            font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfMZhrib2Bg-4.ttf"
                        >
                            AURORA SERIES
                        </Text>
                    </Suspense>

                    <Suspense fallback={null}>
                        <Text
                            position={[0, 1.2, 0.06]}
                            fontSize={0.12}
                            color="#666"
                            maxWidth={2}
                            textAlign="center"
                        >
                            Limited Edition Holographic Interactive Asset
                        </Text>
                    </Suspense>

                    <Html
                        transform
                        occlude
                        position={[0, -1.6, 0.06]}
                        distanceFactor={3.5}
                    >
                        <div style={{
                            background: 'rgba(0,0,0,0.8)',
                            color: 'white',
                            padding: '10px 20px',
                            borderRadius: '20px',
                            fontFamily: 'sans-serif',
                            fontSize: '14px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            border: '1px solid rgba(255,255,255,0.2)',
                            backdropFilter: 'blur(10px)',
                            whiteSpace: 'nowrap',
                            userSelect: 'none'
                        }}>
                            PURCHASE — 0.45 ETH
                        </div>
                    </Html>
                </mesh>

                <InnerGraphic />
            </Float>
        </group>
    )
}

const InnerGraphic = () => {
    const shapeRef = useRef<THREE.Mesh>(null!)

    useFrame((state) => {
        const t = state.clock.getElapsedTime()
        shapeRef.current.rotation.x = t * 0.5
        shapeRef.current.rotation.y = t * 0.3
    })

    return (
        <mesh ref={shapeRef} position={[0, 0, 0.2]}>
            <icosahedronGeometry args={[0.8, 0]} />
            <MeshDistortMaterial
                color="#818cf8"
                speed={3}
                distort={0.4}
                radius={1}
                emissive="#4f46e5"
                emissiveIntensity={0.5}
                metalness={0.8}
                roughness={0.1}
            />
        </mesh>
    )
}

const Scene = () => {
    return (
        <>
            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
            <color attach="background" args={['#050505']} />

            <ambientLight intensity={0.5} />
            <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
            <pointLight position={[-10, -10, -10]} intensity={0.5} color="#818cf8" />

            {/* ✅ Fix 2: Removed invalid 'config', snap is boolean only */}
            <PresentationControls
                global
                snap={true}
                rotation={[0, 0, 0]}
                polar={[-Math.PI / 3, Math.PI / 3]}
                azimuth={[-Math.PI / 1.4, Math.PI / 2]}
            >
                <GlassCard />
            </PresentationControls>

            <ContactShadows
                position={[0, -3, 0]}
                opacity={0.6}
                scale={10}
                blur={2.5}
                far={4.5}
            />

            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3.01, 0]}>
                <planeGeometry args={[20, 20]} />
                <MeshReflectorMaterial
                    blur={[300, 100]}
                    resolution={2048}
                    mixBlur={1}
                    mixStrength={40}
                    roughness={1}
                    depthScale={1.2}
                    minDepthThreshold={0.4}
                    maxDepthThreshold={1.4}
                    color="#101010"
                    metalness={0.5}
                    mirror={1}
                />
            </mesh>

            {/* ✅ Fix 3: Environment in its own Suspense — loads HDR async */}
            <Suspense fallback={null}>
                <Environment preset="city" />
            </Suspense>
        </>
    )
}

export default function App() {
    return (
        // ✅ Fix 4: position relative + overflow hidden on parent
        <div style={{
            width: '100vw',
            height: '100vh',
            background: '#000',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* ✅ Fix 5: Canvas explicit fill + outer Suspense */}
            <Canvas
                shadows
                camera={{ position: [0, 0, 8], fov: 45 }}
                dpr={[1, 2]}
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
            >
                <Suspense fallback={null}>
                    <Scene />
                </Suspense>
                <OrbitControls
                    enableZoom={true}
                    enablePan={false}
                    minPolarAngle={Math.PI / 4}
                    maxPolarAngle={Math.PI / 1.5}
                    makeDefault
                />
            </Canvas>
        </div>
    )
}
