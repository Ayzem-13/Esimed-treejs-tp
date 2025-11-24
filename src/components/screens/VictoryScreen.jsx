import { useEffect, useRef } from 'react';
import { useScene } from '../../context/SceneContext';
import gsap from 'gsap';
import { Trophy } from 'lucide-react';

export function VictoryScreen() {
    const { isVictory, resetToMenu } = useScene();
    const overlayRef = useRef(null);
    const cardRef = useRef(null);
    const titleRef = useRef(null);

    useEffect(() => {
        if (isVictory && overlayRef.current && cardRef.current && titleRef.current) {
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

            gsap.to(titleRef.current, {
                y: 0,
                duration: 0.5,
                ease: 'elastic.out',
                delay: 0.2
            });
        }
    }, [isVictory]);

    const handleReturnToMenu = () => {
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

    if (!isVictory) return null;

    return (
        <div
            ref={overlayRef}
            className="fixed inset-0 z-9999 flex items-center justify-center bg-black/70"
        >
            {/* Animated gradient background */}
            <div className="absolute inset-0 bg-linear-to-br from-slate-900 via-yellow-900/40 to-slate-900"></div>

            {/* Dynamic blob backgrounds */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-yellow-600/30 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-green-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>

            {/* Content container */}
            <div className="relative z-10 flex flex-col items-center justify-center w-full h-full px-4 py-8">
                <div
                    ref={cardRef}
                    className="w-full max-w-2xl"
                >
                    <div className="text-center space-y-12">
                        {/* Main Title */}
                        <div className="space-y-6">
                            <h1
                                ref={titleRef}
                                className="text-9xl md:text-9xl font-black tracking-tighter"
                                style={{
                                    backgroundImage: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #eab308 100%)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    backgroundClip: 'text',
                                    filter: 'drop-shadow(0 10px 20px rgba(251, 191, 36, 0.3))'
                                }}
                            >
                                VICTOIRE!
                            </h1>

                            {/* Decorative line */}
                            <div className="flex items-center justify-center gap-4">
                                <div className="h-1 w-16 bg-yellow-500/50 rounded-full"></div>
                                <Trophy className="w-8 h-8 text-yellow-400" />
                                <div className="h-1 w-16 bg-yellow-500/50 rounded-full"></div>
                            </div>
                        </div>

                        {/* Message section */}
                        <div className="space-y-4 max-w-xl mx-auto">
                            <p className="text-4xl md:text-5xl font-bold text-yellow-300/90">Quiz termine!</p>
                            <p className="text-base md:text-lg text-gray-300/80 leading-relaxed">
                                Felicitations! Vous avez reussi à survivre 
                            </p>
                        </div>

                        {/* CTA Button */}
                        <div className="pt-4">
                            <button
                                onClick={handleReturnToMenu}
                                className="relative px-8 py-4 bg-white rounded-xl flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transition-all duration-300 group border border-yellow-200 hover:border-yellow-400 w-full md:w-auto md:mx-auto"
                            >
                                <Trophy className="w-5 h-5 text-yellow-600 group-hover:scale-110 transition-transform" />
                                <span className="text-gray-900 font-semibold text-base">Menu Principal</span>
                            </button>
                        </div>
                    </div>

                    {/* Accent decorations */}
                    <div className="absolute -top-8 -right-8 text-yellow-600/20 text-7xl font-black pointer-events-none">*</div>
                    <div className="absolute -bottom-8 -left-8 text-green-600/10 text-8xl font-black pointer-events-none">!</div>
                </div>
            </div>
        </div>
    );
}
