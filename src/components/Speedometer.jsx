import { useEffect, useState } from 'react';
import { useScene } from '../context/SceneContext';

export function Speedometer() {
  const { appInstance } = useScene();
  const [speed, setSpeed] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let frameId;
    const updateSpeed = () => {
      if (appInstance?.character && appInstance?.vehicle) {
        if (appInstance.character.inVehicle) {
          setIsVisible(true);
          const speedKmh = appInstance.vehicle.getSpeedKmh();
          setSpeed(Math.max(0, Math.round(speedKmh)));
        } else {
          setIsVisible(false);
        }
      }
      frameId = requestAnimationFrame(updateSpeed);
    };

    frameId = requestAnimationFrame(updateSpeed);
    return () => {
      if (frameId) cancelAnimationFrame(frameId);
    };
  }, [appInstance]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-8 left-8 z-20">
      <div className="flex items-center gap-3">
        {/* Speed number - large */}
        <div className="text-6xl font-black font-mono text-white leading-none" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}>
          {speed.toString().padStart(2, '0')}
        </div>

        {/* km/h badge */}
        <div className="flex flex-col gap-1">
          <div className="w-2 h-2 bg-white rounded-full"></div>
          <div className="bg-black border border-gray-600 rounded px-2 py-1">
            <div className="text-xs font-bold text-white font-mono">km/h</div>
          </div>
        </div>
      </div>
    </div>
  );
}
