import { createContext, useContext } from 'react';

type GoCallback = () => void;

interface VirtualKeyboardContextProps {
  subscribeOnGo: (cb: GoCallback) => () => void;
  triggerGo: () => void;
}

const noop = () => {};

export const VirtualKeyboardContext =
  createContext<VirtualKeyboardContextProps>({
    subscribeOnGo: () => noop,
    triggerGo: noop,
  });

export const useVirtualKeyboard = () => {
  const context = useContext(VirtualKeyboardContext);
  if (!context) throw new Error('Используйте внутри VirtualKeyboardProvider');
  return context;
};
