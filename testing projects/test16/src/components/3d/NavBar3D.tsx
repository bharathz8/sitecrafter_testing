import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

const NavBar3D = ({ className }: { className?: string }) => {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { label: 'Home', to: '/' },
    { label: 'Farm Tour', to: '/farm-tour' },
    { label: 'Products', to: '/products' },
    { label: 'About', to: '/about' },
    { label: 'Contact', to: '/contact' },
  ];

  return (
    <nav className={cn('fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-black/30 border-b border-white/10 px-6 py-4 flex items-center justify-between', className)}>
      <Link to="/" className="text-white font-bold text-xl tracking-[0.2em] uppercase hover:text-[#f472b6] transition-colors">
        Cosmic Purple
      </Link>

      <div className="hidden md:flex gap-8">
        {navLinks.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className="text-white/80 hover:text-[#f472b6] transition-colors duration-300 text-sm font-medium tracking-widest uppercase"
          >
            {link.label}
          </Link>
        ))}
      </div>

      <button
        className="md:hidden flex flex-col gap-1.5 z-50"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle navigation"
      >
        <span className={cn('w-6 h-0.5 bg-white transition-all duration-300', isOpen && 'rotate-45 translate-y-2')} />
        <span className={cn('w-6 h-0.5 bg-white transition-all duration-300', isOpen && 'opacity-0')} />
        <span className={cn('w-6 h-0.5 bg-white transition-all duration-300', isOpen && '-rotate-45 -translate-y-2')} />
      </button>

      <div className={cn(
        'fixed inset-0 bg-black/95 backdrop-blur-xl transition-transform duration-500 md:hidden flex flex-col items-center justify-center gap-8 z-40',
        isOpen ? 'translate-y-0' : '-translate-y-full'
      )}>
        {navLinks.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className="text-3xl text-white font-bold tracking-tighter hover:text-[#f472b6] transition-colors"
            onClick={() => setIsOpen(false)}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default NavBar3D;