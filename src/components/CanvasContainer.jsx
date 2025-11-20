import { useEffect, useRef } from 'react';
import { Application } from '../three/class/application';
import { useScene } from '../context/SceneContext';

export function CanvasContainer() {
  const containerRef = useRef(null);
  const appRef = useRef(null);
  const { setAppInstance, menuClosed, setIsLoading, gameMode, isPaused, shouldReset, setShouldReset } = useScene();

  useEffect(() => {
    if (shouldReset && appRef.current) {
      appRef.current.dispose();
      appRef.current = null;
      setAppInstance(null);
      setShouldReset(false);
    }
  }, [shouldReset, setShouldReset, setAppInstance]);

  useEffect(() => {
    if (menuClosed && containerRef.current && !appRef.current && gameMode) {
      setIsLoading(true);

      appRef.current = new Application(containerRef.current, gameMode);
      setAppInstance(appRef.current);

      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [menuClosed, gameMode, setAppInstance, setIsLoading]);

  useEffect(() => {
    if (appRef.current) {
      appRef.current.isPaused = isPaused;
      if (isPaused && document.pointerLockElement) {
        document.exitPointerLock();
      }
    }
  }, [isPaused]);

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
