import React, { Suspense, lazy } from 'react';
import { motion } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { useNavigate } from 'react-router-dom';
import LoadingScreen3D from '@/components/3d/LoadingScreen3D';
import NavBar3D from '@/components/3d/NavBar3D';

const GenericScene3D = lazy(() => import('@/components/3d/GenericScene3D'));

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <LoadingScreen3D>
      <NavBar3D />
      
      <div className="fixed inset-0 w-full h-screen bg-black overflow-hidden">
        <Suspense fallback={<div className="bg-black w-full h-full" />}>
          <Canvas camera={{ position: [0, 0, 5] }}>
            <GenericScene3D />
          </Canvas>
        </Suspense>

        <div className="absolute inset-0 flex items-center justify-center text-center px-4 z-10 pointer-events-none">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="pointer-events-auto"
          >
            <h1 className="text-[15rem] md:text-[20rem] font-black leading-none text-white/5 select-none">404</h1>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg">
              <h2 className="text-4xl font-bold text-white mb-4">LOST IN DEEP SPACE</h2>
              <p className="text-white/50 mb-10">The coordinates you provided lead to a void. Let's get you back to the farm.</p>
              <button 
                onClick={() => navigate('/')}
                className="px-12 py-5 bg-white text-black rounded-full font-black tracking-widest hover:bg-[#f472b6] hover:text-white transition-all transform hover:scale-110 active:scale-95 shadow-[0_0_50px_rgba(255,255,255,0.2)]"
              >
                RETURN TO BASE
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </LoadingScreen3D>
  );
};

export default NotFoundPage;