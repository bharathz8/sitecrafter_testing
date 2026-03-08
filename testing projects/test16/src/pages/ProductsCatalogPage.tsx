import React, { Suspense, lazy, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { ScrollControls, Scroll, Environment, PerspectiveCamera } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing';
import LoadingScreen3D from '@/components/3d/LoadingScreen3D';
import NavBar3D from '@/components/3d/NavBar3D';
import Footer3D from '@/components/3d/Footer3D';

const ShowcaseScene3D = lazy(() => import('@/components/3d/ShowcaseScene3D'));

const cn = (...classes: (string | boolean | undefined)[]) => classes.filter(Boolean).join(' ');

const products = [
  { id: 1, name: 'Cosmic Apple', price: '$12', category: 'Fruit', image: 'https://images.unsplash.com/photo-1672676434074-20ff3b80a9c0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600' },
  { id: 2, name: 'Stardust Wheat', price: '$25', category: 'Grains', image: 'https://images.unsplash.com/photo-1664737018159-cfb08f2856d0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600' },
  { id: 3, name: 'Nebula Berries', price: '$18', category: 'Fruit', image: 'https://images.unsplash.com/photo-1758652561810-15fb1d251b1f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600' },
  { id: 4, name: 'Void Greens', price: '$14', category: 'Vegetables', image: 'https://images.unsplash.com/photo-1757332334667-d2e75d5816ba?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600' },
  { id: 5, name: 'Astro Root', price: '$9', category: 'Vegetables', image: 'https://images.unsplash.com/photo-1766589140016-f50f0a38a94d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600' },
  { id: 6, name: 'Solar Grapes', price: '$22', category: 'Fruit', image: 'https://images.unsplash.com/photo-1702137900575-4a84a842f789?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600' },
];

const ProductsCatalogPage = () => {
  const [filter, setFilter] = useState('All');
  const [cartCount, setCartCount] = useState(0);

  const filteredProducts = filter === 'All' ? products : products.filter(p => p.category === filter);

  return (
    <LoadingScreen3D>
      <NavBar3D />

      <div className="fixed inset-0 w-full h-screen bg-black overflow-hidden">
        <Suspense fallback={<div className="w-full h-full bg-black" />}>
          <Canvas camera={{ position: [0, 0, 10], fov: 50 }} dpr={[1, 1.5]}>
            <color attach="background" args={['#050505']} />
            <PerspectiveCamera makeDefault position={[0, 0, 10]} fov={50} />

            <ScrollControls pages={4} damping={0.1}>
              <ShowcaseScene3D />

              <Scroll html>
                <div className="w-screen px-4 md:px-12 py-32">
                  <header className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8 pointer-events-auto">
                    <div>
                      <h1 className="text-6xl font-bold text-white mb-4">THE CATALOG</h1>
                      <div className="flex gap-4 flex-wrap">
                        {['All', 'Fruit', 'Vegetables', 'Grains'].map(cat => (
                          <button
                            key={cat}
                            onClick={() => setFilter(cat)}
                            className={cn(
                              'px-6 py-2 rounded-full border transition-all font-medium',
                              filter === cat
                                ? 'bg-[#f472b6] border-[#f472b6] text-white shadow-[0_0_20px_rgba(244,114,182,0.4)]'
                                : 'border-white/20 text-white/50 hover:border-white/60'
                            )}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-xl p-6 rounded-2xl border border-white/20">
                      <div className="text-white/40 text-xs uppercase tracking-widest mb-1">Your Basket</div>
                      <div className="text-3xl font-bold text-white">{cartCount} ITEMS</div>
                    </div>
                  </header>

                  <AnimatePresence>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                      {filteredProducts.map((product) => (
                        <motion.div
                          layout
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          key={product.id}
                          className="group relative bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 overflow-hidden hover:border-[#f472b6]/50 transition-all duration-500 pointer-events-auto"
                        >
                          <div className="h-64 overflow-hidden">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            />
                          </div>
                          <div className="p-8">
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="text-2xl font-bold text-white">{product.name}</h3>
                              <span className="text-[#fda4af] font-bold">{product.price}</span>
                            </div>
                            <p className="text-white/40 text-sm mb-6 uppercase tracking-widest">{product.category}</p>
                            <button
                              onClick={() => setCartCount(prev => prev + 1)}
                              className="w-full py-4 bg-white text-black rounded-xl font-bold hover:bg-[#f472b6] hover:text-white transition-all transform active:scale-95 shadow-xl"
                            >
                              ADD TO BASKET
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </AnimatePresence>

                  <div className="mt-20 flex justify-center pb-12 pointer-events-auto">
                    <button className="px-8 py-4 text-white/40 hover:text-white transition-colors border-b border-white/10">
                      LOAD MORE QUANTUM HARVESTS
                    </button>
                  </div>
                </div>

                <section className="w-screen">
                  <Footer3D />
                </section>
              </Scroll>
            </ScrollControls>

            <Environment preset="studio" />

            <EffectComposer>
              <Bloom intensity={1.5} luminanceThreshold={0.2} luminanceSmoothing={0.9} />
              <Vignette eskil={false} offset={0.1} darkness={0.8} />
              <Noise opacity={0.04} />
            </EffectComposer>
          </Canvas>
        </Suspense>
      </div>
    </LoadingScreen3D>
  );
};

export default ProductsCatalogPage;