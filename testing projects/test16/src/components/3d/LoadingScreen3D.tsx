import React, { Component, ReactNode, useEffect, useState } from 'react';
import { useProgress } from '@react-three/drei';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
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
        <div style={{ 
          width: '100%', 
          height: '100%', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          background: '#0a0a0a', 
          color: '#f472b6',
          fontFamily: 'system-ui, sans-serif'
        }}>
          <h1>Experience initialization failed. Please refresh.</h1>
        </div>
      );
    }
    return this.props.children;
  }
}

export const LoadingScreen3D = ({ children }: { children?: React.ReactNode }) => {
  const { progress, active } = useProgress();
  const [shown, setShown] = useState(true);

  useEffect(() => {
    if (!active && progress === 100) {
      const timeout = setTimeout(() => setShown(false), 800);
      return () => clearTimeout(timeout);
    }
  }, [progress, active]);

  const containerStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000000',
    zIndex: 9999,
    transition: 'opacity 1s ease-in-out, visibility 1s ease-in-out',
    opacity: shown ? 1 : 0,
    visibility: shown ? 'visible' : 'hidden',
    pointerEvents: shown ? 'all' : 'none',
  };

  const logoStyle: React.CSSProperties = {
    fontSize: 'clamp(2rem, 8vw, 4rem)',
    fontWeight: 900,
    color: '#f472b6',
    letterSpacing: '0.4em',
    textTransform: 'uppercase',
    fontFamily: '"Poppins", system-ui, sans-serif',
    marginBottom: '2rem',
    textAlign: 'center',
    textShadow: '0 0 20px rgba(244, 114, 182, 0.5)',
    animation: 'glitch 2s infinite linear alternate-reverse',
  };

  const progressWrapperStyle: React.CSSProperties = {
    width: '200px',
    height: '2px',
    background: 'rgba(255, 255, 255, 0.1)',
    position: 'relative',
    overflow: 'hidden',
  };

  const progressBarStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    width: `${progress}%`,
    background: 'linear-gradient(90deg, #f472b6, #fb7185)',
    boxShadow: '0 0 15px #f472b6',
    transition: 'width 0.4s ease-out',
  };

  const percentageStyle: React.CSSProperties = {
    marginTop: '1rem',
    fontSize: '0.75rem',
    color: '#fb7185',
    fontFamily: '"JetBrains Mono", monospace',
    letterSpacing: '0.2em',
  };

  const keyframes = `
    @keyframes glitch {
      0% { transform: translate(0); text-shadow: 2px 2px #fda4af; }
      20% { transform: translate(-2px, 2px); text-shadow: -2px -2px #f472b6; }
      40% { transform: translate(-2px, -2px); text-shadow: 2px -2px #fb7185; }
      60% { transform: translate(2px, 2px); text-shadow: -2px 2px #fda4af; }
      80% { transform: translate(2px, -2px); text-shadow: 2px 2px #f472b6; }
      100% { transform: translate(0); text-shadow: -2px -2px #fb7185; }
    }
  `;

  return (
    <ErrorBoundary>
      <style>{keyframes}</style>
      <div style={containerStyle}>
        <div style={logoStyle}>
          Cosmic<br />Purple
        </div>
        <div style={progressWrapperStyle}>
          <div style={progressBarStyle} />
        </div>
        <div style={percentageStyle}>
          {Math.round(progress)}% INITIALIZING HARVEST
        </div>
      </div>
      {children}
    </ErrorBoundary>
  );
};

export default LoadingScreen3D;