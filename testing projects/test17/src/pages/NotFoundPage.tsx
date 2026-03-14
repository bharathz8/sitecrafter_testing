import React, { Suspense, lazy } from 'react';
import { motion } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { ScrollControls, Scroll, Environment, PerspectiveCamera } from '@react-three/drei';
import LoadingScreen3D from '@/components/3d/LoadingScreen3D';
import NavBar3D from '@/components/3d/NavBar3D';
import Footer3D from '@/components/3d/Footer3D';
import { useNavigate } from 'react-router-dom';

const GenericScene3D = lazy(() => import('@/components/3d/GenericScene3D'));

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <LoadingScreen3D>
      <NavBar3D />
      
      <div className="fixed inset-0 w-full h-screen bg-[#fdf2f8] overflow-hidden">
        <Suspense fallback={<div className="w-full h-full bg-[#fdf2f8]" />}>
          <Canvas dpr={[1, 1.5]}>
            <PerspectiveCamera makeDefault position={[0, 0, 8]} fov={50} />
            <ScrollControls pages={1} damping={0.2}>
              <Scroll>
                <GenericScene3D />
              </Scroll>

              <Scroll html>
                <section className="h-screen w-screen flex flex-col items-center justify-center px-6">
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, type: "spring" }}
                    className="text-center pointer-events-auto"
                  >
                    <h1 className="text-[12rem] md:text-[20rem] font-black text-[#f472b6]/20 leading-none select-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10">
                      404
                    </h1>
                    <div className="text-8xl mb-8">🥀</div>
                    <h2 className="text-5xl md:text-7xl font-bold text-[#fb7185] mb-6" style={{ fontFamily: 'Bricolage Grotesque' }}>Lost in the Void</h2>
                    <p className="text-xl text-[#fb7185]/60 mb-12 max-w-md mx-auto" style={{ fontFamily: 'Be Vietnam Pro' }}>
                      Even the most seasoned explorers lose their way. Let's get you back to the garden.
                    </p>
                    <button 
                      onClick={() => navigate('/')}
                      className="px-12 py-5 bg-[#f472b6] text-white rounded-full font-bold text-xl shadow-xl hover:scale-105 transition-all"
                    >
                      Return Home
                    </button>
                  </motion.div>
                </section>

                <section className="w-screen absolute bottom-0">
                  <Footer3D />
                </section>
              </Scroll>
            </ScrollControls>
            <Environment preset="sunset" />
          </Canvas>
        </Suspense>
      </div>
    </LoadingScreen3D>
  );
};

export default NotFoundPage;