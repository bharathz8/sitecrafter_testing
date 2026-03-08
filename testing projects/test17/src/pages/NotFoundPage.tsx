import React, { Suspense, lazy } from 'react';
import { motion } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { ScrollControls, Scroll, Environment } from '@react-three/drei';
import { useNavigate } from 'react-router-dom';

const GenericScene3D = lazy(() => import('@/components/3d/GenericScene3D'));
const NavBar3D = lazy(() => import('@/components/3d/NavBar3D'));

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <Suspense fallback={<div className="fixed inset-0 bg-[#1c1917]" />}>
      <NavBar3D />

      <div className="fixed inset-0 w-full h-screen bg-[#1c1917] overflow-hidden">
        <Canvas>
          <ScrollControls pages={1}>
            <Scroll>
              <GenericScene3D />
            </Scroll>

            <Scroll html>
              <section className="h-screen w-screen flex flex-col items-center justify-center text-center px-4">
                <motion.div
                  initial={{ rotate: -10, scale: 0.5, opacity: 0 }}
                  animate={{ rotate: 0, scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 100 }}
                  className="pointer-events-auto"
                >
                  <h1 className="text-[15rem] md:text-[20rem] font-black text-[#ef4444] leading-none select-none">404</h1>
                  <h2 className="text-4xl md:text-6xl font-black text-white uppercase mt-[-4rem] mb-8">Lost in the Thicket</h2>
                  <p className="text-[#fbbf24] text-xl max-w-lg mx-auto mb-12">The path you seek has been overgrown by the volcanic vines. Let's find our way back to the clearing.</p>
                  <button 
                    onClick={() => navigate('/')}
                    className="px-12 py-5 bg-white text-[#1c1917] font-black rounded-full hover:bg-[#fbbf24] transition-all duration-300 hover:scale-110 uppercase"
                  >
                    Return to the Roots
                  </button>
                </motion.div>
              </section>
            </Scroll>
          </ScrollControls>
          <Environment preset="forest" />
        </Canvas>
      </div>
    </Suspense>
  );
};

export default NotFoundPage;