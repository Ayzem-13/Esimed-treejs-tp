import { useEffect, useRef } from 'react';
import { useScene } from '../../context/SceneContext';
import gsap from 'gsap';
import { Trophy, Home, Award } from 'lucide-react';

export function VictoryScreen() {
    const { isVictory, resetToMenu } = useScene();
    const overlayRef = useRef(null);
    const cardRef = useRef(null);
    const titleRef = useRef(null);

    useEffect(() => {
        if (isVictory && overlayRef.current && cardRef.current && titleRef.current) {
            // Animate entrance
            gsap.to(overlayRef.current, {
                opacity: 1,
                duration: 0.4,
                ease: 'power2.out'
            });

            gsap.fromTo(cardRef.current, {
                scale: 0.9,
                opacity: 0,
                y: 30
            }, {
                scale: 1,
                opacity: 1,
                y: 0,
                duration: 0.5,
                ease: 'power3.out',
                delay: 0.2
            });

            gsap.fromTo(titleRef.current, {
                opacity: 0,
                y: -20
            }, {
                opacity: 1,
                y: 0,
                duration: 0.6,
                ease: 'power3.out',
                delay: 0.4
            });
        }
    }, [isVictory]);

    const handleReturnToMenu = () => {
        gsap.to(cardRef.current, {
            scale: 0.95,
            opacity: 0,
            y: -20,
            duration: 0.3,
            ease: 'power2.in'
        });

        gsap.to(overlayRef.current, {
            opacity: 0,
            duration: 0.3,
            ease: 'power2.in'
        });

        setTimeout(() => {
            resetToMenu();
        }, 300);
    };

    if (!isVictory) return null;

    return (
        <div
            ref={overlayRef}
            className="fixed inset-0 z-[9999] flex items-center justify-center opacity-0"
            style={{
                background: '#242424'
            }}
        >
            {/* Animated background circles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div 
                    className="absolute top-20 right-20 w-96 h-96 rounded-full opacity-5"
                    style={{
                        background: 'radial-gradient(circle, #22c55e 0%, transparent 70%)',
                        animation: 'pulse 3s ease-in-out infinite'
                    }}
                />
                <div 
                    className="absolute bottom-20 left-20 w-[500px] h-[500px] rounded-full opacity-5"
                    style={{
                        background: 'radial-gradient(circle, #22c55e 0%, transparent 70%)',
                        animation: 'pulse 3s ease-in-out infinite reverse'
                    }}
                />
            </div>

            {/* Content container */}
            <div className="relative z-10 flex flex-col items-center justify-center w-full h-full px-6">
                <div ref={cardRef}>
                    {/* Icon */}
                    <div className="flex justify-center mb-8">
                        <div 
                            className="w-24 h-24 rounded-full flex items-center justify-center"
                            style={{
                                background: 'rgba(34, 197, 94, 0.15)',
                                border: '2px solid rgba(34, 197, 94, 0.3)'
                            }}
                        >
                            <Trophy className="w-12 h-12 text-green-400" />
                        </div>
                    </div>

                    {/* Title */}
                    <div ref={titleRef} className="text-center mb-8">
                        <h1 className="text-6xl md:text-7xl font-black text-white mb-4 tracking-tight">
                            Victoire!
                        </h1>
                        <div className="h-px bg-gradient-to-r from-transparent via-green-500/30 to-transparent mb-6" />
                        <p className="text-2xl text-white/80 font-light">
                            Félicitations!
                        </p>
                    </div>

                    {/* Message */}
                    <div className="mb-10 text-center">
                        <p className="text-base text-white/60 leading-relaxed max-w-md mx-auto">
                            Vous avez réussi à survivre et à terminer toutes les vagues. Excellent travail!
                        </p>
                    </div>

                    {/* Buttons */}
                    <div className="max-w-sm mx-auto">
                        <button
                            onClick={handleReturnToMenu}
                            className="w-full px-6 py-4 rounded-lg flex items-center gap-3 transition-all duration-200"
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
                            <Home className="w-5 h-5 text-white" />
                            <span className="text-white font-medium text-base flex-1 text-left">Menu Principal</span>
                        </button>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes pulse {
                    0%, 100% { transform: scale(1); opacity: 0.05; }
                    50% { transform: scale(1.1); opacity: 0.08; }
                }
            `}</style>
        </div>
    );
}
