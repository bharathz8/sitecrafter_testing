import React, { Suspense, lazy } from 'react';
import { motion } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { ScrollControls, Scroll, Environment, PerspectiveCamera } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing';
import { useNavigate } from 'react-router-dom';

// Lazy load 3D scenes
const HeroScene3D = lazy(() => import('@/components/3d/HeroScene3D'));
const FeaturesScene3D = lazy(() => import('@/components/3d/FeaturesScene3D'));
const TestimonialsScene3D = lazy(() => import('@/components/3d/TestimonialsScene3D'));
const StatsScene3D = lazy(() => import('@/components/3d/StatsScene3D'));
const CtaScene3D = lazy(() => import('@/components/3d/CtaScene3D'));
const LoadingScreen3D = lazy(() => import('@/components/3d/LoadingScreen3D'));
const NavBar3D = lazy(() => import('@/components/3d/NavBar3D'));
const Footer3D = lazy(() => import('@/components/3d/Footer3D'));

const cn = (...classes: (string | boolean | undefined)[]) => classes.filter(Boolean).join(' ');

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <Suspense fallback={<div className="fixed inset-0 bg-[#1c1917] flex items-center justify-center text-[#fbbf24] font-bold">IGNITING THE ARBORETUM...</div>}>
      <LoadingScreen3D />
      <NavBar3D />

      <div className="fixed inset-0 w-full h-screen bg-[#1c1917] overflow-hidden">
        <Canvas shadows dpr={[1, 1.5]}>
          <color attach="background" args={['#1c1917']} />
          <PerspectiveCamera makeDefault position={[0, 0, 10]} fov={50} />
          
          <ScrollControls pages={6} damping={0.2}>
            {/* 3D SCENE CONTENT */}
            <Scroll>
              <Suspense fallback={null}>
                <HeroScene3D />
                <group position={[0, -12, 0]}>
                  <FeaturesScene3D />
                </group>
                <group position={[0, -24, 0]}>
                  <TestimonialsScene3D />
                </group>
                <group position={[0, -36, 0]}>
                  <StatsScene3D />
                </group>
                <group position={[0, -48, 0]}>
                  <CtaScene3D />
                </group>
              </Suspense>
            </Scroll>

            {/* HTML OVERLAYS */}
            <Scroll html>
              {/* HERO SECTION */}
              <section className="h-screen w-screen flex flex-col items-center justify-center text-center px-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                  className="pointer-events-auto"
                >
                  <h1 className="text-6xl md:text-9xl font-black text-white tracking-tighter mb-4 uppercase" style={{ fontFamily: 'Clash Display, sans-serif' }}>
                    Aethelgard's <span className="text-[#ef4444]">Arboretum</span>
                  </h1>
                  <p className="text-xl md:text-2xl text-[#fbbf24] max-w-3xl mx-auto font-medium mb-8" style={{ fontFamily: 'Satoshi, sans-serif' }}>
                    Where volcanic energy meets sage serenity. Cultivating the future of botanical wisdom.
                  </p>
                  <button 
                    onClick={() => navigate('/articles')}
                    className="px-10 py-4 bg-[#ef4444] text-white font-bold rounded-full hover:bg-[#f97316] transition-all duration-300 hover:scale-110 hover:rotate-2 shadow-2xl shadow-[#ef4444]/20 pointer-events-auto"
                  >
                    EXPLORE THE GARDEN
                  </button>
                </motion.div>
              </section>

              {/* BENTO GRID FEATURES SECTION */}
              <section className="h-screen w-screen flex items-center justify-center px-6 md:px-20">
                <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-2 gap-4 w-full max-w-7xl h-[80vh]">
                  <motion.div 
                    whileHover={{ scale: 1.02 }}
                    className="md:col-span-2 md:row-span-2 bg-[#292524]/60 backdrop-blur-xl border border-[#ef4444]/30 rounded-3xl p-8 flex flex-col justify-end relative overflow-hidden group pointer-events-auto"
                  >
                    <img src="https://images.unsplash.com/photo-1641412722397-3be359096577?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080" alt="bonsai tree" className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:scale-110 transition-transform duration-700" />
                    <div className="relative z-10">
                      <h3 className="text-4xl font-bold text-white mb-2 uppercase">Ancient Wisdom</h3>
                      <p className="text-[#fbbf24]">Mastering the art of the volcanic bonsai.</p>
                    </div>
                  </motion.div>
                  <motion.div 
                    whileHover={{ scale: 1.02 }}
                    className="md:col-span-2 bg-[#292524]/60 backdrop-blur-xl border border-[#f97316]/30 rounded-3xl p-8 flex flex-col justify-end relative overflow-hidden group pointer-events-auto"
                  >
                    <img src="https://images.unsplash.com/photo-1732464372946-0d37d9cef979?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080" alt="urban foraging" className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:scale-110 transition-transform duration-700" />
                    <div className="relative z-10">
                      <h3 className="text-2xl font-bold text-white uppercase">Urban Foraging</h3>
                      <p className="text-[#fbbf24]">Finding life in the concrete cracks.</p>
                    </div>
                  </motion.div>
                  <motion.div 
                    whileHover={{ scale: 1.02 }}
                    className="bg-[#292524]/60 backdrop-blur-xl border border-[#fbbf24]/30 rounded-3xl p-8 flex flex-col justify-end pointer-events-auto"
                  >
                    <h3 className="text-xl font-bold text-white uppercase">Bio-Tech</h3>
                    <p className="text-sm text-[#fbbf24]">Merging roots with neural links.</p>
                  </motion.div>
                  <motion.div 
                    whileHover={{ scale: 1.02 }}
                    className="bg-[#ef4444] rounded-3xl p-8 flex flex-col justify-center items-center text-center pointer-events-auto"
                  >
                    <span className="text-5xl mb-2">🔥</span>
                    <h3 className="text-xl font-bold text-white uppercase">Join the Ember</h3>
                  </motion.div>
                </div>
              </section>

              {/* TESTIMONIALS SECTION */}
              <section className="h-screen w-screen flex items-center justify-center px-4">
                <div className="max-w-4xl w-full">
                  <motion.div 
                    initial={{ opacity: 0, x: -100 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    className="bg-[#292524]/80 backdrop-blur-2xl p-12 rounded-[3rem] border-l-8 border-[#ef4444] shadow-2xl pointer-events-auto"
                  >
                    <p className="text-3xl md:text-4xl text-white font-medium italic mb-8" style={{ fontFamily: 'Satoshi, sans-serif' }}>
                      "Aethelgard's Arboretum isn't just a garden; it's a sanctuary for those who seek the raw power of nature fused with modern enlightenment."
                    </p>
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-[#ef4444] overflow-hidden border-2 border-[#fbbf24]">
                        <img src="https://images.unsplash.com/photo-1703107663680-0122c54e4f74?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080" alt="botanist" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <h4 className="text-xl font-bold text-white uppercase">Dr. Elara Thorne</h4>
                        <p className="text-[#fbbf24]">Lead Xeno-Botanist</p>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </section>

              {/* STATS SECTION */}
              <section className="h-screen w-screen flex items-center justify-center px-4">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl w-full">
                  {[
                    { label: 'Species Cataloged', value: '12,400+', color: '#ef4444' },
                    { label: 'Community Sages', value: '85k', color: '#f97316' },
                    { label: 'Growth Cycles', value: '342', color: '#fbbf24' },
                    { label: 'Global Seedlings', value: '1.2M', color: '#ef4444' }
                  ].map((stat, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, y: 50 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="text-center p-8 bg-[#292524]/40 rounded-3xl border border-white/5 pointer-events-auto"
                    >
                      <h2 className="text-5xl md:text-6xl font-black mb-2" style={{ color: stat.color }}>{stat.value}</h2>
                      <p className="text-white font-bold uppercase tracking-widest text-xs">{stat.label}</p>
                    </motion.div>
                  ))}
                </div>
              </section>

              {/* CTA SECTION */}
              <section className="h-screen w-screen flex flex-col items-center justify-center px-4 text-center">
                <motion.div 
                  className="max-w-3xl pointer-events-auto"
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                >
                  <h2 className="text-5xl md:text-7xl font-black text-white mb-6 uppercase">Ready to Ignite?</h2>
                  <p className="text-[#fbbf24] text-xl mb-12">Step into the arboretum and begin your journey toward sage serenity today.</p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button className="px-12 py-5 bg-[#ef4444] text-white font-black rounded-xl hover:bg-[#f97316] transition-all duration-300 hover:shake pointer-events-auto">
                      JOIN THE COUNCIL
                    </button>
                    <button className="px-12 py-5 bg-transparent border-2 border-white/20 text-white font-black rounded-xl hover:border-[#fbbf24] transition-all duration-300 pointer-events-auto">
                      LEARN MORE
                    </button>
                  </div>
                </motion.div>
              </section>

              {/* FOOTER */}
              <section className="w-screen">
                <Footer3D />
              </section>
            </Scroll>
          </ScrollControls>

          <Environment preset="night" />
          <EffectComposer>
            <Bloom intensity={1.2} luminanceThreshold={0.1} />
            <Vignette eskil={false} offset={0.1} darkness={0.8} />
            <Noise opacity={0.05} />
          </EffectComposer>
        </Canvas>
      </div>
    </Suspense>
  );
};

export default HomePage;