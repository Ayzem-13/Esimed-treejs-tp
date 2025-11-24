import React, { createContext, useContext, useState } from 'react';

const SceneContext = createContext(null);

export const useScene = () => useContext(SceneContext);

export const SceneProvider = ({ children }) => {
    const [appInstance, setAppInstance] = useState(null);
    const [menuClosed, setMenuClosed] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [gameMode, setGameMode] = useState(null); // 'character' or 'editor'
    const [isPaused, setIsPaused] = useState(false);
    const [shouldReset, setShouldReset] = useState(false);
    const [isGameOver, setIsGameOver] = useState(false);
    const [isVictory, setIsVictory] = useState(false);

    const resetToMenu = () => {
        if (document.pointerLockElement) {
            document.exitPointerLock();
        }
        document.body.style.cursor = 'auto';

        setIsGameOver(false);
        setIsVictory(false);
        setIsPaused(false);
        setGameMode(null);
        setMenuClosed(false);
        setShouldReset(true);
    };

    return (
        <SceneContext.Provider value={{
            appInstance,
            setAppInstance,
            menuClosed,
            setMenuClosed,
            isLoading,
            setIsLoading,
            gameMode,
            setGameMode,
            isPaused,
            setIsPaused,
            shouldReset,
            setShouldReset,
            isGameOver,
            setIsGameOver,
            isVictory,
            setIsVictory,
            resetToMenu
        }}>
            {children}
        </SceneContext.Provider>
    );
};
