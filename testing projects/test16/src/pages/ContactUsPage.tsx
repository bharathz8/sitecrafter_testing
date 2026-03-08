import React, { Suspense, lazy, useState } from 'react';
import { motion } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { ScrollControls, Scroll, Environment, PerspectiveCamera } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing';
import LoadingScreen3D from '@/components/3d/LoadingScreen3D';
import NavBar3D from '@/components/3d/NavBar3D';
import Footer3D from '@/components/3d/Footer3D';

const ContactScene3D = lazy(() => import('@/components/3d/ContactScene3D'));

const ContactUsPage = () => {
  const [formState, setFormState] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <LoadingScreen3D>
      <NavBar3D />

      <div className="fixed inset-0 w-full h-screen bg-black overflow-hidden">
        <Suspense fallback={<div className="w-full h-full bg-black" />}>
          <Canvas camera={{ position: [0, 0, 5], fov: 45 }} dpr={[1, 1.5]}>
            <color attach="background" args={['#050505']} />
            <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={45} />

            <ScrollControls pages={2} damping={0.1}>
              <ContactScene3D />

              <Scroll html>
                <section className="h-screen w-screen flex items-center justify-center px-4">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8 }}
                    className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 bg-black/40 backdrop-blur-3xl rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl pointer-events-auto"
                  >
                    <div className="p-12 bg-gradient-to-br from-[#f472b6]/20 to-[#fb7185]/20 flex flex-col justify-between">
                      <div>
                        <h1 className="text-5xl font-bold text-white mb-6">REACH<br />OUT</h1>
                        <p className="text-white/60 mb-12">Want to visit the farm or stock our purple harvest? Send a quantum transmission.</p>

                        <div className="space-y-6">
                          {[
                            { label: 'Coordinates', value: 'Sector 7, Purple Valley, Mars Colony Beta' },
                            { label: 'Frequency', value: '88.5 MHz "The Aurora"' },
                            { label: 'Direct Link', value: 'hello@cosmicpurple.farm' },
                          ].map((item) => (
                            <div key={item.label}>
                              <div className="text-[#fda4af] text-xs uppercase tracking-widest mb-1">{item.label}</div>
                              <div className="text-white font-medium">{item.value}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="p-12">
                      <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                          <label className="text-xs uppercase text-white/40 tracking-widest font-bold">Your Identifier</label>
                          <input
                            type="text"
                            required
                            placeholder="Name"
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-6 py-4 text-white placeholder:text-white/20 focus:outline-none focus:border-[#f472b6] transition-all"
                            onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs uppercase text-white/40 tracking-widest font-bold">Comms Channel</label>
                          <input
                            type="email"
                            required
                            placeholder="Email"
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-6 py-4 text-white placeholder:text-white/20 focus:outline-none focus:border-[#f472b6] transition-all"
                            onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs uppercase text-white/40 tracking-widest font-bold">The Transmission</label>
                          <textarea
                            rows={4}
                            required
                            placeholder="Your message..."
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-6 py-4 text-white placeholder:text-white/20 focus:outline-none focus:border-[#f472b6] transition-all resize-none"
                            onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={submitted}
                          className={`w-full py-5 rounded-2xl font-black tracking-widest transition-all transform active:scale-95 shadow-xl ${submitted ? 'bg-emerald-500 text-white' : 'bg-[#f472b6] hover:bg-[#fb7185] text-white'}`}
                        >
                          {submitted ? 'TRANSMITTED!' : 'SEND FREQUENCY'}
                        </button>
                      </form>
                    </div>
                  </motion.div>
                </section>
                <section className="w-screen">
                  <Footer3D />
                </section>
              </Scroll>
            </ScrollControls>

            <Environment preset="city" />

            <EffectComposer>
              <Bloom intensity={1.5} luminanceThreshold={0.2} luminanceSmoothing={0.9} />
              <Vignette eskil={false} offset={0.1} darkness={0.9} />
              <Noise opacity={0.05} />
            </EffectComposer>
          </Canvas>
        </Suspense>
      </div>
    </LoadingScreen3D>
  );
};

export default ContactUsPage;