import React, { Suspense, lazy, useState } from 'react';
import { motion } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { ScrollControls, Scroll, Environment, PerspectiveCamera } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { useNavigate } from 'react-router-dom';

const BlogScene3D = lazy(() => import('@/components/3d/BlogScene3D'));
const BackgroundScene3D = lazy(() => import('@/components/3d/BackgroundScene3D'));
const LoadingScreen3D = lazy(() => import('@/components/3d/LoadingScreen3D'));
const NavBar3D = lazy(() => import('@/components/3d/NavBar3D'));
const Footer3D = lazy(() => import('@/components/3d/Footer3D'));

const ARTICLES = [
  { id: 1, title: 'The Volcanic Soil Secret', category: 'Botany', img: 'https://images.unsplash.com/photo-1530724091300-2ae0a2da4bdc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080' },
  { id: 2, title: 'Morning Tea Rituals', category: 'Mindfulness', img: 'https://images.unsplash.com/photo-1764346855637-86c95ae0eb90?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080' },
  { id: 3, title: 'Sustainable Saplings', category: 'Ecology', img: 'https://images.unsplash.com/photo-1651959058282-8ff17834a117?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080' },
  { id: 4, title: 'Drawing the Wild', category: 'Art', img: 'https://images.unsplash.com/photo-1607355237628-bd1276a1c567?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080' },
  { id: 5, title: 'Lab to Garden', category: 'Science', img: 'https://images.unsplash.com/photo-1609138429624-82b48e5f4cb0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080' },
  { id: 6, title: 'Forest Pathfinding', category: 'Exploration', img: 'https://images.unsplash.com/photo-1592859600972-1b0834d83747?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080' },
];

const ArticlesListingPage = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('All');

  return (
    <Suspense fallback={<div className="fixed inset-0 bg-[#1c1917]" />}>
      <LoadingScreen3D />
      <NavBar3D />

      <div className="fixed inset-0 w-full h-screen bg-[#1c1917] overflow-hidden">
        <Canvas dpr={[1, 1.5]}>
          <PerspectiveCamera makeDefault position={[0, 0, 12]} fov={45} />
          
          <ScrollControls pages={3} damping={0.25}>
            <Scroll>
              <Suspense fallback={null}>
                <BlogScene3D />
                <group position={[0, -15, 0]}>
                  <BackgroundScene3D />
                </group>
              </Suspense>
            </Scroll>

            <Scroll html>
              {/* HEADER SECTION */}
              <section className="h-[40vh] w-screen flex flex-col items-center justify-end pb-12 px-4">
                <motion.h1 
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="text-5xl md:text-7xl font-black text-white uppercase mb-8"
                >
                  The <span className="text-[#f97316]">Arboretum</span> Archives
                </motion.h1>
                <div className="flex gap-4 overflow-x-auto pb-4 max-w-full pointer-events-auto">
                  {['All', 'Botany', 'Mindfulness', 'Science', 'Art'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setFilter(cat)}
                      className={`px-6 py-2 rounded-full font-bold transition-all border ${
                        filter === cat ? 'bg-[#ef4444] border-[#ef4444] text-white' : 'bg-white/5 border-white/10 text-white/60 hover:border-[#fbbf24]'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </section>

              {/* GRID SECTION */}
              <section className="min-h-screen w-screen px-6 md:px-20 py-12">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                  {ARTICLES.filter(a => filter === 'All' || a.category === filter).map((article, i) => (
                    <motion.div
                      key={article.id}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      whileHover={{ y: -10 }}
                      onClick={() => navigate(`/articles/${article.id}`)}
                      className="group cursor-pointer pointer-events-auto"
                    >
                      <div className="relative aspect-[4/5] overflow-hidden rounded-3xl border border-white/10 bg-[#292524]">
                        <img src={article.img} alt={article.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#1c1917] via-transparent to-transparent opacity-80" />
                        <div className="absolute bottom-0 left-0 p-8">
                          <span className="text-[#fbbf24] text-xs font-black uppercase tracking-widest mb-2 block">{article.category}</span>
                          <h3 className="text-2xl font-bold text-white uppercase group-hover:text-[#ef4444] transition-colors">{article.title}</h3>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </section>

              <Footer3D />
            </Scroll>
          </ScrollControls>

          <Environment preset="forest" />
          <EffectComposer>
            <Bloom intensity={0.5} />
            <Vignette eskil={false} offset={0.1} darkness={0.9} />
          </EffectComposer>
        </Canvas>
      </div>
    </Suspense>
  );
};

export default ArticlesListingPage;