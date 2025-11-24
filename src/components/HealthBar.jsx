import { useEffect, useState } from 'react';
import { useScene } from '../context/SceneContext';

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
        if (healthPercent > 60) return 'bg-green-500';
        if (healthPercent > 30) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    return (
        <div className="fixed bottom-6 left-6 z-50" key={forceUpdate}>
            <div className="flex items-center gap-3">
                <div className="text-white text-sm font-bold drop-shadow-lg">VIE</div>
                <div className="w-48 h-4 bg-gray-800/80 rounded-full overflow-hidden border border-gray-600">
                    <div
                        className={`h-full ${getHealthColor()} transition-all duration-300 ease-out`}
                        style={{ width: `${healthPercent}%` }}
                    />
                </div>
                <div className="text-white text-sm font-bold drop-shadow-lg min-w-[60px]">
                    {health}/{maxHealth}
                </div>
            </div>
        </div>
    );
}
