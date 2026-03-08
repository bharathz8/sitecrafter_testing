import React, { Suspense, lazy, useState } from 'react';
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
const ShowcaseScene3D = lazy(() => import('@/components/3d/ShowcaseScene3D'));
const TestimonialsScene3D = lazy(() => import('@/components/3d/TestimonialsScene3D'));
const BackgroundScene3D = lazy(() => import('@/components/3d/BackgroundScene3D'));

const features = [
  { title: 'Nebula Soil', desc: 'Enriched with cosmic minerals for faster growth.' },
  { title: 'Starlight Irrigation', desc: 'Pure filtered water harvested from lunar dew.' },
  { title: 'Quantum Harvest', desc: 'Precision picking at the peak of purple ripeness.' }
];

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

            <ScrollControls pages={5} damping={0.1}>
              <BackgroundScene3D />
              <Scroll>
                <HeroScene3D />
                <group position={[0, -10, 0]}>
                  <FeaturesScene3D />
                </group>
                <group position={[0, -20, 0]}>
                  <ShowcaseScene3D />
                </group>
                <group position={[0, -30, 0]}>
                  <TestimonialsScene3D />
                </group>
              </Scroll>

              <Scroll html>
                <section className="h-screen w-screen flex items-center justify-center relative">
                  <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="text-center px-4 pointer-events-auto"
                  >
                    <h1 className="text-6xl md:text-8xl font-bold text-white mb-6 tracking-tighter drop-shadow-2xl">
                      COSMIC <span className="text-[#f472b6]">PURPLE</span> FARM
                    </h1>
                    <p className="text-xl md:text-2xl text-white/80 max-w-2xl mx-auto mb-10 font-light">
                      Cultivating the future of organic produce under the glow of the purple aurora.
                    </p>
                    <button
                      onClick={() => navigate('/products')}
                      className="px-8 py-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl text-white font-bold hover:bg-[#f472b6] transition-all duration-500 hover:scale-105 active:scale-95 shadow-2xl"
                    >
                      EXPLORE THE HARVEST
                    </button>
                  </motion.div>
                </section>

                <section className="h-screen w-screen flex flex-col items-center justify-center px-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl w-full pointer-events-auto">
                    {features.map((feature, idx) => (
                      <motion.div
                        key={idx}
                        whileHover={{ y: -10 }}
                        className="p-8 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 shadow-xl"
                      >
                        <div className="w-12 h-12 rounded-full mb-6 flex items-center justify-center bg-[#fb7185]">
                          <span className="text-white font-bold">{idx + 1}</span>
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-4">{feature.title}</h3>
                        <p className="text-white/60 leading-relaxed">{feature.desc}</p>
                      </motion.div>
                    ))}
                  </div>
                </section>

                <section className="h-screen w-screen flex items-center justify-end px-12 md:px-24">
                  <div className="max-w-xl text-right pointer-events-auto">
                    <h2 className="text-5xl font-bold text-white mb-6">PREMIUM <br />SELECTIONS</h2>
                    <p className="text-lg text-white/70 mb-8">
                      Every fruit is hand-inspected for cosmic brilliance and nutrient density.
                    </p>
                    <button
                      onClick={() => navigate('/farm-tour')}
                      className="px-10 py-4 bg-[#fb7185] rounded-xl text-white font-bold hover:shadow-[0_0_30px_rgba(251,113,133,0.5)] transition-all"
                    >
                      TAKE THE TOUR
                    </button>
                  </div>
                </section>

                <section className="h-screen w-screen flex items-center justify-center">
                  <div className="bg-white/5 backdrop-blur-2xl p-12 rounded-3xl border border-white/10 max-w-3xl text-center mx-4 pointer-events-auto">
                    <div className="text-5xl mb-6 text-[#fda4af]">"</div>
                    <p className="text-2xl md:text-3xl text-white italic mb-8">
                      "The purple strawberries from Cosmic Farm literally changed my perception of flavor. It's like eating a star."
                    </p>
                    <div className="font-bold text-[#f472b6]">DR. ELARA VANCE</div>
                    <div className="text-white/40 text-sm tracking-widest uppercase">Astrobotanist</div>
                  </div>
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