import React, { createContext, useContext, useState } from 'react';

const SceneContext = createContext(null);

export const useScene = () => useContext(SceneContext);

export const SceneProvider = ({ children }) => {
    const [appInstance, setAppInstance] = useState(null);
    const [menuClosed, setMenuClosed] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    return (
        <SceneContext.Provider value={{ appInstance, setAppInstance, menuClosed, setMenuClosed, isLoading, setIsLoading }}>
            {children}
        </SceneContext.Provider>
    );
};
