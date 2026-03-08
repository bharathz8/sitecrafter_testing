import React, { Component, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-10 text-white bg-black font-sans">
          <h2 className="text-2xl font-bold">Something went wrong.</h2>
        </div>
      );
    }
    return this.props.children;
  }
}

interface FooterProps {
  className?: string;
}

export const Footer3D = ({ className = "" }: FooterProps) => {
  const currentYear = new Date().getFullYear();

  const socialIcons = [
    {
      name: "X",
      path: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.25 2.25h6.634l4.717 6.237L18.244 2.25zM16.083 19.77h1.833L7.084 4.126H5.117L16.083 19.77z",
      href: "#"
    },
    {
      name: "GitHub",
      path: "M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z",
      href: "#"
    },
    {
      name: "LinkedIn",
      path: "M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z",
      href: "#"
    },
    {
      name: "Instagram",
      path: "M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8A3.6 3.6 0 0 0 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6A3.6 3.6 0 0 0 16.4 4H7.6m5.4 3c3.3 0 6 2.7 6 6s-2.7 6-6 6s-6-2.7-6-6s2.7-6 6-6m0 2a4 4 0 0 0-4 4a4 4 0 0 0 4 4a4 4 0 0 0 4-4a4 4 0 0 0-4-4m4.9-3.1a1.1 1.1 0 1 1-2.2 0a1.1 1.1 0 0 1 2.2 0z",
      href: "#"
    }
  ];

  return (
    <ErrorBoundary>
      <footer className={`relative bg-black text-white py-20 px-6 md:px-12 border-t border-white/10 overflow-hidden font-sans ${className}`}>
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#f472b6] to-transparent opacity-50" />
        
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 relative z-10">
          <div className="space-y-6">
            <h3 className="text-2xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-[#f472b6] to-[#fda4af]">
              COSMIC PURPLE FARM
            </h3>
            <p className="text-white/60 leading-relaxed text-sm max-w-xs">
              Cultivating the ethereal. We merge advanced bio-technology with cosmic aesthetics to provide the galaxy's most vibrant flora.
            </p>
          </div>

          <div className="space-y-6">
            <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">Quick Navigation</h4>
            <ul className="space-y-4">
              {['Home', 'Farm Tour', 'Products', 'Our Story'].map((link) => (
                <li key={link}>
                  <a href="#" className="text-white/70 hover:text-[#f472b6] transition-colors duration-300 text-sm">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">Contact Us</h4>
            <ul className="space-y-4 text-sm text-white/70">
              <li className="flex flex-col">
                <span className="text-white/40 text-[10px] uppercase tracking-widest mb-1">Inquiries</span>
                <a href="mailto:hello@cosmicpurple.farm" className="hover:text-[#f472b6] transition-colors">hello@cosmicpurple.farm</a>
              </li>
              <li className="flex flex-col">
                <span className="text-white/40 text-[10px] uppercase tracking-widest mb-1">Coordinates</span>
                <span>Sector 7G, Andromeda Basin</span>
              </li>
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">Follow The Orbit</h4>
            <div className="flex gap-4">
              {socialIcons.map((icon) => (
                <a
                  key={icon.name}
                  href={icon.href}
                  className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:border-[#f472b6]/50 hover:bg-[#f472b6]/5 transition-all duration-500 group"
                  aria-label={icon.name}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-5 h-5 text-white/60 group-hover:text-[#f472b6] transition-colors"
                  >
                    <path d={icon.path} />
                  </svg>
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] uppercase tracking-[0.3em] text-white/30">
          <p>© {currentYear} Cosmic Purple Farm. All rights reserved.</p>
          <div className="flex gap-8">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>

        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-[#f472b6] rounded-full blur-[120px] opacity-10 pointer-events-none" />
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#fb7185] rounded-full blur-[120px] opacity-10 pointer-events-none" />
      </footer>
    </ErrorBoundary>
  );
};

export default Footer3D;