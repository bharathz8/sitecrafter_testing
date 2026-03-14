import React, { useEffect, useState } from 'react';
import { useProgress } from '@react-three/drei';

/**
 * LoadingScreen3D Component
 * A cinematic, HTML-based loading overlay for R3F experiences.
 * Features: Progress tracking, CSS animations, and Cyberpunk aesthetics.
 */
export const LoadingScreen3D = ({ children }: { children?: React.ReactNode }) => {
  const { progress, active } = useProgress();
  const [isVisible, setIsVisible] = useState(true);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    if (progress >= 100 && !active) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        // Remove from DOM after transition
        setTimeout(() => setIsFinished(true), 1000);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [progress, active]);

  if (isFinished) return <>{children}</>;

  return (
    <>
      <style>
        {`
          @keyframes scanline {
            0% { transform: translateY(-100%); }
            100% { transform: translateY(100%); }
          }
          @keyframes pulse-glow {
            0%, 100% { opacity: 0.3; filter: blur(40px); }
            50% { opacity: 0.6; filter: blur(60px); }
          }
          @keyframes text-flicker {
            0% { opacity: 0.8; }
            5% { opacity: 0.1; }
            10% { opacity: 1; }
            15% { opacity: 0.4; }
            25% { opacity: 1; }
            100% { opacity: 1; }
          }
          @keyframes corner-expand {
            0% { width: 0%; height: 0%; }
            100% { width: 100px; height: 100px; }
          }
          .neon-text {
            text-shadow: 0 0 10px #f472b6, 0 0 20px #f472b6, 0 0 40px #fb7185;
            font-family: 'Bricolage Grotesque', sans-serif;
          }
          .cyber-grid {
            background-image: linear-gradient(rgba(244, 114, 182, 0.05) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(244, 114, 182, 0.05) 1px, transparent 1px);
            background-size: 50px 50px;
          }
        `}
      </style>

      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          backgroundColor: '#000',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'opacity 0.8s ease-in-out',
          opacity: isVisible ? 1 : 0,
          pointerEvents: isVisible ? 'all' : 'none',
          overflow: 'hidden',
        }}
      >
        {/* Background Grid and Glows */}
        <div className="cyber-grid" style={{ position: 'absolute', inset: 0, opacity: 0.4 }} />
        
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '60vw',
          height: '60vh',
          background: 'radial-gradient(circle, rgba(244, 114, 182, 0.15) 0%, transparent 70%)',
          animation: 'pulse-glow 4s infinite ease-in-out',
        }} />

        {/* Cinematic Corner Accents */}
        {[
          { top: 20, left: 20, borderTop: '2px solid #f472b6', borderLeft: '2px solid #f472b6' },
          { top: 20, right: 20, borderTop: '2px solid #f472b6', borderRight: '2px solid #f472b6' },
          { bottom: 20, left: 20, borderBottom: '2px solid #f472b6', borderLeft: '2px solid #f472b6' },
          { bottom: 20, right: 20, borderBottom: '2px solid #f472b6', borderRight: '2px solid #f472b6' },
        ].map((style, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              width: '40px',
              height: '40px',
              ...style,
              opacity: 0.6,
            }}
          />
        ))}

        {/* Scanline Effect */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to bottom, transparent 50%, rgba(244, 114, 182, 0.02) 50%)',
          backgroundSize: '100% 4px',
          pointerEvents: 'none',
        }} />

        {/* Branding Content */}
        <div style={{ textAlign: 'center', zIndex: 10, position: 'relative' }}>
          <h1 className="neon-text" style={{
            fontSize: 'clamp(2rem, 8vw, 4rem)',
            fontWeight: 800,
            color: '#fff',
            letterSpacing: '0.2em',
            marginBottom: '0.5rem',
            animation: 'text-flicker 3s infinite',
          }}>
            NEON TECH
          </h1>
          <p style={{
            fontFamily: 'Be Vietnam Pro, sans-serif',
            color: '#fda4af',
            fontSize: '0.875rem',
            letterSpacing: '0.4em',
            textTransform: 'uppercase',
            marginBottom: '3rem',
            opacity: 0.8,
          }}>
            Initializing Cybernetic Core
          </p>

          {/* Progress Container */}
          <div style={{
            width: '280px',
            height: '4px',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '2px',
            position: 'relative',
            overflow: 'hidden',
            margin: '0 auto',
            boxShadow: '0 0 15px rgba(244, 114, 182, 0.2)',
          }}>
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                height: '100%',
                width: `${progress}%`,
                backgroundColor: '#f472b6',
                boxShadow: '0 0 10px #f472b6',
                transition: 'width 0.4s cubic-bezier(0.1, 0.5, 0.5, 1)',
              }}
            />
          </div>

          <div style={{
            marginTop: '1rem',
            fontFamily: 'monospace',
            color: '#f472b6',
            fontSize: '0.75rem',
            opacity: 0.7,
          }}>
            {Math.round(progress)}% LOADED
          </div>
        </div>

        {/* Bottom Status Bar */}
        <div style={{
          position: 'absolute',
          bottom: '40px',
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          gap: '2rem',
          color: 'rgba(255, 255, 255, 0.3)',
          fontSize: '0.6rem',
          fontFamily: 'monospace',
          textTransform: 'uppercase',
        }}>
          <span>System: Active</span>
          <span>Neural Link: Stable</span>
          <span>Assets: {progress < 100 ? 'Syncing' : 'Ready'}</span>
        </div>
      </div>
      {children}
    </>
  );
};

export default LoadingScreen3D;