import { useEffect, useRef } from 'react';
import { Application } from '../three/class/application';
import { useScene } from '../context/SceneContext';

export function CanvasContainer() {
  const containerRef = useRef(null);
  const appRef = useRef(null);
  const { setAppInstance, menuClosed, setIsLoading } = useScene();

  useEffect(() => {
    if (menuClosed && containerRef.current && !appRef.current) {
      setIsLoading(true);
      
      appRef.current = new Application(containerRef.current);
      setAppInstance(appRef.current);

      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [menuClosed, setAppInstance, setIsLoading]);

  useEffect(() => {
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
