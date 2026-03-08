import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { cn } from "@/lib/utils";

/**
 * ErrorBoundary Class Component
 * Wraps the footer to ensure production stability as per architectural requirements.
 */
class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Footer3D Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <footer className="bg-black py-10 text-center text-white/50">
          <p>Experience the Arboretum below.</p>
        </footer>
      );
    }
    return this.props.children;
  }
}

/**
 * Footer3D Component
 * A dark, cinematic footer built with pure HTML/CSS.
 * Implements the "Fiery-Dark" theme for Aethelgard's Arboretum.
 */
export const Footer3D = () => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    {
      name: 'X',
      href: '#',
      path: "M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932L18.901 1.153zM17.61 20.644h2.039L6.486 3.24H4.298l13.312 17.404z"
    },
    {
      name: 'GitHub',
      href: '#',
      path: "M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
    },
    {
      name: 'LinkedIn',
      href: '#',
      path: "M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"
    },
    {
      name: 'Instagram',
      href: '#',
      path: "M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.332 3.608 1.308.975.975 1.245 2.242 1.308 3.608.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.063 1.366-.333 2.633-1.308 3.608-.975.975-2.242 1.245-3.608 1.308-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.063-2.633-.333-3.608-1.308-.975-.975-1.245-2.242-1.308-3.608-.058-1.266-.07-1.646-.07-4.85s.012-3.584.07-4.85c.062-1.366.332-2.633 1.308-3.608.975-.975 2.242-1.245 3.608-1.308 1.266-.058 1.646-.07 4.85-.07zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948s.014 3.667.072 4.947c.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072s3.667-.014 4.947-.072c4.358-.2 6.78-2.618 6.98-6.98.058-1.28.072-1.689.072-4.948s-.014-3.667-.072-4.947c-.2-4.358-2.618-6.78-6.98-6.98-1.28-.058-1.689-.072-4.948-.072zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.162 6.162 6.162 6.162-2.759 6.162-6.162-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.791-4-4s1.791-4 4-4 4 1.791 4 4-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"
    }
  ];

  return (
    <ErrorBoundary>
      <footer className="relative w-full bg-[#050505] text-white pt-24 pb-12 px-6 overflow-hidden border-t border-white/5 font-sans">
        {/* Top Gradient Accent Line */}
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#fbbf24] to-transparent opacity-50" />

        {/* Decorative Blur Accents */}
        <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-[#ef4444] blur-[120px] opacity-10 pointer-events-none" />
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-[#f97316] blur-[120px] opacity-10 pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
            
            {/* Column 1: Brand & Description */}
            <div className="flex flex-col space-y-6">
              <h2 className="text-2xl font-bold tracking-tighter uppercase italic text-transparent bg-clip-text bg-gradient-to-br from-[#ef4444] via-[#f97316] to-[#fbbf24]">
                Aethelgard
              </h2>
              <p className="text-sm text-white/60 leading-relaxed max-w-xs">
                A digital sanctuary where nature, sustainability, and personal growth converge. 
                Cultivating connection through immersive storytelling and serene 3D experiences.
              </p>
            </div>

            {/* Column 2: Quick Links */}
            <div className="flex flex-col space-y-4">
              <h3 className="text-xs uppercase tracking-[0.2em] text-[#fbbf24] font-semibold">Navigation</h3>
              <nav className="flex flex-col space-y-2">
                {['Home', 'Articles', 'About', 'Contact'].map((item) => (
                  <Link 
                    key={item} 
                    to={item === 'Home' ? '/' : `/${item.toLowerCase()}`}
                    className="text-sm text-white/40 hover:text-white hover:translate-x-1 transition-all duration-300 ease-out"
                  >
                    {item}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Column 3: Contact Info */}
            <div className="flex flex-col space-y-4">
              <h3 className="text-xs uppercase tracking-[0.2em] text-[#fbbf24] font-semibold">Connect</h3>
              <div className="space-y-2">
                <p className="text-sm text-white/40">hello@aethelgard.com</p>
                <p className="text-sm text-white/40">+1 (123) 456-7890</p>
                <p className="text-sm text-white/40 italic">123 Evergreen Lane, Nature City</p>
              </div>
            </div>

            {/* Column 4: Social Icons */}
            <div className="flex flex-col space-y-6">
              <h3 className="text-xs uppercase tracking-[0.2em] text-[#fbbf24] font-semibold">Follow</h3>
              <div className="flex items-center gap-5">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    aria-label={social.name}
                    className="group relative flex items-center justify-center"
                  >
                    <div className="absolute inset-0 bg-white/5 rounded-full scale-0 group-hover:scale-150 transition-transform duration-500 opacity-0 group-hover:opacity-100" />
                    <svg 
                      viewBox="0 0 24 24" 
                      className="w-5 h-5 fill-white/40 group-hover:fill-[#fbbf24] transition-colors duration-300"
                    >
                      <path d={social.path} />
                    </svg>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Copyright Bar */}
          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-[10px] uppercase tracking-[0.3em] text-white/20">
              © {currentYear} Aethelgard's Arboretum. All Rights Reserved.
            </p>
            <div className="flex gap-6">
              <Link to="/privacy" className="text-[10px] uppercase tracking-[0.2em] text-white/20 hover:text-white/50 transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-[10px] uppercase tracking-[0.2em] text-white/20 hover:text-white/50 transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </ErrorBoundary>
  );
};

export default Footer3D;