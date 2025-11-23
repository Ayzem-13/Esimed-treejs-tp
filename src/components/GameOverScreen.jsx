import { useEffect, useRef } from 'react';
import { useScene } from '../context/SceneContext';
import gsap from 'gsap';
import { Home } from 'lucide-react';

export function GameOverScreen() {
    const { isGameOver, setIsGameOver, appInstance, setShouldReset, setIsPaused, setMenuClosed, setGameMode, resetToMenu } = useScene();
    const overlayRef = useRef(null);
    const cardRef = useRef(null);
    const titleRef = useRef(null);

    useEffect(() => {
        if (isGameOver && overlayRef.current && cardRef.current && titleRef.current) {
            // Animate entrance
            gsap.to(overlayRef.current, {
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                duration: 0.3,
                ease: 'power2.out'
            });

            gsap.to(cardRef.current, {
                scale: 1,
                opacity: 1,
                duration: 0.4,
                ease: 'back.out'
            });

            // Title shake animation
            gsap.to(titleRef.current, {
                x: 0,
                duration: 0.5,
                ease: 'elastic.out',
                delay: 0.2
            });

            // Pulse animation for the card
            gsap.to(cardRef.current, {
                duration: 1.5,
                repeat: -1,
                yoyo: true,
                ease: 'sine.inOut'
            });
        }
    }, [isGameOver]);

    const handleReturnToMenu = () => {
        // Animate exit
        gsap.to(cardRef.current, {
            scale: 0.8,
            opacity: 0,
            duration: 0.3,
            ease: 'back.in'
        });

        gsap.to(overlayRef.current, {
            backgroundColor: 'rgba(0, 0, 0, 0)',
            duration: 0.3,
            ease: 'power2.in'
        });

        setTimeout(() => {
            resetToMenu();
        }, 300);
    };

    if (!isGameOver) return null;

    return (
        <div
            ref={overlayRef}
            className="fixed inset-0 z-9999 flex items-center justify-center bg-black/0"
        >
            {/* Animated gradient background */}
            <div className="absolute inset-0 bg-linear-to-br from-slate-900 via-red-900/40 to-slate-900"></div>

            {/* Dynamic blob backgrounds */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-600/30 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>

            {/* Content container */}
            <div className="relative z-10 flex flex-col items-center justify-center w-full h-full px-4 py-8">
                <div
                    ref={cardRef}
                    className="opacity-0 w-full max-w-2xl"
                >
                    <div className="text-center space-y-12">
                        {/* Main Title */}
                        <div className="space-y-6">
                            <h1
                                ref={titleRef}
                                className="text-9xl md:text-9xl font-black tracking-tighter"
                                style={{
                                    backgroundImage: 'linear-gradient(135deg, #ef4444 0%, #f97316 50%, #dc2626 100%)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    backgroundClip: 'text',
                                    filter: 'drop-shadow(0 10px 20px rgba(239, 68, 68, 0.3))'
                                }}
                            >
                                GAME OVER
                            </h1>

                            {/* Decorative line */}
                            <div className="flex items-center justify-center gap-4">
                                <div className="h-1 w-16 bg-red-500/50 rounded-full"></div>
                                <div className="w-3 h-3 rounded-full bg-red-500/70"></div>
                                <div className="h-1 w-16 bg-red-500/50 rounded-full"></div>
                            </div>
                        </div>

                        {/* Message section */}
                        <div className="space-y-4 max-w-xl mx-auto">
                            <p className="text-4xl md:text-5xl font-bold text-red-300/90">Trop d'erreurs!</p>
                            <p className="text-base md:text-lg text-gray-300/80 leading-relaxed">
                                Tu as commis trop de fautes. Réessaye et fais attention à tes réponses pour gagner!
                            </p>
                        </div>

                        {/* Stats card */}
                        <div className="relative group">
                            <div className="absolute inset-0 bg-linear-to-r from-red-600/20 to-orange-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                            <div className="relative bg-black/30 backdrop-blur-xl rounded-2xl border border-red-500/30 px-8 py-6 space-y-2">
                                <p className="text-sm text-gray-400 uppercase tracking-wider font-medium">Limite de fautes</p>
                                <p className="text-4xl font-black text-red-400">3 erreurs</p>
                            </div>
                        </div>

                        {/* CTA Button */}
                        <div className="pt-4">
                            <button
                                onClick={handleReturnToMenu}
                                className="relative px-8 py-4 bg-white rounded-xl flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transition-all duration-300 group border border-red-200 hover:border-red-400 w-full md:w-auto md:mx-auto"
                            >
                                <Home className="w-5 h-5 text-red-600 group-hover:scale-110 transition-transform" />
                                <span className="text-gray-900 font-semibold text-base">Menu Principal</span>
                            </button>
                        </div>
                    </div>

                    {/* Accent decorations */}
                    <div className="absolute -top-8 -right-8 text-red-600/20 text-7xl font-black pointer-events-none">✕</div>
                    <div className="absolute -bottom-8 -left-8 text-orange-600/10 text-8xl font-black pointer-events-none">!</div>
                </div>
            </div>
        </div>
    );
}
