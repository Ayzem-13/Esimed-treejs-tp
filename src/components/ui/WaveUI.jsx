import { useEffect, useState } from 'react';
import { useScene } from '../../context/SceneContext';

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
        <div className="fixed top-5 left-5 z-50">
            <div className="flex flex-col items-center gap-1">
                <div
                    className={`text-6xl font-bold text-red-600 transition-all duration-600 transform ${
                        isAnimating ? 'scale-125 opacity-50' : 'scale-100 opacity-100'
                    }`}
                    style={{
                        textShadow: '0 0 20px rgba(239, 68, 68, 0.6)',
                        fontVariant: 'small-caps',
                        letterSpacing: '6px'
                    }}
                >
                    {romanWave}
                </div>
            </div>
        </div>
    );
}
