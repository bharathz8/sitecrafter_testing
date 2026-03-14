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
const CtaScene3D = lazy(() => import('@/components/3d/CtaScene3D'));

const cn = (...classes: (string | boolean | undefined)[]) => classes.filter(Boolean).join(' ');

const HomePage = () => {
  const navigate = useNavigate();
  
  const features = [
    { title: "Digital Petals", desc: "Procedurally generated cherry blossoms that react to your presence.", icon: "🌸" },
    { title: "Neon Zen", desc: "A perfect balance between high-tech aesthetics and organic peace.", icon: "🏮" },
    { title: "Expedition UX", desc: "Navigate through a dreamlike landscape of interactive 3D nodes.", icon: "✨" }
  ];

  const creations = [
    { id: '1', name: 'Sakura Void', img: 'https://images.unsplash.com/photo-1651955038931-50d0feb05bb5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDczNjF8MHwxfHNlYXJjaHwxfHxjaGVycnklMjBibG9zc29tJTIwYnJhbmNoJTIwY2xvc2UtdXB8ZW58MHx8fHwxNzcyOTc4NjQwfDA&ixlib=rb-4.1.0&q=80&w=1080' },
    { id: '2', name: 'Coral Pulse', img: 'https://images.unsplash.com/photo-1772204867011-b66c62cf5ad8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDczNjF8MHwxfHNlYXJjaHwxfHxhdXJvcmElMjBwaW5rJTIwZ3JhZGllbnQlMjBiYWNrZ3JvdW5kfGVufDB8fHx8MTc3Mjk3ODY1Mnww&ixlib=rb-4.1.0&q=80&w=1080' },
    { id: '3', name: 'Silk Flow', img: 'https://images.unsplash.com/photo-1613007326658-3aeb881749d1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDczNjF8MHwxfHNlYXJjaHwxfHxwaW5rJTIwc2lsayUyMGZhYnJpYyUyMHRleHR1cmV8ZW58MHx8fHwxNzcyOTc4NjQ5fDA&ixlib=rb-4.1.0&q=80&w=1080' }
  ];

  return (
    <LoadingScreen3D>
      <NavBar3D />
      
      <div className="fixed inset-0 w-full h-screen bg-[#fdf2f8] overflow-hidden">
        <Suspense fallback={<div className="w-full h-full bg-[#fdf2f8] flex items-center justify-center text-[#f472b6]">Initializing Expedition...</div>}>
          <Canvas dpr={[1, 1.5]} shadows>
            <PerspectiveCamera makeDefault position={[0, 0, 10]} fov={45} />
            <color attach="background" args={['#fdf2f8']} />
            <fog attach="fog" args={['#fdf2f8', 10, 25]} />

            <ScrollControls pages={6} damping={0.2}>
              <Scroll>
                <Suspense fallback={null}>
                  <HeroScene3D />
                  <group position={[0, -12, 0]}>
                    <FeaturesScene3D />
                  </group>
                  <group position={[0, -24, 0]}>
                    <ShowcaseScene3D />
                  </group>
                  <group position={[0, -36, 0]}>
                    <TestimonialsScene3D />
                  </group>
                  <group position={[0, -48, 0]}>
                    <CtaScene3D />
                  </group>
                </Suspense>
              </Scroll>

              <Scroll html>
                {/* HERO SECTION */}
                <section className="h-screen w-screen flex flex-col items-center justify-center text-center px-6">
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    className="pointer-events-auto"
                  >
                    <h1 className="text-7xl md:text-9xl font-bold mb-4 tracking-tight leading-none text-[#f472b6] drop-shadow-sm" style={{ fontFamily: 'Bricolage Grotesque' }}>
                      NEON <br /> <span className="text-[#fb7185]">CHERRY</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-[#fb7185]/80 max-w-xl mx-auto mb-12 font-medium" style={{ fontFamily: 'Be Vietnam Pro' }}>
                      An immersive journey through the digital sakura gardens of the future.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <button 
                        onClick={() => navigate('/showcase')}
                        className="px-10 py-5 bg-[#f472b6] text-white rounded-full font-bold text-lg shadow-lg hover:bg-[#fb7185] hover:scale-105 transition-all duration-300 active:scale-95"
                      >
                        Start Expedition
                      </button>
                      <button 
                        onClick={() => navigate('/about')}
                        className="px-10 py-5 bg-white border-2 border-[#f472b6] text-[#f472b6] rounded-full font-bold text-lg hover:bg-[#fdf2f8] hover:scale-105 transition-all duration-300 active:scale-95"
                      >
                        Our Story
                      </button>
                    </div>
                  </motion.div>
                </section>

                {/* FEATURES SECTION */}
                <section className="h-screen w-screen flex items-center justify-center px-6">
                  <div className="max-w-7xl w-full grid grid-cols-1 md:grid-cols-3 gap-8 pointer-events-auto">
                    {features.map((f, i) => (
                      <motion.div 
                        key={i}
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.2, duration: 0.8 }}
                        viewport={{ once: true }}
                        className="p-10 rounded-[3rem] bg-white/40 backdrop-blur-2xl border border-white/60 shadow-xl hover:shadow-[#fda4af]/20 hover:-translate-y-4 transition-all duration-500 group"
                      >
                        <div className="text-5xl mb-6 group-hover:scale-125 transition-transform duration-500">{f.icon}</div>
                        <h3 className="text-3xl font-bold text-[#fb7185] mb-4" style={{ fontFamily: 'Bricolage Grotesque' }}>{f.title}</h3>
                        <p className="text-[#fb7185]/70 text-lg leading-relaxed" style={{ fontFamily: 'Be Vietnam Pro' }}>{f.desc}</p>
                      </motion.div>
                    ))}
                  </div>
                </section>

                {/* SHOWCASE SECTION */}
                <section className="h-screen w-screen flex items-center justify-center px-6">
                  <div className="w-full max-w-6xl pointer-events-auto">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-12">
                      <div>
                        <h2 className="text-5xl md:text-7xl font-bold text-[#f472b6] mb-4" style={{ fontFamily: 'Bricolage Grotesque' }}>The Gallery</h2>
                        <p className="text-xl text-[#fb7185]/60 max-w-md" style={{ fontFamily: 'Be Vietnam Pro' }}>Curated artifacts from the digital frontier.</p>
                      </div>
                      <button 
                        onClick={() => navigate('/showcase')}
                        className="mt-6 md:mt-0 text-[#fb7185] font-bold border-b-2 border-[#fb7185] pb-1 hover:text-[#f472b6] hover:border-[#f472b6] transition-colors"
                      >
                        View All Creations
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {creations.map((c, i) => (
                        <motion.div 
                          key={i}
                          whileHover={{ scale: 1.05 }}
                          className="aspect-[4/5] rounded-3xl overflow-hidden relative group cursor-pointer shadow-2xl"
                          onClick={() => navigate(`/experience/${c.id}`)}
                        >
                          <img src={c.img} alt={c.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#fb7185]/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-8">
                            <h4 className="text-white text-2xl font-bold">{c.name}</h4>
                            <p className="text-white/80">Interactive 3D Experience</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </section>

                {/* TESTIMONIALS SECTION */}
                <section className="h-screen w-screen flex items-center justify-center px-6">
                  <motion.div 
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    className="max-w-4xl w-full bg-white/60 backdrop-blur-3xl p-12 md:p-20 rounded-[4rem] border border-[#fda4af]/30 shadow-2xl relative overflow-hidden pointer-events-auto"
                  >
                    <div className="absolute top-10 right-10 text-9xl text-[#f472b6]/10 font-serif">“</div>
                    <p className="text-2xl md:text-4xl text-[#fb7185] font-medium leading-tight mb-10 relative z-10" style={{ fontFamily: 'Be Vietnam Pro' }}>
                      "The Neon Cyberpunk Expedition is not just a website; it's a digital sanctuary. The attention to detail in the cherry blossom physics is breathtaking."
                    </p>
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#f472b6] to-[#fb7185]" />
                      <div>
                        <h5 className="font-bold text-[#f472b6] text-xl">Aiko Tanaka</h5>
                        <p className="text-[#fb7185]/60">Lead Architect, Neo-Tokyo Systems</p>
                      </div>
                    </div>
                  </motion.div>
                </section>

                {/* CTA SECTION */}
                <section className="h-screen w-screen flex items-center justify-center px-6">
                  <motion.div 
                    initial={{ opacity: 0, y: 100 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    className="text-center pointer-events-auto"
                  >
                    <h2 className="text-6xl md:text-8xl font-bold text-[#f472b6] mb-8" style={{ fontFamily: 'Bricolage Grotesque' }}>Ready to Bloom?</h2>
                    <p className="text-xl text-[#fb7185]/70 mb-12 max-w-2xl mx-auto" style={{ fontFamily: 'Be Vietnam Pro' }}>
                      Join thousands of explorers in the most beautiful digital expedition ever created.
                    </p>
                    <button 
                      onClick={() => navigate('/contact')}
                      className="px-16 py-6 bg-[#fb7185] text-white rounded-full font-black text-2xl shadow-[0_20px_50px_rgba(251,113,133,0.3)] hover:shadow-[0_20px_60px_rgba(251,113,133,0.5)] hover:-translate-y-2 transition-all duration-500"
                    >
                      Connect with Us
                    </button>
                  </motion.div>
                </section>

                <section className="w-screen">
                  <Footer3D />
                </section>
              </Scroll>
            </ScrollControls>

            <Environment preset="sunset" />
            <EffectComposer>
              <Bloom intensity={0.5} luminanceThreshold={0.1} />
              <Noise opacity={0.02} />
              <Vignette eskil={false} offset={0.1} darkness={0.3} />
            </EffectComposer>
          </Canvas>
        </Suspense>
      </div>
    </LoadingScreen3D>
  );
};

export default HomePage;