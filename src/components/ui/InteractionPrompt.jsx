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
        <div className="fixed right-16 top-1/2 -translate-y-1/2 z-3">
            <div
                className="flex items-center bg-gray-700 px-4 py-2 rounded"
            >
                {/* Touche  */}
                <div className="rounded px-2 py-1 flex items-center justify-center">
                    <span
                        className="text-xs font-bold text-gray-200 font-mono"
                    >
                        [{interactionKey}]
                    </span>
                </div>
                {/* Label */}
                <span
                    className="text-sm font-bold text-gray-100 uppercase tracking-wide"
                    style={{
                        textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)'
                    }}
                >
                    {interactionLabel}
                </span>
            </div>
        </div>
    );
}
