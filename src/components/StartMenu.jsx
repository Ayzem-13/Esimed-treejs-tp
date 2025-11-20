import { useState, useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { Play, Building2, Users, Zap, Gamepad2, Pencil } from 'lucide-react'

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
        featuresRef.current.children,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power3.out', delay: 0.65 }
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
      className="fixed inset-0 z-50 bg-gradient-to-br from-gray-50 via-gray-100 to-blue-50 overflow-hidden"
    >
      {/* Décoration background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-0 w-80 h-80 bg-blue-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-blue-300/10 rounded-full blur-3xl"></div>
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-gray-300/20 rounded-full blur-3xl"></div>
      </div>

      {/* Grid pattern subtle */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: 'linear-gradient(0deg, #2c3e50 1px, transparent 1px), linear-gradient(90deg, #2c3e50 1px, transparent 1px)',
        backgroundSize: '50px 50px'
      }}></div>

      {/* Content */}
      <div ref={contentRef} className="relative h-full flex flex-col items-center justify-center px-6">

        {/* Main Title */}
        <div className="max-w-3xl text-center mb-12">
          <div ref={titleRef}>
            <h1 className="text-6xl md:text-7xl font-black text-gray-900 mb-4 tracking-tight">
              MicroVille
            </h1>
          </div>

          <div ref={subtitleRef}>
            <p className="text-xl text-gray-600 font-light tracking-wide mb-2">
              Explorez une ville moderne dynamique
            </p>
            <p className="text-sm text-gray-500 font-light">
              Découvrez, construisez et interagissez avec l'environnement
            </p>
          </div>
        </div>

        {/* Features Grid */}
        <div ref={featuresRef} className="grid grid-cols-3 gap-6 mb-16 max-w-2xl">
          <FeatureCard
            icon={<Building2 className="w-6 h-6" />}
            title="Exploration"
            description="Parcourez la ville"
          />
          <FeatureCard
            icon={<Users className="w-6 h-6" />}
            title="Interaction"
            description="Avec l'environnement"
          />
          <FeatureCard
            icon={<Zap className="w-6 h-6" />}
            title="Dynamisme"
            description="Vivez des moments uniques"
          />
        </div>

        {/* Mode Selection Buttons */}
        <div ref={buttonsRef} className="flex flex-col items-center gap-8">
          <div className="flex gap-6">
            <ModeButton
              icon={<Play className="w-5 h-5" />}
              label="Jouer"
              description="Mode Exploration"
              onClick={() => handleModeSelection(onStartCharacter)}
              color="blue"
            />

            <ModeButton
              icon={<Pencil className="w-5 h-5" />}
              label="Éditer"
              description="Mode Éditeur"
              onClick={() => handleModeSelection(onStartEditor)}
              color="purple"
            />
          </div>

          <p className="text-gray-500 text-sm">
            Appuyez sur <kbd className="px-2 py-1 bg-gray-200/60 rounded text-xs font-mono text-gray-700 ml-1">Échap</kbd> pour fermer
          </p>
        </div>
      </div>
    </div>
  )
}

const FeatureCard = ({ icon, title, description }) => {
  return (
    <div className="flex flex-col items-center p-4 rounded-lg bg-white/40 backdrop-blur-sm border border-white/60 hover:bg-white/60 hover:border-blue-300/60 transition-all duration-300 hover:shadow-lg">
      <div className="text-blue-600 mb-3">
        {icon}
      </div>
      <h3 className="font-semibold text-gray-900 text-sm mb-1">{title}</h3>
      <p className="text-gray-600 text-xs text-center">{description}</p>
    </div>
  )
}

const ModeButton = ({ icon, label, description, onClick, color = 'blue' }) => {
  const colorClasses = {
    blue: {
      glow: 'from-blue-500 to-blue-600',
      text: 'text-blue-600',
      shadow: 'rgba(59, 130, 246, 0.4)'
    },
    purple: {
      glow: 'from-purple-500 to-purple-600',
      text: 'text-purple-600',
      shadow: 'rgba(147, 51, 234, 0.4)'
    }
  }

  const colors = colorClasses[color] || colorClasses.blue

  return (
    <button
      ref={(el) => {
        if (el) {
          el.addEventListener('mouseenter', () => {
            gsap.to(el.querySelector('.mode-button-glow'), {
              opacity: 1,
              scale: 1.1,
              duration: 0.3,
              ease: 'power2.out'
            })
            gsap.to(el.querySelector('.mode-button-inner'), {
              y: -2,
              boxShadow: `0 20px 40px ${colors.shadow}`,
              duration: 0.3,
              ease: 'power2.out'
            })
            gsap.to(el.querySelector('.mode-button-icon'), {
              scale: 1.2,
              duration: 0.3,
              ease: 'power2.out'
            })
          })
          el.addEventListener('mouseleave', () => {
            gsap.to(el.querySelector('.mode-button-glow'), {
              opacity: 0.8,
              scale: 1,
              duration: 0.3,
              ease: 'power2.out'
            })
            gsap.to(el.querySelector('.mode-button-inner'), {
              y: 0,
              boxShadow: `0 10px 25px ${colors.shadow.replace('0.4', '0.2')}`,
              duration: 0.3,
              ease: 'power2.out'
            })
            gsap.to(el.querySelector('.mode-button-icon'), {
              scale: 1,
              duration: 0.3,
              ease: 'power2.out'
            })
          })
        }
      }}
      onClick={onClick}
      className="relative cursor-pointer"
    >
      <div className={`mode-button-glow absolute -inset-1 bg-gradient-to-r ${colors.glow} rounded-xl blur-lg opacity-80`}></div>
      <div className="mode-button-inner relative px-8 py-6 bg-white rounded-xl flex flex-col items-center gap-2 shadow-lg transition-shadow min-w-40">
        <div className={`mode-button-icon ${colors.text}`}>
          {icon}
        </div>
        <span className="text-gray-900 font-semibold text-base">{label}</span>
        <p className="text-gray-500 text-xs">{description}</p>
      </div>
    </button>
  )
}
