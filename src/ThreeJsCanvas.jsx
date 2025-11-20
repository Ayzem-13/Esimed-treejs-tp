import React, { useEffect, useRef } from 'react';
import { Application } from './application';

export function ThreeJsCanvas() {
  const containerRef = useRef(null);
  const appRef = useRef(null);

  useEffect(() => {
    // Initialize the Three.js application when component mounts
    if (containerRef.current && !appRef.current) {
      appRef.current = new Application(containerRef.current);
    }

    // Cleanup when component unmounts
    return () => {
      if (appRef.current) {
        appRef.current.dispose();
        appRef.current = null;
      }
    };
  }, []);

  return <div ref={containerRef} style={{ width: '100%', height: '100vh' }} />;
}
