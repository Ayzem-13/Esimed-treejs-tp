import { useState, useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { Play, Pencil } from 'lucide-react'

export const StartMenu = ({ onStartCharacter, onStartEditor }) => {
  const [isOpen, setIsOpen] = useState(true)
  const containerRef = useRef(null)
  const contentRef = useRef(null)
  const titleRef = useRef(null)
  const subtitleRef = useRef(null)
  const buttonsRef = useRef(null)
  const featuresRef = useRef(null)

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.6 }
      )
    }

    if (titleRef.current) {
      gsap.fromTo(
        titleRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', delay: 0.2 }
      )
    }

    if (subtitleRef.current) {
      gsap.fromTo(
        subtitleRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', delay: 0.35 }
      )
    }

    if (buttonsRef.current) {
      gsap.fromTo(
        buttonsRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', delay: 0.5 }
      )
    }

    if (featuresRef.current) {
      gsap.fromTo(
        featuresRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', delay: 0.65 }
      )
    }
  }, [])

  const handleModeSelection = (callback) => {
    gsap.to(contentRef.current, {
      opacity: 0,
      y: -50,
      duration: 0.5,
      ease: 'power3.in',
      onComplete: () => {
        gsap.to(containerRef.current, {
          opacity: 0,
          duration: 0.4,
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
      className="fixed inset-0 z-50 overflow-hidden bg-linear-to-br from-slate-50 via-slate-100 to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800"
    >
      {/* Décoration background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-96 h-96 rounded-full blur-3xl bg-blue-500/20 dark:bg-blue-500/15" />
        <div className="absolute bottom-10 left-10 w-80 h-80 rounded-full blur-3xl bg-violet-500/15" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-3xl bg-sky-500/10 dark:bg-sky-500/5" />
      </div>

      {/* Grid pattern subtle */}
      <div
        className="absolute inset-0 pointer-events-none opacity-100"
        style={{
          backgroundImage: 'linear-gradient(rgba(100,116,139,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(100,116,139,0.03) 1px, transparent 1px)',
          backgroundSize: '60px 60px'
        }}
      />

      {/* Content */}
      <div ref={contentRef} className="relative h-full flex flex-col items-center justify-center px-6">

        {/* Main Title */}
        <div className="max-w-3xl text-center mb-16">
          <div ref={titleRef}>
            <h1 className="text-7xl md:text-8xl font-black mb-6 tracking-tight text-slate-800 dark:text-slate-100 drop-shadow-sm">
              MicroVille
            </h1>
          </div>

          <div ref={subtitleRef}>
            <p className="text-xl md:text-2xl font-light tracking-wide mb-3 text-slate-600 dark:text-slate-300">
              Explorez une ville moderne dynamique
            </p>
            <p className="text-sm md:text-base font-light text-slate-500 dark:text-slate-400">
              Découvrez, construisez et interagissez avec l'environnement
            </p>
          </div>
        </div>

        {/* Mode Selection Buttons */}
        <div ref={buttonsRef} className="flex flex-col sm:flex-row items-center gap-5">
          <button
            onClick={() => handleModeSelection(onStartCharacter)}
            className="px-10 py-4 text-white font-semibold text-lg rounded-xl transition-all duration-300 hover:scale-105 hover:-translate-y-1 flex items-center gap-3 min-w-[200px] justify-center bg-linear-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/40 hover:shadow-xl hover:shadow-blue-500/50"
          >
            <Play className="w-5 h-5" />
            Jouer
          </button>

          <button
            onClick={() => handleModeSelection(onStartEditor)}
            className="px-10 py-4 text-white font-semibold text-lg rounded-xl transition-all duration-300 hover:scale-105 hover:-translate-y-1 flex items-center gap-3 min-w-[200px] justify-center bg-linear-to-br from-violet-500 to-violet-600 shadow-lg shadow-violet-500/40 hover:shadow-xl hover:shadow-violet-500/50"
          >
            <Pencil className="w-5 h-5" />
            Éditer
          </button>
        </div>

        {/* Footer hint */}
        <div
          ref={featuresRef}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <p className="text-xs font-light tracking-wider uppercase text-slate-400 dark:text-slate-500">
            Projet Three.js • ESIMED
          </p>
        </div>
      </div>
    </div>
  )
}
