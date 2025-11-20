import { useEffect, useRef } from 'react';
import { Application } from '../three/class/application';
import { useScene } from '../context/SceneContext';

export function CanvasContainer() {
  const containerRef = useRef(null);
  const appRef = useRef(null);
  const { setAppInstance } = useScene();

  useEffect(() => {
    if (containerRef.current && !appRef.current) {
      // Initialize Application
      appRef.current = new Application(containerRef.current);
      
      // Share instance with React Context
      setAppInstance(appRef.current);
    }

    return () => {
      if (appRef.current) {
        appRef.current.dispose();
        appRef.current = null;
        setAppInstance(null);
      }
    };
  }, [setAppInstance]);

  return (
    <div
      ref={containerRef}
      className="w-full h-screen absolute top-0 left-0"
    />
  );
}
