import React, { Suspense, lazy } from 'react';
import { motion } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { ScrollControls, Scroll, Environment } from '@react-three/drei';

const ContactScene3D = lazy(() => import('@/components/3d/ContactScene3D'));
const NavBar3D = lazy(() => import('@/components/3d/NavBar3D'));
const Footer3D = lazy(() => import('@/components/3d/Footer3D'));

const ContactPage = () => {
  return (
    <Suspense fallback={<div className="fixed inset-0 bg-[#1c1917]" />}>
      <NavBar3D />

      <div className="fixed inset-0 w-full h-screen bg-[#1c1917] overflow-hidden">
        <Canvas>
          <ScrollControls pages={2} damping={0.2}>
            <Scroll>
              <Suspense fallback={null}>
                <ContactScene3D />
              </Suspense>
            </Scroll>

            <Scroll html>
              <section className="min-h-screen w-screen flex items-center justify-center px-6 pt-32 pb-20">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 max-w-7xl w-full">
                  {/* FORM */}
                  <motion.div 
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-[#292524]/60 backdrop-blur-3xl p-10 md:p-16 rounded-[3rem] border border-white/5 pointer-events-auto"
                  >
                    <h1 className="text-5xl font-black text-white uppercase mb-8">Send a <span className="text-[#ef4444]">Pulse</span></h1>
                    <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                      <div>
                        <label className="block text-[#fbbf24] font-bold uppercase text-xs mb-2 tracking-widest">Your Name</label>
                        <input type="text" className="w-full bg-white/5 border border-white/10 rounded-xl px-6 py-4 text-white focus:border-[#ef4444] transition-colors outline-none" placeholder="Botanist Doe" />
                      </div>
                      <div>
                        <label className="block text-[#fbbf24] font-bold uppercase text-xs mb-2 tracking-widest">Email Address</label>
                        <input type="email" className="w-full bg-white/5 border border-white/10 rounded-xl px-6 py-4 text-white focus:border-[#ef4444] transition-colors outline-none" placeholder="sage@arboretum.org" />
                      </div>
                      <div>
                        <label className="block text-[#fbbf24] font-bold uppercase text-xs mb-2 tracking-widest">Message</label>
                        <textarea rows={4} className="w-full bg-white/5 border border-white/10 rounded-xl px-6 py-4 text-white focus:border-[#ef4444] transition-colors outline-none resize-none" placeholder="How can we grow together?" />
                      </div>
                      <button className="w-full py-5 bg-[#ef4444] text-white font-black rounded-xl hover:bg-[#f97316] transition-all duration-300 hover:scale-[1.02] shadow-xl shadow-[#ef4444]/20 uppercase">
                        Ignite Connection
                      </button>
                    </form>
                  </motion.div>

                  {/* INFO */}
                  <div className="flex flex-col justify-center space-y-12">
                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                      <h3 className="text-[#fbbf24] font-black uppercase text-xs mb-4 tracking-widest">Visit the Garden</h3>
                      <p className="text-3xl text-white font-medium">12 Obsidian Way,<br />Volcanic Belt Central,<br />Aethelgard 90210</p>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                      <h3 className="text-[#fbbf24] font-black uppercase text-xs mb-4 tracking-widest">Digital Frequencies</h3>
                      <p className="text-3xl text-white font-medium">@aethelgard_arboretum<br />hello@aethelgard.io</p>
                    </motion.div>
                    <div className="grid grid-cols-3 gap-4">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="aspect-square rounded-2xl bg-[#292524] border border-white/5 overflow-hidden">
                           <img src={`https://images.unsplash.com/photo-1697852441303-155c98be9ef4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=300`} alt="berries" className="w-full h-full object-cover opacity-50" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              <Footer3D />
            </Scroll>
          </ScrollControls>
          <Environment preset="night" />
        </Canvas>
      </div>
    </Suspense>
  );
};

export default ContactPage;