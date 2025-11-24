import { useEffect, useState } from 'react';
import { useScene } from '../../context/SceneContext';
import { Waves } from 'lucide-react';

function arabicToRoman(num) {
    const romanMatrix = [
        [1000, 'M'],
        [900, 'CM'],
        [500, 'D'],
        [400, 'CD'],
        [100, 'C'],
        [90, 'XC'],
        [50, 'L'],
        [40, 'XL'],
        [10, 'X'],
        [9, 'IX'],
        [5, 'V'],
        [4, 'IV'],
        [1, 'I']
    ];

    let roman = '';
    let n = num;

    for (const [value, letter] of romanMatrix) {
        while (n >= value) {
            roman += letter;
            n -= value;
        }
    }

    return roman;
}

export function WaveUI() {
    const { appInstance, gameMode } = useScene();
    const [wave, setWave] = useState(1);
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        if (gameMode !== 'character' || !appInstance?.waveManager) return;

        const checkWave = () => {
            const currentWave = appInstance.waveManager.currentWave;
            if (currentWave !== wave && currentWave > 0) {
                setIsAnimating(true);
                setWave(currentWave);
                setTimeout(() => setIsAnimating(false), 600);
            }
        };

        const intervalId = setInterval(checkWave, 100);
        return () => clearInterval(intervalId);
    }, [appInstance, gameMode, wave]);

    if (gameMode !== 'character') return null;
    if (!appInstance?.waveManager) return null;

    const romanWave = arabicToRoman(wave);

    return (
        <div className="fixed top-6 left-6 z-50">
            <div 
                className="px-6 py-3 rounded-lg flex items-center gap-3"
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
                    <Waves className="w-4 h-4 text-red-400" />
                </div>

                {/* Wave number */}
                <div className="flex items-center gap-2">
                    <span className="text-xs text-white/50 font-medium uppercase tracking-wide">Manche</span>
                    <span 
                        className={`text-2xl font-bold transition-all duration-600 ${
                            isAnimating ? 'scale-110' : 'scale-100'
                        }`}
                        style={{
                            color: '#ef4444',
                            fontVariant: 'small-caps',
                            letterSpacing: '2px'
                        }}
                    >
                        {romanWave}
                    </span>
                </div>
            </div>
        </div>
    );
}
