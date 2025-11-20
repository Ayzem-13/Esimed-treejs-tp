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
      e.preventDefault();
      e.stopPropagation();
    }
  };

  return (
    <>
      <div
        ref={overlayRef}
        className="fixed inset-0 bg-black/40 backdrop-blur-md z-40"
        onClick={handleOverlayClick}
        onMouseDown={handleOverlayClick}
      />

      <div
        ref={menuRef}
        className="fixed top-0 right-0 h-screen w-96 bg-gradient-to-br from-gray-50 via-gray-100 to-blue-50 shadow-2xl z-50 flex flex-col"
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-0 w-60 h-60 bg-blue-200/30 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-0 w-60 h-60 bg-gray-300/20 rounded-full blur-3xl"></div>
        </div>

        <div className="absolute inset-0 opacity-5 pointer-events-none" style={{
          backgroundImage: 'linear-gradient(0deg, #2c3e50 1px, transparent 1px), linear-gradient(90deg, #2c3e50 1px, transparent 1px)',
          backgroundSize: '30px 30px'
        }}></div>

        {/* Header */}
        <div className="relative p-6 border-b border-gray-300/50">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">PAUSE</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/60 transition-all duration-200"
              aria-label="Fermer"
            >
              <X className="w-5 h-5 text-gray-700" />
            </button>
          </div>
          <p className="text-sm text-gray-600 font-light">Le jeu est en pause</p>
        </div>

        {/* Content */}
        <div className="relative flex-1 p-8 flex flex-col justify-center space-y-5">
          <button
            onClick={onClose}
            className="relative px-6 py-4 bg-white rounded-xl flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transition-all duration-300 group border border-blue-200 hover:border-blue-400"
          >
            <Play className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform" />
            <span className="text-gray-900 font-semibold text-base">Reprendre</span>
          </button>

          <button
            onClick={onQuit}
            className="relative px-6 py-4 bg-white rounded-xl flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transition-all duration-300 group border border-red-200 hover:border-red-400"
          >
            <Home className="w-5 h-5 text-red-600 group-hover:scale-110 transition-transform" />
            <span className="text-gray-900 font-semibold text-base">Menu Principal</span>
          </button>
        </div>

        {/* Footer */}
        <div className="relative p-6 border-t border-gray-300/50">
          <div className="bg-white/40 backdrop-blur-sm rounded-lg p-4 border border-white/60">
            <p className="text-xs text-gray-600 text-center font-light">
              Appuyez sur <kbd className="px-2 py-1 mx-1 bg-gray-200/60 text-gray-700 rounded text-xs font-mono">ESC</kbd> pour reprendre
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
