import React, { Component, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { cn } from "@/lib/utils";

/**
 * ErrorBoundary Class Component
 * Wraps the footer to prevent UI crashes in production.
 */
class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Footer Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <footer className="bg-black py-10 text-center border-t border-white/10">
          <p className="text-white/50 text-sm tracking-widest uppercase">System Offline</p>
        </footer>
      );
    }
    return this.props.children;
  }
}

/**
 * Footer3D Component
 * A dark, cinematic footer with glassmorphism and neon accents.
 * Pure HTML/CSS for performance and accessibility.
 */
export const Footer3D = () => {
  const currentYear = new Date().getFullYear();

  return (
    <ErrorBoundary>
      <footer className="relative w-full bg-black text-white py-24 px-6 md:px-12 lg:px-24 overflow-hidden border-t border-white/10">
        
        {/* Top Gradient Accent Line */}
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#fda4af] to-transparent opacity-50" />

        {/* Decorative Background Blur Circles */}
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-[#f472b6] blur-[120px] opacity-[0.07] pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-[#fb7185] blur-[120px] opacity-[0.07] pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 lg:gap-8">
            
            {/* Column 1: Brand & Narrative */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold tracking-tighter font-heading bg-clip-text text-transparent bg-gradient-to-br from-white to-white/50">
                NEON<span className="text-[#f472b6]">CYBER</span>
              </h2>
              <p className="text-sm leading-relaxed text-white/40 font-body max-w-xs">
                Crafting the next generation of digital expeditions. Where high-fidelity 3D meets the raw energy of the cyberpunk frontier.
              </p>
            </div>

            {/* Column 2: Navigation */}
            <div className="space-y-6">
              <h3 className="text-[10px] uppercase tracking-[0.4em] text-white/20 font-heading">Navigation</h3>
              <ul className="space-y-4 font-body text-sm">
                {['Home', 'About', 'Showcase', 'Experience', 'Contact'].map((item) => (
                  <li key={item}>
                    <Link 
                      to={`/${item.toLowerCase() === 'home' ? '' : item.toLowerCase()}`}
                      className="text-white/60 hover:text-[#f472b6] transition-colors duration-300"
                    >
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3: Transmission (Contact) */}
            <div className="space-y-6">
              <h3 className="text-[10px] uppercase tracking-[0.4em] text-white/20 font-heading">Transmission</h3>
              <ul className="space-y-4 font-body text-sm text-white/60">
                <li className="hover:text-white transition-colors cursor-default">info@neoncyber.tech</li>
                <li className="hover:text-white transition-colors cursor-default">+1 (555) NEON-EXP</li>
                <li className="leading-relaxed">
                  Cyber District 01<br />
                  Neo-Tokyo, VN 2077
                </li>
              </ul>
            </div>

            {/* Column 4: Social Pulse */}
            <div className="space-y-6">
              <h3 className="text-[10px] uppercase tracking-[0.4em] text-white/20 font-heading">Social Pulse</h3>
              <div className="flex gap-5">
                {/* X / Twitter */}
                <a href="#" className="group p-2 -m-2" aria-label="X (Twitter)">
                  <svg className="w-5 h-5 fill-white/40 group-hover:fill-[#f472b6] transition-colors duration-300" viewBox="0 0 24 24">
                    <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932L18.901 1.153zM17.61 20.644h2.039L6.486 3.24H4.298l13.312 17.404z" />
                  </svg>
                </a>
                {/* GitHub */}
                <a href="#" className="group p-2 -m-2" aria-label="GitHub">
                  <svg className="w-5 h-5 fill-white/40 group-hover:fill-[#f472b6] transition-colors duration-300" viewBox="0 0 24 24">
                    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                  </svg>
                </a>
                {/* LinkedIn */}
                <a href="#" className="group p-2 -m-2" aria-label="LinkedIn">
                  <svg className="w-5 h-5 fill-white/40 group-hover:fill-[#f472b6] transition-colors duration-300" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                </a>
                {/* Instagram */}
                <a href="#" className="group p-2 -m-2" aria-label="Instagram">
                  <svg className="w-5 h-5 fill-white/40 group-hover:fill-[#f472b6] transition-colors duration-300" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
              </div>
            </div>

          </div>

          {/* Bottom Copyright Bar */}
          <div className="mt-24 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-[10px] uppercase tracking-[0.3em] text-white/30 font-heading">
              &copy; {currentYear} NEON CYBER EXPEDITION. ALL RIGHTS RESERVED.
            </p>
            <div className="flex gap-8 text-[10px] uppercase tracking-[0.2em] text-white/20">
              <Link to="/privacy" className="hover:text-white transition-colors">Privacy Protocol</Link>
              <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>
    </ErrorBoundary>
  );
};

export default Footer3D;