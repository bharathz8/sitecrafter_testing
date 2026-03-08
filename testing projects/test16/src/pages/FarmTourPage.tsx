import React, { Suspense, lazy } from 'react';
import { motion } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { ScrollControls, Scroll, Environment, PerspectiveCamera } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing';
import LoadingScreen3D from '@/components/3d/LoadingScreen3D';
import NavBar3D from '@/components/3d/NavBar3D';
import Footer3D from '@/components/3d/Footer3D';

const GenericScene3D = lazy(() => import('@/components/3d/GenericScene3D'));

const cn = (...classes: (string | boolean | undefined)[]) => classes.filter(Boolean).join(' ');

const tourData = [
  {
    title: 'The Purple Greenhouse',
    description: 'Our flagship facility where LED spectrums mimic the atmospheric conditions of the Andromeda nebula. Here, crops develop their signature violet hue.',
    image: 'https://images.unsplash.com/photo-1765845216366-689cd33989e8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800'
  },
  {
    title: 'Lunar Soil Labs',
    description: 'We don\'t just grow in dirt. We grow in life. Our soil is a living ecosystem of bio-luminescent microbes that feed the roots cosmic energy.',
    image: 'https://images.unsplash.com/photo-1601408648796-349272138e57?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800'
  },
  {
    title: 'Zenith Fields',
    description: 'Vast expanses of lavender and wheat that sway in synchronization with the farm\'s central frequency generators.',
    image: 'https://images.unsplash.com/photo-1743516636284-898f3946cc8d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800'
  }
];

const FarmTourPage = () => {
  return (
    <LoadingScreen3D>
      <NavBar3D />

      <div className="fixed inset-0 w-full h-screen bg-black overflow-hidden">
        <Suspense fallback={<div className="w-full h-full bg-black" />}>
          <Canvas camera={{ position: [0, 0, 8], fov: 50 }} dpr={[1, 1.5]}>
            <color attach="background" args={['#050505']} />
            <PerspectiveCamera makeDefault position={[0, 0, 8]} fov={50} />

            <ScrollControls pages={tourData.length + 2} damping={0.1}>
              <GenericScene3D />

              <Scroll html>
                <section className="h-screen w-screen flex flex-col items-center justify-center text-center">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1 }}
                    className="z-10 px-4"
                  >
                    <h1 className="text-7xl md:text-9xl font-black text-white/10 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none">
                      TOUR
                    </h1>
                    <h2 className="text-5xl font-bold text-[#f472b6] mb-4 relative z-10">A JOURNEY BEYOND</h2>
                    <p className="text-white/50 max-w-md mx-auto relative z-10">Scroll to begin your immersive walkthrough of the Cosmic Purple Farm facilities.</p>
                    <div className="mt-12 w-1 h-24 bg-gradient-to-b from-[#f472b6] to-transparent mx-auto animate-pulse relative z-10" />
                  </motion.div>
                </section>

                {tourData.map((segment, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      'h-screen w-screen flex items-center px-8 md:px-24',
                      idx % 2 === 0 ? 'justify-start' : 'justify-end'
                    )}
                  >
                    <motion.div
                      initial={{ opacity: 0, x: idx % 2 === 0 ? -100 : 100 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.8, type: 'spring' }}
                      className="max-w-2xl bg-black/40 backdrop-blur-xl p-10 rounded-3xl border border-white/10 shadow-2xl pointer-events-auto"
                    >
                      <div className="overflow-hidden rounded-2xl mb-8 h-64 shadow-inner">
                        <img src={segment.image} alt={segment.title} className="w-full h-full object-cover hover:scale-110 transition-transform duration-700" />
                      </div>
                      <h2 className="text-4xl font-bold text-[#f472b6] mb-4 uppercase tracking-tighter">{segment.title}</h2>
                      <p className="text-white/70 text-lg leading-relaxed">{segment.description}</p>
                      <button
                        onClick={() => alert(`Exploring ${segment.title}...`)}
                        className="mt-8 px-6 py-3 rounded-lg border border-[#fda4af] text-[#fda4af] hover:bg-[#fda4af] hover:text-white transition-all font-bold"
                      >
                        VIEW 360° PANORAMA
                      </button>
                    </motion.div>
                  </div>
                ))}

                <section className="w-screen">
                  <Footer3D />
                </section>
              </Scroll>
            </ScrollControls>

            <Environment preset="night" />

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

export default FarmTourPage;