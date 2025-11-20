import React, { createContext, useContext, useState } from 'react';

const SceneContext = createContext(null);

export const useScene = () => useContext(SceneContext);

export const SceneProvider = ({ children }) => {
    const [appInstance, setAppInstance] = useState(null);

    return (
        <SceneContext.Provider value={{ appInstance, setAppInstance }}>
            {children}
        </SceneContext.Provider>
    );
};
