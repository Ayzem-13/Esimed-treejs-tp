import { useState } from 'react';
import { SceneProvider } from './context/SceneContext';
import { CanvasContainer } from './components/CanvasContainer';
import { StartMenu } from './components/StartMenu';
import { LoadingScreen } from './components/LoadingScreen';
import { useScene } from './context/SceneContext';

function AppContent() {
  const [showStartMenu, setShowStartMenu] = useState(true);
  const { setMenuClosed, isLoading } = useScene();

  const handleStartClick = () => {
    setShowStartMenu(false);
    setMenuClosed(true);
  };

  return (
    <main className="relative w-full h-screen overflow-hidden">
      <CanvasContainer />
      {showStartMenu && <StartMenu onStart={handleStartClick} />}
      <LoadingScreen isLoading={isLoading} />
    </main>
  );
}

function App() {
  return (
    <SceneProvider>
      <AppContent />
    </SceneProvider>
  );
}

export default App;
