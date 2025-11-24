import { useState, useEffect } from 'react';
import { SceneProvider } from './context/SceneContext';
import { CanvasContainer } from './components/CanvasContainer';
import { StartMenu } from './components/StartMenu';
import { LoadingScreen } from './components/LoadingScreen';
import { PauseMenu } from './components/PauseMenu';
import { Speedometer } from './components/Speedometer';
import { InteractionPrompt } from './components/InteractionPrompt';
import { DialogueUI } from './components/DialogueUI';
import { GameOverScreen } from './components/GameOverScreen';
import { useScene } from './context/SceneContext';

function AppContent() {
  const [showStartMenu, setShowStartMenu] = useState(true);
  const { setMenuClosed, isLoading, gameMode, setGameMode, isPaused, setIsPaused, appInstance, shouldReset, setShouldReset, isGameOver, setIsGameOver } = useScene();

  const resetGame = () => {
    if (document.pointerLockElement) {
      document.exitPointerLock();
    }
    document.body.style.cursor = 'auto';

    if (appInstance) {
      appInstance.dispose();
    }
    setShouldReset(true);
    setIsPaused(false);
    setIsGameOver(false);
    setShowStartMenu(true);
    setMenuClosed(false);
    setGameMode(null);
  };

  const handleStartCharacter = () => {
    setShowStartMenu(false);
    setMenuClosed(true);
    setGameMode('character');
  };

  const handleStartEditor = () => {
    setShowStartMenu(false);
    setMenuClosed(true);
    setGameMode('editor');
  };

  const handlePauseToggle = () => {
    setIsPaused(prev => !prev);
  };

  const handleQuit = () => {
    resetGame();
  };

  useEffect(() => {
    if (isGameOver) {
      setIsPaused(true);
    }
  }, [isGameOver, setIsPaused]);

  useEffect(() => {
    if (isPaused) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !showStartMenu && !isLoading) {
        e.preventDefault();
        e.stopPropagation();
        setIsPaused(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown, { capture: true });
    return () => window.removeEventListener('keydown', handleKeyDown, { capture: true });
  }, [showStartMenu, isLoading, isPaused, setIsPaused]);

  useEffect(() => {
    if (isPaused) {
      if (document.pointerLockElement) {
        document.exitPointerLock?.();
      }
    }
  }, [isPaused]);

  useEffect(() => {
    if (appInstance && appInstance.globalParams) {
      appInstance.globalParams.isPaused = isPaused;
    }
  }, [isPaused, appInstance]);

  useEffect(() => {
    if (shouldReset) {
      setShowStartMenu(true);
    }
  }, [shouldReset]);

  return (
    <main className="relative w-full h-screen">
      <CanvasContainer />
      {showStartMenu && (
        <StartMenu
          onStartCharacter={handleStartCharacter}
          onStartEditor={handleStartEditor}
        />
      )}
      <LoadingScreen isLoading={isLoading} />
      <Speedometer />
      <InteractionPrompt />
      <DialogueUI />
      <GameOverScreen />
      {!isGameOver && (
        <PauseMenu
          isOpen={isPaused}
          onClose={handlePauseToggle}
          onQuit={handleQuit}
        />
      )}
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
