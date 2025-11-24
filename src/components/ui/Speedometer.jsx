import { useEffect, useState } from 'react';
import { useScene } from '../../context/SceneContext';
import { Gauge } from 'lucide-react';

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
    <div className="fixed bottom-20 left-6 z-20">
      <div 
        className="px-4 py-3 rounded-lg flex items-center gap-3"
        style={{
          background: '#242424',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}
      >
        {/* Icon */}
        <div 
          className="w-10 h-10 rounded-md flex items-center justify-center"
          style={{
            background: 'rgba(26, 119, 203, 0.15)',
            border: '1px solid rgba(26, 119, 203, 0.3)'
          }}
        >
          <Gauge className="w-5 h-5 text-blue-400" />
        </div>
        
        {/* Speed display */}
        <div>
          <div className="text-xs text-white/50 font-medium uppercase tracking-wide">Vitesse</div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-white tabular-nums">{speed}</span>
            <span className="text-sm text-white/60 font-medium">km/h</span>
          </div>
        </div>
      </div>
    </div>
  );
}
