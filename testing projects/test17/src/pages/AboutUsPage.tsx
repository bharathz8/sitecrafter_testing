import React, { Suspense, lazy } from 'react';
import { motion } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { ScrollControls, Scroll, Environment } from '@react-three/drei';

const AboutScene3D = lazy(() => import('@/components/3d/AboutScene3D'));
const GenericScene3D = lazy(() => import('@/components/3d/GenericScene3D'));
const NavBar3D = lazy(() => import('@/components/3d/NavBar3D'));
const Footer3D = lazy(() => import('@/components/3d/Footer3D'));

const AboutUsPage = () => {
  return (
    <Suspense fallback={<div className="fixed inset-0 bg-[#1c1917]" />}>
      <NavBar3D />

      <div className="fixed inset-0 w-full h-screen bg-[#1c1917] overflow-hidden">
        <Canvas>
          <ScrollControls pages={4} damping={0.2}>
            <Scroll>
              <Suspense fallback={null}>
                <AboutScene3D />
                <group position={[0, -20, 0]}>
                  <GenericScene3D />
                </group>
              </Suspense>
            </Scroll>

            <Scroll html>
              {/* MISSION */}
              <section className="h-screen w-screen flex items-center justify-center px-6">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  className="max-w-5xl text-center pointer-events-auto"
                >
                  <h1 className="text-6xl md:text-9xl font-black text-white uppercase tracking-tighter mb-8 leading-[0.8]">
                    Our <span className="text-[#ef4444]">Roots</span>
                  </h1>
                  <p className="text-2xl md:text-4xl text-[#fbbf24] font-light leading-snug">
                    Founded in the heart of the volcanic belt, Aethelgard's Arboretum is a living laboratory dedicated to the intersection of ancient biology and future technology.
                  </p>
                </motion.div>
              </section>

              {/* TEAM */}
              <section className="h-screen w-screen flex items-center justify-center px-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl w-full">
                  {[
                    { name: 'Soren Aethelgard', role: 'Founder & Sage', img: 'https://images.unsplash.com/photo-1703107663680-0122c54e4f74?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080' },
                    { name: 'Lyra Moon', role: 'Digital Druid', img: 'https://images.unsplash.com/photo-1726137569966-a7354383e2ae?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080' },
                    { name: 'Kaelen Ash', role: 'Fire Keeper', img: 'https://images.unsplash.com/photo-1705964068512-8758a8208edc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080' }
                  ].map((member, i) => (
                    <motion.div
                      key={i}
                      whileHover={{ y: -20, rotate: i % 2 === 0 ? 2 : -2 }}
                      className="bg-[#292524] rounded-[2rem] p-6 border border-white/5 pointer-events-auto group"
                    >
                      <div className="aspect-square rounded-2xl overflow-hidden mb-6 relative">
                        <img src={member.img} alt={member.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                        <div className="absolute inset-0 bg-[#ef4444]/20 group-hover:opacity-0 transition-opacity" />
                      </div>
                      <h3 className="text-2xl font-bold text-white uppercase">{member.name}</h3>
                      <p className="text-[#fbbf24] font-bold uppercase text-xs tracking-widest">{member.role}</p>
                    </motion.div>
                  ))}
                </div>
              </section>

              {/* VALUES */}
              <section className="h-screen w-screen flex items-center justify-center px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-6xl w-full">
                  <div className="space-y-12">
                    <motion.div initial={{ x: -50, opacity: 0 }} whileInView={{ x: 0, opacity: 1 }} className="pointer-events-auto">
                      <h3 className="text-4xl font-black text-[#ef4444] uppercase mb-4">Radical Resilience</h3>
                      <p className="text-white/70 text-xl">We believe in growing stronger through adversity, much like the flora that thrives in volcanic heat.</p>
                    </motion.div>
                    <motion.div initial={{ x: -50, opacity: 0 }} whileInView={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="pointer-events-auto">
                      <h3 className="text-4xl font-black text-[#f97316] uppercase mb-4">Symbiotic Tech</h3>
                      <p className="text-white/70 text-xl">Technology should serve nature, providing the neural links required for global botanical harmony.</p>
                    </motion.div>
                  </div>
                  <div className="relative">
                    <img 
                      src="https://images.unsplash.com/photo-1743685894125-a47b3a746e99?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080" 
                      alt="solar garden" 
                      className="rounded-[3rem] border-4 border-[#fbbf24]/20 shadow-2xl"
                    />
                  </div>
                </div>
              </section>

              <Footer3D />
            </Scroll>
          </ScrollControls>
          <Environment preset="city" />
        </Canvas>
      </div>
    </Suspense>
  );
};

export default AboutUsPage;