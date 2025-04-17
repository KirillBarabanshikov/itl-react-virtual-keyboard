import {
  createContext,
  FC,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

import { VirtualKeyboard } from '../ui';

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

export const useVirtualKeyboard = () => useContext(VirtualKeyboardContext);

export const VirtualKeyboardProvider: FC<PropsWithChildren> = ({
  children,
}) => {
  const [showKeyboard, setShowKeyboard] = useState(false);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const subscribersRef = useRef(new Set<() => void>());

  useEffect(() => {
    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement;

      if (isInputSupported(target)) {
        inputRef.current = target as HTMLInputElement;
        setShowKeyboard(true);
        console.log('клавиатура открыта');
      }
    };

    const handleFocusOut = () => {
      const active = document.activeElement as HTMLElement;
      if (
        !active ||
        (active.tagName !== 'INPUT' &&
          active.tagName !== 'TEXTAREA' &&
          !active.isContentEditable)
      ) {
        inputRef.current = null;
        setShowKeyboard(false);
        console.log('клавиатура закрыта');
      }
    };

    document.addEventListener('focusin', handleFocusIn);
    document.addEventListener('focusout', handleFocusOut);

    return () => {
      document.removeEventListener('focusin', handleFocusIn);
      document.removeEventListener('focusout', handleFocusOut);
    };
  }, []);

  function isInputSupported(
    el: HTMLElement,
  ): el is HTMLInputElement | HTMLTextAreaElement {
    if (el.tagName === 'TEXTAREA') return true;
    if (el.tagName !== 'INPUT') return false;

    const type = (el as HTMLInputElement).type;
    return [
      'text',
      'email',
      'number',
      'password',
      'tel',
      'search',
      'url',
    ].includes(type);
  }

  const subscribeOnGo = useCallback((cb: () => void) => {
    const subs = subscribersRef.current;
    subs.add(cb);

    return () => {
      subs.delete(cb);
    };
  }, []);

  const triggerGo = useCallback(() => {
    for (const cb of subscribersRef.current) {
      try {
        cb();
      } catch (e) {
        console.error('GO callback error:', e);
      }
    }
  }, []);

  return (
    <VirtualKeyboardContext.Provider value={{ subscribeOnGo, triggerGo }}>
      {children}
      <VirtualKeyboard show={showKeyboard} inputRef={inputRef} />
    </VirtualKeyboardContext.Provider>
  );
};
