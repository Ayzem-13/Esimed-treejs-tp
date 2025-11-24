import { useState, useEffect } from 'react';
import { SceneProvider, useScene } from './context/SceneContext';
import { CanvasContainer } from './components/CanvasContainer';
// Screens
import { StartMenu } from './components/screens/StartMenu';
import { PauseMenu } from './components/screens/PauseMenu';
import { GameOverScreen } from './components/screens/GameOverScreen';
import { VictoryScreen } from './components/screens/VictoryScreen';
// UI Components
import { LoadingScreen } from './components/ui/LoadingScreen';
import { Speedometer } from './components/ui/Speedometer';
import { InteractionPrompt } from './components/ui/InteractionPrompt';
import { DialogueUI } from './components/ui/DialogueUI';
import { HealthBar } from './components/ui/HealthBar';
import { ScoreHUD } from './components/ui/ScoreHUD';
import { WaveUI } from './components/ui/WaveUI';

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
      <HealthBar />
      <Speedometer />
      <ScoreHUD />
      <WaveUI />
      <InteractionPrompt />
      <DialogueUI />
      <GameOverScreen />
      <VictoryScreen />
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
