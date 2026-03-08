import React, { Suspense, lazy } from 'react';
import { motion } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { ScrollControls, Scroll, Environment } from '@react-three/drei';
import { useParams, useNavigate } from 'react-router-dom';

const GenericScene3D = lazy(() => import('@/components/3d/GenericScene3D'));
const BackgroundScene3D = lazy(() => import('@/components/3d/BackgroundScene3D'));
const NavBar3D = lazy(() => import('@/components/3d/NavBar3D'));
const Footer3D = lazy(() => import('@/components/3d/Footer3D'));

const ArticleDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <Suspense fallback={<div className="fixed inset-0 bg-[#1c1917]" />}>
      <NavBar3D />

      <div className="fixed inset-0 w-full h-screen bg-[#1c1917] overflow-hidden">
        <Canvas>
          <ScrollControls pages={4} damping={0.2}>
            <Scroll>
              <Suspense fallback={null}>
                <GenericScene3D />
                <group position={[0, -15, 0]}>
                  <BackgroundScene3D />
                </group>
              </Suspense>
            </Scroll>

            <Scroll html>
              <article className="w-screen flex flex-col items-center">
                {/* HERO HEADER */}
                <header className="h-[70vh] w-full flex flex-col items-center justify-center text-center px-4">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-4xl"
                  >
                    <button 
                      onClick={() => navigate('/articles')}
                      className="mb-8 text-[#fbbf24] font-bold uppercase tracking-widest hover:text-white transition-colors pointer-events-auto"
                    >
                      ← Back to Archives
                    </button>
                    <h1 className="text-5xl md:text-8xl font-black text-white uppercase leading-none mb-6">
                      The Volcanic <span className="text-[#ef4444]">Soil</span> Secret
                    </h1>
                    <div className="flex items-center justify-center gap-6 text-white/60 font-bold uppercase tracking-widest">
                      <span>By Aethelgard</span>
                      <span className="w-2 h-2 rounded-full bg-[#f97316]" />
                      <span>8 Min Read</span>
                      <span className="w-2 h-2 rounded-full bg-[#f97316]" />
                      <span>Oct 2024</span>
                    </div>
                  </motion.div>
                </header>

                {/* CONTENT BODY */}
                <section className="w-full max-w-4xl px-6 py-20">
                  <motion.div 
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    className="bg-[#292524]/40 backdrop-blur-3xl p-8 md:p-16 rounded-[3rem] border border-white/5 pointer-events-auto"
                  >
                    <div className="prose prose-invert prose-2xl max-w-none text-white/80 leading-relaxed font-light" style={{ fontFamily: 'Satoshi, sans-serif' }}>
                      <p className="mb-8 first-letter:text-7xl first-letter:font-bold first-letter:text-[#ef4444] first-letter:mr-3 first-letter:float-left">
                        Deep within the obsidian veins of Aethelgard lies a secret that botanists have whispered about for centuries. The volcanic soil, rich in silicates and primordial embers, provides a nutritional profile unlike anything found in temperate forests.
                      </p>
                      
                      <img 
                        src="https://images.unsplash.com/photo-1483718983629-1100e0808b32?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080" 
                        alt="claymorphic plant" 
                        className="w-full rounded-2xl my-12 border-2 border-[#f97316]/20"
                      />

                      <h2 className="text-3xl font-bold text-white uppercase mb-6 mt-12">The Mineral Conductivity</h2>
                      <p className="mb-8">
                        Our research indicates that the high iron content in these soils acts as a natural conductor for geothermal energy, literally "charging" the root systems of the Arboretum's oldest specimens. This results in growth cycles that are 40% more efficient than standard organic substrates.
                      </p>

                      <div className="my-12 p-8 bg-[#ef4444]/10 border-l-4 border-[#ef4444] rounded-r-xl">
                        <p className="text-[#fbbf24] italic text-xl">
                          "To understand the leaf, one must first respect the fire that forged the soil beneath it."
                        </p>
                      </div>

                      <p>
                        As we continue to catalog these unique adaptive traits, we invite the community to participate in our upcoming seed-sharing initiative. Together, we can propagate the resilience of the volcanic garden across the digital landscape.
                      </p>
                    </div>
                  </motion.div>
                </section>

                {/* RELATED */}
                <section className="w-full max-w-6xl px-6 py-20">
                  <h3 className="text-2xl font-black text-white uppercase mb-12 border-b border-white/10 pb-4">Continue the Journey</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="p-8 bg-[#292524] rounded-3xl border border-white/5 hover:border-[#fbbf24] transition-all cursor-pointer pointer-events-auto">
                       <span className="text-[#ef4444] font-black uppercase text-xs mb-2 block">Next Article</span>
                       <h4 className="text-2xl font-bold text-white uppercase">Morning Tea Rituals</h4>
                    </div>
                    <div className="p-8 bg-[#292524] rounded-3xl border border-white/5 hover:border-[#fbbf24] transition-all cursor-pointer pointer-events-auto">
                       <span className="text-[#ef4444] font-black uppercase text-xs mb-2 block">Previous</span>
                       <h4 className="text-2xl font-bold text-white uppercase">Drawing the Wild</h4>
                    </div>
                  </div>
                </section>

                <Footer3D />
              </article>
            </Scroll>
          </ScrollControls>
          <Environment preset="sunset" />
        </Canvas>
      </div>
    </Suspense>
  );
};

export default ArticleDetailPage;