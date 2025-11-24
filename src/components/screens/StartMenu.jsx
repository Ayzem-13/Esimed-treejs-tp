import { useState, useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { Play, Pencil } from 'lucide-react'

export const StartMenu = ({ onStartCharacter, onStartEditor }) => {
  const [isOpen, setIsOpen] = useState(true)
  const containerRef = useRef(null)
  const contentRef = useRef(null)
  const cardRef = useRef(null)
  const titleRef = useRef(null)
  const buttonsRef = useRef(null)

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.8 }
      )
    }

    if (cardRef.current) {
      gsap.fromTo(
        cardRef.current,
        { opacity: 0, scale: 0.9, y: 30 },
        { opacity: 1, scale: 1, y: 0, duration: 0.8, ease: 'power3.out', delay: 0.2 }
      )
    }

    if (titleRef.current) {
      gsap.fromTo(
        titleRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', delay: 0.4 }
      )
    }

    if (buttonsRef.current) {
      gsap.fromTo(
        buttonsRef.current.children,
        { opacity: 0, x: -20 },
        { opacity: 1, x: 0, duration: 0.6, ease: 'power3.out', delay: 0.6, stagger: 0.1 }
      )
    }
  }, [])

  const handleModeSelection = (callback) => {
    gsap.to(cardRef.current, {
      opacity: 0,
      scale: 0.95,
      y: -20,
      duration: 0.4,
      ease: 'power3.in',
      onComplete: () => {
        gsap.to(containerRef.current, {
          opacity: 0,
          duration: 0.3,
          onComplete: () => {
            setIsOpen(false)
            if (callback) callback()
          }
        })
      }
    })
  }

  if (!isOpen) return null

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 overflow-hidden"
      style={{
        background: '#242424'
      }}
    >
      {/* Animated background circles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute top-10 right-20 w-96 h-96 rounded-full opacity-10"
          style={{
            background: 'radial-gradient(circle, #1a77cb 0%, transparent 70%)',
            animation: 'float 6s ease-in-out infinite'
          }}
        />
        <div 
          className="absolute bottom-20 left-10 w-[500px] h-[500px] rounded-full opacity-10"
          style={{
            background: 'radial-gradient(circle, #1a77cb 0%, transparent 70%)',
            animation: 'float 8s ease-in-out infinite reverse'
          }}
        />
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-5"
          style={{
            background: 'radial-gradient(circle, #1a77cb 0%, transparent 70%)',
            animation: 'pulse 4s ease-in-out infinite'
          }}
        />
      </div>

      {/* Content */}
      <div ref={contentRef} className="relative h-full flex flex-col items-center justify-center px-6">

        {/* Main Title */}
        <div className="max-w-3xl text-center mb-16">
          <div ref={titleRef}>
            <h1 className="text-7xl md:text-8xl font-black mb-6 tracking-tight text-white drop-shadow-lg">
              MicroVille
            </h1>
          </div>

          <div ref={cardRef}>
            <p className="text-xl md:text-2xl font-light tracking-wide mb-3 text-white/90">
              Explorez une ville moderne dynamique
            </p>
            <p className="text-sm md:text-base font-light text-white/70">
              Découvrez, construisez et interagissez avec l'environnement
            </p>
          </div>
        </div>

        {/* Mode Selection Buttons */}
        <div ref={buttonsRef} className="flex flex-col sm:flex-row items-center gap-5">
          <button
            onClick={() => handleModeSelection(onStartCharacter)}
            className="px-10 py-4 text-white font-semibold text-lg rounded-xl transition-all duration-300 hover:scale-105 hover:-translate-y-1 flex items-center gap-3 min-w-[200px] justify-center shadow-lg hover:shadow-xl"
            style={{
              background: '#1a77cb',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#1e8ae0'
              e.currentTarget.style.boxShadow = '0 0 30px rgba(26, 119, 203, 0.5)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#1a77cb'
              e.currentTarget.style.boxShadow = ''
            }}
          >
            <Play className="w-5 h-5" />
            Jouer
          </button>

          <button
            onClick={() => handleModeSelection(onStartEditor)}
            className="px-10 py-4 text-white font-semibold text-lg rounded-xl transition-all duration-300 hover:scale-105 hover:-translate-y-1 flex items-center gap-3 min-w-[200px] justify-center shadow-lg hover:shadow-xl"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.15)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
              e.currentTarget.style.borderColor = '#1a77cb'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)'
            }}
          >
            <Pencil className="w-5 h-5" />
            Éditer
          </button>
        </div>

        {/* Footer hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <p className="text-xs font-light tracking-wider uppercase text-white/50">
            Projet Three.js • ESIMED
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes pulse {
          0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.1; }
          50% { transform: translate(-50%, -50%) scale(1.1); opacity: 0.15; }
        }
      `}</style>
    </div>
  )
}
