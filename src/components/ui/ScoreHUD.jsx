import { useEffect, useState, useRef } from 'react';
import { useScene } from '../../context/SceneContext';

export function ScoreHUD() {
    const { appInstance, gameMode } = useScene();
    const [score, setScore] = useState(0);
    const [forceUpdate, setForceUpdate] = useState(0);

    useEffect(() => {
        if (gameMode !== 'character' || !appInstance?.character) {
            return;
        }

        const checkScore = () => {
            if (appInstance?.character) {
                const currentScore = appInstance.character.score || 0;
                if (currentScore !== score) {
                    setScore(currentScore);
                    setForceUpdate(prev => prev + 1);
                }
            }
        };

        const intervalId = setInterval(checkScore, 100);
        return () => clearInterval(intervalId);
    }, [appInstance, gameMode, score]);

    if (gameMode !== 'character') return null;
    if (!appInstance?.character) return null;

    return (
        <div
            key={forceUpdate}
            className="fixed top-5 right-5 bg-black/70 text-white px-4 py-2 rounded font-mono text-base"
        >
            Score : {score}
        </div>
    );
}
