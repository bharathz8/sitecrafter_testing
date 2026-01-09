import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { ShieldAlert, Home, ArrowLeft } from 'lucide-react';

const cn = (...classes: (string | boolean | undefined)[]) => classes.filter(Boolean).join(' ');

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 overflow-hidden relative">
      {/* Visual Glitch Elements */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute top-[20%] left-[10%] w-px h-[60%] bg-indigo-500" />
        <div className="absolute top-[40%] right-[15%] w-px h-[40%] bg-purple-500" />
        <div className="absolute top-[10%] left-[30%] w-[40%] h-px bg-indigo-500" />
      </div>

      <div className="max-w-xl w-full text-center relative z-10">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, type: 'spring' }}
          className="mb-10"
        >
          <div className="w-24 h-24 bg-rose-600/20 text-rose-500 rounded-3xl flex items-center justify-center mx-auto mb-8 animate-pulse shadow-2xl shadow-rose-600/20">
            <ShieldAlert className="w-12 h-12" />
          </div>
          <h1 className="text-8xl font-black text-white mb-4 tracking-tighter">404</h1>
          <div className="inline-block px-4 py-1 bg-rose-600 text-white text-xs font-bold rounded-full mb-8 uppercase tracking-[0.3em]">
            Sector Restricted
          </div>
          <h2 className="text-3xl font-bold text-slate-200 mb-6">Unauthorized Sector Access</h2>
          <p className="text-slate-400 text-lg mb-10 leading-relaxed">
            The coordinates you have provided are outside the authorized operations area. Please return to a known sector or contact your commanding officer.
          </p>
        </motion.div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            variant="outline" 
            className="border-slate-800 text-slate-300 hover:bg-slate-900 h-14 px-8"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="mr-2 w-5 h-5" /> Previous Sector
          </Button>
          <Button 
            className="bg-indigo-600 hover:bg-indigo-700 h-14 px-8 text-white font-bold"
            onClick={() => window.location.href = '/'}
          >
            <Home className="mr-2 w-5 h-5" /> Base Command
          </Button>
        </div>

        <div className="mt-16 pt-8 border-t border-slate-900">
          <div className="text-[10px] font-mono text-slate-600 uppercase tracking-widest">
            Error ID: ERR_SECTOR_OUT_OF_BOUNDS_0x404
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;