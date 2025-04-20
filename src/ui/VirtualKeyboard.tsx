import '../styles/index.css';

import clsx from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';
import React, { FC, RefObject, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

import { keyboardData } from '../data';
import { updateInputValueWithCursor } from '../lib';
import { useVirtualKeyboard } from '../context';
import { TKeyboardType } from '../types';

interface IVirtualKeyboardProps {
  show: boolean;
  inputRef: RefObject<HTMLInputElement | HTMLTextAreaElement | null>;
}

export const VirtualKeyboard: FC<IVirtualKeyboardProps> = ({
  show,
  inputRef,
}) => {
  const [keyboardType, setKeyboardType] = useState<TKeyboardType>('text');
  const [isCaps, setIsCaps] = useState(false);
  const [keyboardLayout, setKeyboardLayout] = useState<'rus' | 'eng'>('rus');
  const [isNum, setIsNum] = useState(false);

  const { triggerGo } = useVirtualKeyboard();

  useEffect(() => {
    if (inputRef.current) {
      switch (inputRef.current.inputMode) {
        case 'email':
          setKeyboardType('email');
          break;

        default:
          setKeyboardType('text');
      }
    }
  }, [inputRef.current]);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    const { key } = target.dataset;
    const input = inputRef.current;

    if (!input || !key) return;

    switch (key) {
      case 'SHIFT':
        setIsCaps((prev) => !prev);
        break;

      case 'BACKSPACE':
        updateInputValueWithCursor(input, (text, start, end) => {
          const newStart = start ? start - 1 : start;
          return {
            value: text.slice(0, newStart) + text.slice(end),
            cursorPosition: newStart,
          };
        });
        break;

      case 'NUM':
        setIsNum((prev) => !prev);
        break;

      case 'LANG':
        setKeyboardLayout((prev) => (prev === 'rus' ? 'eng' : 'rus'));
        break;

      case 'SPACE':
        updateInputValueWithCursor(input, (text, start, end) => ({
          value: text.slice(0, start) + ' ' + text.slice(end),
          cursorPosition: start + 1,
        }));
        break;

      case 'GO':
        input.blur();
        triggerGo();
        break;

      default:
        updateInputValueWithCursor(input, (text, start, end) => ({
          value: text.slice(0, start) + key + text.slice(end),
          cursorPosition: start + key.length,
        }));
        break;
    }
  };

  return createPortal(
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, pointerEvents: 'none' }}
          animate={{ opacity: 1, pointerEvents: 'initial' }}
          exit={{ opacity: 0, pointerEvents: 'none' }}
          className={clsx(
            'virtual-keyboard',
            `virtual-keyboard--${keyboardType}`,
            `virtual-keyboard--${keyboardLayout}`,
            isNum && `virtual-keyboard--is-num`,
          )}
        >
          <div
            onClick={(e) => handleClick(e)}
            onMouseDown={(e) => e.preventDefault()}
            className={'virtual-keyboard__body'}
          >
            {keyboardData[keyboardType][isNum ? 'num' : keyboardLayout][
              isCaps ? 'caps' : 'default'
            ].map((row, index) => {
              return (
                <div key={index} className={'virtual-keyboard__row'}>
                  {row.map((key, index) => (
                    <button
                      key={index}
                      data-key={key}
                      className={clsx(
                        'virtual-keyboard__key',
                        `virtual-keyboard__key--${key}`,
                        isCaps && 'virtual-keyboard__key--is-caps',
                      )}
                    >
                      {key}
                    </button>
                  ))}
                </div>
              );
            })}
          </div>
          <button className={'virtual-keyboard__close'} />
        </motion.div>
      )}
    </AnimatePresence>,
    (document.getElementById('portal') as HTMLDivElement) || document.body,
  );
};
