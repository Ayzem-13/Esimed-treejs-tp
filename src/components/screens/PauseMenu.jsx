import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Play, Home, X } from 'lucide-react';

export function PauseMenu({ isOpen, onClose, onQuit }) {
  const menuRef = useRef(null);
  const overlayRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown, { capture: true });
    return () => window.removeEventListener('keydown', handleKeyDown, { capture: true });
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen && menuRef.current && overlayRef.current) {
      gsap.fromTo(
        overlayRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.3, ease: 'power2.out' }
      );
      gsap.fromTo(
        menuRef.current,
        { x: '100%' },
        { x: '0%', duration: 0.4, ease: 'power3.out' }
      );
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <>
      <div
        ref={overlayRef}
        className="fixed inset-0 z-40"
        style={{
          background: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(8px)'
        }}
        onClick={handleOverlayClick}
      />

      <div
        ref={menuRef}
        className="fixed top-0 right-0 h-screen w-96 shadow-2xl z-50 flex flex-col"
        style={{
          background: '#242424'
        }}
      >
        {/* Animated background circles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
   
        </div>

        {/* Header */}
        <div className="relative p-6 border-b border-white/10">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-3xl font-black text-white tracking-tight">PAUSE</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg transition-all duration-200"
              style={{
                background: 'rgba(255, 255, 255, 0.05)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
              }}
              aria-label="Fermer"
            >
              <X className="w-5 h-5 text-white/70" />
            </button>
          </div>
          <p className="text-sm text-white/60 font-light">Le jeu est en pause</p>
        </div>

        {/* Content */}
        <div className="relative flex-1 p-6 flex flex-col justify-center space-y-3">
          <button
            onClick={onClose}
            className="relative px-4 py-3 rounded-lg flex items-center gap-3 transition-all duration-200 group"
            style={{
              background: '#1a77cb',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#1e8ae0'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#1a77cb'
            }}
          >
            <Play className="w-4 h-4 text-white" />
            <span className="text-white font-medium text-sm flex-1 text-left">Reprendre</span>
          </button>

          <button
            onClick={onQuit}
            className="relative px-4 py-3 rounded-lg flex items-center gap-3 transition-all duration-200 group"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
            }}
          >
            <Home className="w-4 h-4 text-white/70" />
            <span className="text-white/90 font-medium text-sm flex-1 text-left">Menu Principal</span>
          </button>
        </div>

        {/* Footer */}
        <div className="relative p-6 border-t border-white/10">
          <div 
            className="rounded-lg p-4"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}
          >
            <p className="text-xs text-white/60 text-center font-light">
              Appuyez sur <kbd className="px-2 py-1 mx-1 rounded text-xs font-mono" style={{ background: 'rgba(255, 255, 255, 0.1)', color: '#1a77cb' }}>ESC</kbd> pour reprendre
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
