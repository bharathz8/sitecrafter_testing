import React, { useEffect, useState } from 'react';
import { useProgress } from '@react-three/drei';

/**
 * LoadingScreen3D
 * A cinematic, production-ready HTML/CSS overlay for R3F experiences.
 * Tracks progress via @react-three/drei's useProgress and executes 
 * a high-end fade-out transition.
 */
export const LoadingScreen3D = ({ children }: { children?: React.ReactNode }) => {
  const { progress, active } = useProgress();
  const [isFinished, setIsFinished] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // We wait for progress to hit 100 and active to be false
    if (progress >= 100 && !active) {
      const timer = setTimeout(() => {
        setIsFinished(true);
      }, 500); // Small buffer for visual smoothness

      const removeTimer = setTimeout(() => {
        setIsVisible(false);
      }, 1500); // Match this with the CSS transition duration

      return () => {
        clearTimeout(timer);
        clearTimeout(removeTimer);
      };
    }
  }, [progress, active]);

  return (
    <>
      {children}
      {isVisible && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            backgroundColor: '#000000',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: isFinished ? 0 : 1,
            pointerEvents: isFinished ? 'none' : 'all',
            transition: 'opacity 1s cubic-bezier(0.4, 0, 0.2, 1)',
            overflow: 'hidden',
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        >
          {/* Custom CSS Keyframes */}
          <style>
            {`
              @keyframes arboretum-pulse {
                0%, 100% { opacity: 0.4; transform: scale(1); }
                50% { opacity: 0.8; transform: scale(1.05); }
              }
              @keyframes arboretum-glow {
                0%, 100% { filter: blur(40px) brightness(1); }
                50% { filter: blur(60px) brightness(1.3); }
              }
              @keyframes arboretum-bar-shimmer {
                0% { background-position: -200% 0; }
                100% { background-position: 200% 0; }
              }
              @keyframes arboretum-corner-in {
                from { opacity: 0; transform: scale(1.2); }
                to { opacity: 1; transform: scale(1); }
              }
            `}
          </style>

          {/* Cinematic Ambient Glow */}
          <div
            style={{
              position: 'absolute',
              width: '60vw',
              height: '60vw',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(239, 68, 68, 0.15) 0%, rgba(249, 115, 22, 0.05) 50%, transparent 100%)',
              filter: 'blur(40px)',
              animation: 'arboretum-glow 8s ease-in-out infinite',
              zIndex: -1,
            }}
          />

          {/* Corner Accents */}
          <div style={{ position: 'absolute', top: '40px', left: '40px', width: '100px', height: '100px', borderTop: '1px solid rgba(251, 191, 36, 0.3)', borderLeft: '1px solid rgba(251, 191, 36, 0.3)', animation: 'arboretum-corner-in 2s ease-out forwards' }} />
          <div style={{ position: 'absolute', top: '40px', right: '40px', width: '100px', height: '100px', borderTop: '1px solid rgba(251, 191, 36, 0.3)', borderRight: '1px solid rgba(251, 191, 36, 0.3)', animation: 'arboretum-corner-in 2s ease-out forwards' }} />
          <div style={{ position: 'absolute', bottom: '40px', left: '40px', width: '100px', height: '100px', borderBottom: '1px solid rgba(251, 191, 36, 0.3)', borderLeft: '1px solid rgba(251, 191, 36, 0.3)', animation: 'arboretum-corner-in 2s ease-out forwards' }} />
          <div style={{ position: 'absolute', bottom: '40px', right: '40px', width: '100px', height: '100px', borderBottom: '1px solid rgba(251, 191, 36, 0.3)', borderRight: '1px solid rgba(251, 191, 36, 0.3)', animation: 'arboretum-corner-in 2s ease-out forwards' }} />

          {/* Main Content */}
          <div style={{ textAlign: 'center', zIndex: 10 }}>
            <h1
              style={{
                fontSize: 'clamp(2rem, 8vw, 4rem)',
                fontWeight: 900,
                letterSpacing: '0.4em',
                color: '#ffffff',
                margin: 0,
                padding: 0,
                textTransform: 'uppercase',
                background: 'linear-gradient(to right, #ef4444, #f97316, #fbbf24)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '0 0 30px rgba(239, 68, 68, 0.3)',
              }}
            >
              Aethelgard
            </h1>
            <p
              style={{
                fontSize: '0.75rem',
                letterSpacing: '0.6em',
                color: 'rgba(255, 255, 255, 0.5)',
                marginTop: '1.5rem',
                textTransform: 'uppercase',
                animation: 'arboretum-pulse 3s ease-in-out infinite',
              }}
            >
              Sage Serenity Experience
            </p>

            {/* Progress Container */}
            <div
              style={{
                marginTop: '4rem',
                width: '240px',
                height: '2px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '4px',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Progress Bar Fill */}
              <div
                style={{
                  height: '100%',
                  width: `${progress}%`,
                  background: 'linear-gradient(90deg, #ef4444, #f97316, #fbbf24)',
                  transition: 'width 0.4s cubic-bezier(0.1, 0.5, 0.5, 1)',
                  boxShadow: '0 0 15px rgba(249, 115, 22, 0.8)',
                }}
              />
              
              {/* Shimmer Overlay */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                  backgroundSize: '200% 100%',
                  animation: 'arboretum-bar-shimmer 2s infinite linear',
                }}
              />
            </div>

            {/* Progress Percentage */}
            <div
              style={{
                marginTop: '1rem',
                fontSize: '0.7rem',
                fontFamily: 'monospace',
                color: '#fbbf24',
                opacity: 0.8,
                letterSpacing: '0.1em',
              }}
            >
              {Math.round(progress)}%
            </div>
          </div>

          {/* Bottom Narrative Accent */}
          <div
            style={{
              position: 'absolute',
              bottom: '80px',
              width: '100%',
              display: 'flex',
              justifyContent: 'center',
              pointerEvents: 'none',
            }}
          >
            <div
              style={{
                width: '1px',
                height: isFinished ? '0px' : '60px',
                backgroundColor: 'rgba(251, 191, 36, 0.4)',
                transition: 'height 1s ease-in-out',
              }}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default LoadingScreen3D;