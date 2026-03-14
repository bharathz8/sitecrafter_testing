import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

/**
 * NavBar3D - A high-end, glassmorphism navigation component.
 * Part of the Neon Cyberpunk Expedition experience.
 * 
 * Features:
 * - Pure HTML/CSS architecture for performance and SEO.
 * - Animated CSS-only hamburger menu.
 * - Glassmorphic backdrop with border-glow effects.
 * - Responsive mobile overlay.
 * - Interactive hover states with neon drop-shadows.
 */
export const NavBar3D = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  // Handle scroll state for dynamic styling
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
    { name: 'About', path: '/about' },
    { name: 'Showcase', path: '/showcase' },
    { name: 'Experience', path: '/experience' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ease-in-out px-6 md:px-12',
        scrolled 
          ? 'h-16 bg-black/60 backdrop-blur-lg border-b border-white/10' 
          : 'h-24 bg-transparent border-b border-transparent'
      )}
    >
      <div className="max-w-7xl mx-auto h-full flex items-center justify-between">
        {/* BRAND LOGO */}
        <Link 
          to="/" 
          className="relative group flex items-center gap-2"
        >
          <span className="text-white font-bold text-xl tracking-[0.25em] uppercase font-['Bricolage_Grotesque'] transition-all duration-300 group-hover:text-[#f472b6] group-hover:drop-shadow-[0_0_10px_rgba(244,114,182,0.8)]">
            NEON<span className="text-[#f472b6]">CYBER</span>
          </span>
          {/* Subtle underline glow */}
          <div className="absolute -bottom-1 left-0 w-0 h-[2px] bg-[#f472b6] transition-all duration-500 group-hover:w-full shadow-[0_0_8px_#f472b6]" />
        </Link>

        {/* DESKTOP NAVIGATION */}
        <div className="hidden md:flex items-center space-x-10">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={cn(
                "relative text-sm font-medium tracking-widest uppercase transition-all duration-300 hover:text-[#f472b6] hover:drop-shadow-[0_0_8px_rgba(244,114,182,0.6)]",
                location.pathname === link.path ? "text-[#f472b6]" : "text-white/80"
              )}
            >
              {link.name}
              {location.pathname === link.path && (
                <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#f472b6] rounded-full shadow-[0_0_5px_#f472b6]" />
              )}
            </Link>
          ))}
          
          {/* CTA BUTTON */}
          <Link
            to="/experience"
            className="ml-4 px-6 py-2 bg-transparent border border-[#f472b6]/40 text-[#f472b6] text-xs font-bold tracking-[0.2em] uppercase rounded-full transition-all duration-300 hover:bg-[#f472b6] hover:text-black hover:shadow-[0_0_20px_rgba(244,114,182,0.4)]"
          >
            Launch
          </Link>
        </div>

        {/* MOBILE HAMBURGER TOGGLE */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden relative z-[110] w-10 h-10 flex flex-col justify-center items-center gap-1.5 group focus:outline-none"
          aria-label="Toggle Menu"
        >
          <span className={cn(
            "w-6 h-0.5 bg-white transition-all duration-300 ease-out origin-center",
            isOpen ? "rotate-45 translate-y-2 bg-[#f472b6]" : ""
          )} />
          <span className={cn(
            "w-6 h-0.5 bg-white transition-all duration-200 ease-out",
            isOpen ? "opacity-0" : "opacity-100"
          )} />
          <span className={cn(
            "w-6 h-0.5 bg-white transition-all duration-300 ease-out origin-center",
            isOpen ? "-rotate-45 -translate-y-2 bg-[#f472b6]" : ""
          )} />
        </button>
      </div>

      {/* MOBILE OVERLAY MENU */}
      <div className={cn(
        "fixed inset-0 z-[105] bg-black/95 backdrop-blur-2xl flex flex-col items-center justify-center transition-all duration-700 ease-in-out md:hidden",
        isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none translate-y-[-20px]"
      )}>
        <div className="flex flex-col items-center space-y-8">
          {navLinks.map((link, idx) => (
            <Link
              key={link.path}
              to={link.path}
              className={cn(
                "text-3xl font-bold tracking-[0.15em] uppercase transition-all duration-300",
                location.pathname === link.path ? "text-[#f472b6] drop-shadow-[0_0_12px_rgba(244,114,182,0.8)]" : "text-white hover:text-[#f472b6]"
              )}
              style={{ 
                transitionDelay: isOpen ? `${idx * 100}ms` : '0ms',
                transform: isOpen ? 'translateY(0)' : 'translateY(20px)',
                opacity: isOpen ? 1 : 0
              }}
            >
              {link.name}
            </Link>
          ))}
          
          <div 
            className="pt-12 transition-all duration-700 delay-500"
            style={{ opacity: isOpen ? 1 : 0 }}
          >
             <p className="text-white/40 text-[10px] tracking-[0.4em] uppercase">
               System Online // v2.0.4
             </p>
          </div>
        </div>

        {/* Decorative background elements for mobile menu */}
        <div className="absolute top-1/4 -left-20 w-64 h-64 bg-[#f472b6]/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-1/4 -right-20 w-64 h-64 bg-[#fb7185]/10 blur-[120px] rounded-full pointer-events-none" />
      </div>
    </nav>
  );
};

export default NavBar3D;