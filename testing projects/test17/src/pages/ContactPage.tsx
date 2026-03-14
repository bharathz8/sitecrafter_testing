import React, { Suspense, lazy, useState } from 'react';
import { motion } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { ScrollControls, Scroll, Environment, PerspectiveCamera } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import LoadingScreen3D from '@/components/3d/LoadingScreen3D';
import NavBar3D from '@/components/3d/NavBar3D';
import Footer3D from '@/components/3d/Footer3D';

const ContactScene3D = lazy(() => import('@/components/3d/ContactScene3D'));

const ContactPage = () => {
  const [formState, setFormState] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <LoadingScreen3D>
      <NavBar3D />
      
      <div className="fixed inset-0 w-full h-screen bg-[#fdf2f8] overflow-hidden">
        <Suspense fallback={<div className="w-full h-full bg-[#fdf2f8]" />}>
          <Canvas dpr={[1, 1.5]}>
            <PerspectiveCamera makeDefault position={[0, 0, 10]} fov={45} />
            <ScrollControls pages={2} damping={0.2}>
              <Scroll>
                <ContactScene3D />
              </Scroll>

              <Scroll html>
                <section className="h-screen w-screen flex items-center justify-center px-6">
                  <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-20 items-center pointer-events-auto">
                    <motion.div 
                      initial={{ opacity: 0, x: -50 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      className="space-y-8"
                    >
                      <h1 className="text-7xl md:text-8xl font-black text-[#f472b6] leading-none" style={{ fontFamily: 'Bricolage Grotesque' }}>
                        Say <br /> <span className="text-[#fb7185]">Hello.</span>
                      </h1>
                      <p className="text-xl text-[#fb7185]/70 max-w-md font-medium" style={{ fontFamily: 'Be Vietnam Pro' }}>
                        Whether you're looking to collaborate, invest, or just share your love for sakura, our digital doors are always open.
                      </p>
                      
                      <div className="space-y-4 pt-8">
                        <div className="flex items-center gap-4 group cursor-pointer">
                          <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-[#f472b6] border border-[#f472b6]/20 group-hover:bg-[#f472b6] group-hover:text-white transition-all">📧</div>
                          <span className="text-[#fb7185] font-bold">hello@neon-sakura.exp</span>
                        </div>
                        <div className="flex items-center gap-4 group cursor-pointer">
                          <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-[#f472b6] border border-[#f472b6]/20 group-hover:bg-[#f472b6] group-hover:text-white transition-all">📍</div>
                          <span className="text-[#fb7185] font-bold">Neo-Kyoto, Sector 7</span>
                        </div>
                      </div>
                    </motion.div>

                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      className="bg-white/60 backdrop-blur-2xl p-10 md:p-12 rounded-[3rem] border border-white shadow-2xl relative overflow-hidden"
                    >
                      {submitted ? (
                        <motion.div 
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-center py-20"
                        >
                          <div className="text-6xl mb-6">🌸</div>
                          <h3 className="text-3xl font-bold text-[#f472b6] mb-4">Message Sent!</h3>
                          <p className="text-[#fb7185]/60">Our digital petals are carrying your words to us.</p>
                        </motion.div>
                      ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                          <div>
                            <label className="block text-[#fb7185] font-bold mb-2 ml-2">Name</label>
                            <input 
                              type="text" 
                              required
                              className="w-full bg-white/50 border-2 border-transparent focus:border-[#f472b6] rounded-2xl px-6 py-4 outline-none transition-all text-[#fb7185]"
                              placeholder="Your Name"
                              value={formState.name}
                              onChange={e => setFormState({...formState, name: e.target.value})}
                            />
                          </div>
                          <div>
                            <label className="block text-[#fb7185] font-bold mb-2 ml-2">Email</label>
                            <input 
                              type="email" 
                              required
                              className="w-full bg-white/50 border-2 border-transparent focus:border-[#f472b6] rounded-2xl px-6 py-4 outline-none transition-all text-[#fb7185]"
                              placeholder="explorer@email.com"
                              value={formState.email}
                              onChange={e => setFormState({...formState, email: e.target.value})}
                            />
                          </div>
                          <div>
                            <label className="block text-[#fb7185] font-bold mb-2 ml-2">Message</label>
                            <textarea 
                              required
                              rows={4}
                              className="w-full bg-white/50 border-2 border-transparent focus:border-[#f472b6] rounded-2xl px-6 py-4 outline-none transition-all text-[#fb7185] resize-none"
                              placeholder="Tell us about your expedition..."
                              value={formState.message}
                              onChange={e => setFormState({...formState, message: e.target.value})}
                            />
                          </div>
                          <button 
                            type="submit"
                            className="w-full py-5 bg-[#fb7185] text-white rounded-2xl font-black text-xl shadow-lg hover:bg-[#f472b6] transition-all hover:-translate-y-1 active:scale-95"
                          >
                            Send Transmission
                          </button>
                        </form>
                      )}
                    </motion.div>
                  </div>
                </section>

                <section className="w-screen">
                  <Footer3D />
                </section>
              </Scroll>
            </ScrollControls>

            <Environment preset="city" />
            <EffectComposer>
              <Bloom intensity={0.4} />
              <Vignette offset={0.1} darkness={0.3} />
            </EffectComposer>
          </Canvas>
        </Suspense>
      </div>
    </LoadingScreen3D>
  );
};

export default ContactPage;