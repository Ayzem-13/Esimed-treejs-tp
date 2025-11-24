import { useEffect, useState } from 'react';
import { useScene } from '../../context/SceneContext';

export function InteractionPrompt() {
    const { appInstance } = useScene();
    const [isVisible, setIsVisible] = useState(false);
    const [interactionLabel, setInteractionLabel] = useState('Interagir');
    const [interactionKey, setInteractionKey] = useState('E');

    useEffect(() => {
        let frameId;
        const updateInteraction = () => {
            if (appInstance?.character) {
                const nearbyInteractable = appInstance.character.getNearbyInteractable?.();

                if (nearbyInteractable) {
                    setIsVisible(true);
                    setInteractionLabel(nearbyInteractable.label || 'Interagir');
                    setInteractionKey(nearbyInteractable.key || 'E');
                } else {
                    setIsVisible(false);
                }
            }
            frameId = requestAnimationFrame(updateInteraction);
        };

        frameId = requestAnimationFrame(updateInteraction);
        return () => {
            if (frameId) cancelAnimationFrame(frameId);
        };
    }, [appInstance]);

    if (!isVisible) return null;

    return (
        <div className="fixed right-8 top-1/2 -translate-y-1/2 z-30">
            <div
                className="px-4 py-3 rounded-lg flex items-center gap-3"
                style={{
                    background: '#242424',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                }}
            >
                {/* Touche */}
                <div 
                    className="px-3 py-1 rounded-md font-mono font-bold text-sm"
                    style={{
                        background: 'rgba(26, 119, 203, 0.15)',
                        border: '1px solid rgba(26, 119, 203, 0.3)',
                        color: '#1a77cb'
                    }}
                >
                    {interactionKey}
                </div>
                {/* Label */}
                <span className="text-sm font-medium text-white">
                    {interactionLabel}
                </span>
            </div>
        </div>
    );
}
