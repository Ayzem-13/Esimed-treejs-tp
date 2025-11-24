import { useEffect, useState } from 'react';
import { useScene } from '../../context/SceneContext';
import { Heart } from 'lucide-react';

export function HealthBar() {
    const { appInstance, gameMode } = useScene();
    const [health, setHealth] = useState(100);
    const [maxHealth, setMaxHealth] = useState(100);
    const [forceUpdate, setForceUpdate] = useState(0);

    useEffect(() => {
        if (!appInstance?.character || gameMode !== 'character') return;

        const checkHealth = () => {
            if (appInstance?.character) {
                const currentHealth = appInstance.character.health;
                const currentMaxHealth = appInstance.character.maxHealth;
                if (currentHealth !== health || currentMaxHealth !== maxHealth) {
                    setHealth(currentHealth);
                    setMaxHealth(currentMaxHealth);
                    setForceUpdate(prev => prev + 1);
                }
            }
        };

        const intervalId = setInterval(checkHealth, 100);
        return () => clearInterval(intervalId);
    }, [appInstance, gameMode, health, maxHealth]);

    if (gameMode !== 'character') return null;
    if (!appInstance?.character) return null;

    const healthPercent = (health / maxHealth) * 100;

    const getHealthColor = () => {
        if (healthPercent > 60) return '#22c55e'; // vert
        if (healthPercent > 30) return '#eab308'; // jaune
        return '#ef4444'; // rouge
    };

    return (
        <div className="fixed bottom-6 left-6 z-50" key={forceUpdate}>
            <div 
                className="px-4 py-3 rounded-lg flex items-center gap-3"
                style={{
                    background: '#242424',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                }}
            >
                {/* Icon */}
                <div 
                    className="w-8 h-8 rounded-md flex items-center justify-center"
                    style={{
                        background: 'rgba(239, 68, 68, 0.15)',
                        border: '1px solid rgba(239, 68, 68, 0.3)'
                    }}
                >
                    <Heart className="w-4 h-4 text-red-400" />
                </div>

                {/* Progress bar */}
                <div className="flex flex-col gap-1">
                    <div className="text-xs text-white/50 font-medium uppercase tracking-wide">Vie</div>
                    <div 
                        className="w-40 h-2 rounded-full overflow-hidden"
                        style={{
                            background: 'rgba(255, 255, 255, 0.1)'
                        }}
                    >
                        <div
                            className="h-full transition-all duration-300 ease-out rounded-full"
                            style={{ 
                                width: `${healthPercent}%`,
                                background: getHealthColor()
                            }}
                        />
                    </div>
                </div>

                {/* Value */}
                <div className="text-sm font-bold text-white tabular-nums">
                    {health}/{maxHealth}
                </div>
            </div>
        </div>
    );
}
