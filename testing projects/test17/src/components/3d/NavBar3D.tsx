import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

/**
 * NavBar3D - A high-end, cinematic HTML navigation bar.
 * Designed for an immersive 3D experience with glassmorphism and subtle glow effects.
 * 
 * TYPE 2: NAVBAR3D (Plain HTML, NOT 3D)
 * Rules: Fixed position, backdrop-blur, pure CSS hamburger, no Canvas.
 */
export const NavBar3D = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  // Handle scroll state for background opacity transitions
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Articles', path: '/articles' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ease-in-out",
        scrolled 
          ? "bg-black/60 backdrop-blur-xl border-b border-white/10 py-4" 
          : "bg-transparent py-6"
      )}
    >
      <div className="container mx-auto px-6 md:px-12 flex items-center justify-between">
        {/* Brand Logo */}
        <Link 
          to="/" 
          className="relative group flex items-center gap-2"
        >
          <span className="text-white font-bold text-xl md:text-2xl tracking-[0.3em] uppercase transition-all duration-300 group-hover:text-[#ef4444]">
            Aethelgard
          </span>
          {/* Subtle underline glow */}
          <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-gradient-to-r from-[#ef4444] to-[#f97316] transition-all duration-500 group-hover:w-full shadow-[0_0_8px_#ef4444]" />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-10">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={cn(
                "relative text-sm font-medium uppercase tracking-widest transition-colors duration-300 hover:text-white",
                location.pathname === link.path ? "text-white" : "text-white/60"
              )}
            >
              {link.name}
              {location.pathname === link.path && (
                <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#fbbf24] rounded-full shadow-[0_0_10px_#fbbf24]" />
              )}
            </Link>
          ))}
          
          {/* Action Button - Cinematic Style */}
          <Link
            to="/contact"
            className="px-6 py-2 bg-white/5 border border-white/20 hover:border-[#ef4444]/50 hover:bg-[#ef4444]/10 transition-all duration-300 rounded-sm text-[10px] uppercase tracking-[0.2em] text-white backdrop-blur-sm"
          >
            Enter Sanctuary
          </Link>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative z-[110] md:hidden w-10 h-10 flex flex-col items-center justify-center gap-1.5 focus:outline-none group"
          aria-label="Toggle Menu"
        >
          <span 
            className={cn(
              "w-6 h-[1px] bg-white transition-all duration-300 ease-out",
              isOpen ? "rotate-45 translate-y-[7px] bg-[#ef4444]" : ""
            )} 
          />
          <span 
            className={cn(
              "w-6 h-[1px] bg-white transition-all duration-300 ease-out",
              isOpen ? "opacity-0 scale-x-0" : ""
            )} 
          />
          <span 
            className={cn(
              "w-6 h-[1px] bg-white transition-all duration-300 ease-out",
              isOpen ? "-rotate-45 -translate-y-[7px] bg-[#ef4444]" : ""
            )} 
          />
        </button>
      </div>

      {/* Mobile Fullscreen Overlay */}
      <div 
        className={cn(
          "fixed inset-0 bg-black/95 backdrop-blur-2xl z-[105] flex flex-col items-center justify-center transition-all duration-700 ease-[cubic-bezier(0.85,0,0.15,1)]",
          isOpen ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
        )}
      >
        <div className="flex flex-col items-center space-y-8">
          {navLinks.map((link, i) => (
            <Link
              key={link.path}
              to={link.path}
              style={{ transitionDelay: `${i * 100}ms` }}
              className={cn(
                "text-3xl font-light uppercase tracking-[0.4em] transition-all duration-500 hover:tracking-[0.6em]",
                isOpen ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0",
                location.pathname === link.path ? "text-[#ef4444]" : "text-white"
              )}
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Decorative Background Element for Mobile Menu */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] bg-[#ef4444]/5 rounded-full blur-[120px] pointer-events-none -z-10" />
      </div>
    </nav>
  );
};

export default NavBar3D;