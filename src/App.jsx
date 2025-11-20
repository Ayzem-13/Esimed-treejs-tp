import React from 'react';
import { SceneProvider } from './context/SceneContext';
import { CanvasContainer } from './components/CanvasContainer';

function App() {
  return (
    <SceneProvider>
      <main className="relative w-full h-screen overflow-hidden">
        <CanvasContainer />
      </main>
    </SceneProvider>
  );
}

export default App;
