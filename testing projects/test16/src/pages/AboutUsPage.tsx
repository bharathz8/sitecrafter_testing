import React, { Suspense, lazy } from 'react';
import { motion } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { ScrollControls, Scroll, Environment, PerspectiveCamera } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing';
import LoadingScreen3D from '@/components/3d/LoadingScreen3D';
import NavBar3D from '@/components/3d/NavBar3D';
import Footer3D from '@/components/3d/Footer3D';

const AboutScene3D = lazy(() => import('@/components/3d/AboutScene3D'));

const team = [
  { name: 'Dr. Orion Kael', role: 'Founding Astrobotanist', image: 'https://images.unsplash.com/photo-1682096149355-b5529fafcfe5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400' },
  { name: 'Lyra Moon', role: 'Quantum Soil Specialist', image: 'https://images.unsplash.com/photo-1769334440633-e856aac393f9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400' },
  { name: 'Cyrus Vane', role: 'Harvest Logistics', image: 'https://images.unsplash.com/photo-1676205192491-f1fc999d4195?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400' }
];

const AboutUsPage = () => {
  return (
    <LoadingScreen3D>
      <NavBar3D />

      <div className="fixed inset-0 w-full h-screen bg-black overflow-hidden">
        <Suspense fallback={<div className="w-full h-full bg-black" />}>
          <Canvas camera={{ position: [0, 0, 8], fov: 50 }} dpr={[1, 1.5]}>
            <color attach="background" args={['#050505']} />
            <PerspectiveCamera makeDefault position={[0, 0, 8]} fov={50} />

            <ScrollControls pages={3} damping={0.25}>
              <AboutScene3D />

              <Scroll html>
                <section className="h-screen flex items-center justify-center text-center px-4">
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1 }}
                    className="max-w-4xl pointer-events-auto"
                  >
                    <h1 className="text-7xl md:text-9xl font-black text-[#f472b6] mb-8 leading-none">OUR<br />GENESIS</h1>
                    <p className="text-xl text-white/60 leading-relaxed font-light">
                      Founded in 2042, Cosmic Purple Farm began with a simple question:
                      "Can we grow food that tastes like the stars?"
                      Today, we are the galaxy's leading producer of high-frequency organic produce.
                    </p>
                  </motion.div>
                </section>

                <section className="h-screen flex items-center justify-center px-8 md:px-24">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-16 max-w-7xl items-center pointer-events-auto">
                    <div className="space-y-12">
                      <h2 className="text-5xl font-bold text-white">THE COSMIC<br />ETHOS</h2>
                      <div className="space-y-8">
                        {[
                          { t: 'Purity', d: 'Zero synthetic interference. Only cosmic energy.' },
                          { t: 'Vibration', d: 'Every plant is grown to a specific harmonic frequency.' },
                          { t: 'Community', d: 'Feeding the planet, one nebula-infused bite at a time.' }
                        ].map((v, i) => (
                          <div key={i} className="group">
                            <h3 className="text-2xl font-bold text-[#fb7185] group-hover:translate-x-2 transition-transform">{v.t}</h3>
                            <p className="text-white/40">{v.d}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="relative aspect-square rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
                      <img
                        src="https://images.unsplash.com/photo-1765845216366-689cd33989e8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600"
                        className="w-full h-full object-cover"
                        alt="Greenhouse"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    </div>
                  </div>
                </section>

                <section className="h-screen flex flex-col items-center justify-center px-4">
                  <h2 className="text-4xl font-bold text-white mb-16 pointer-events-auto">MEET THE ARCHITECTS</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full pointer-events-auto">
                    {team.map((member, i) => (
                      <motion.div
                        key={i}
                        whileHover={{ y: -20 }}
                        className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-4 text-center group"
                      >
                        <div className="aspect-square rounded-2xl overflow-hidden mb-6 grayscale group-hover:grayscale-0 transition-all duration-500">
                          <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                        </div>
                        <h3 className="text-xl font-bold text-white">{member.name}</h3>
                        <p className="text-[#fda4af] text-sm uppercase tracking-widest mt-1">{member.role}</p>
                      </motion.div>
                    ))}
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

export default AboutUsPage;