import { useState, useEffect, useRef } from 'react'
import { gsap } from 'gsap'

export const LoadingScreen = ({ isLoading }) => {
  const containerRef = useRef(null)
  const loaderRef = useRef(null)

  useEffect(() => {
    if (loaderRef.current && isLoading) {
      gsap.to(loaderRef.current, {
        rotation: 360,
        duration: 2,
        repeat: -1,
        ease: 'linear'
      })
    }
  }, [isLoading])

  useEffect(() => {
    if (containerRef.current) {
      if (isLoading) {
        gsap.to(containerRef.current, {
          opacity: 1,
          pointerEvents: 'auto',
          duration: 0.3
        })
      } else {
        gsap.to(containerRef.current, {
          opacity: 0,
          pointerEvents: 'none',
          duration: 0.5
        })
      }
    }
  }, [isLoading])

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm flex items-center justify-center"
      style={{ opacity: 0, pointerEvents: 'none' }}
    >
      <div className="flex flex-col items-center gap-6">
        {/* Spinner */}
        <div
          ref={loaderRef}
          className="w-12 h-12 border-3 border-slate-600 border-t-blue-500 rounded-full"
        />

        {/* Text */}
        <div className="text-center">
          <p className="text-white font-medium">Chargement de la scène...</p>
          <p className="text-slate-400 text-sm mt-1">Veuillez patienter</p>
        </div>
      </div>
    </div>
  )
}
