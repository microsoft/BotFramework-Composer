/** @jsx jsx */
import { jsx } from '@emotion/core';
import { FC, useRef } from 'react';

import { mapShortcutToKeyboardCommand } from '../../constants/KeyboardCommandTypes';

interface NodeProps {
  onCommand: (action) => object | void;
}

const isMac = () => {
  return /macintosh|mac os x/i.test(navigator.userAgent);
};
export const KeyboardZone: FC<NodeProps> = ({ onCommand, children }): JSX.Element => {
  const keyPressed = useRef({});
  const handleKeyDown = e => {
    if (e.key === 'Tab') {
      e.preventDefault();
      e.stopPropagation();
    }
    keyPressed.current[e.key] = true;
  };

  const handleKeyUp = e => {
    let keyCode = isMac() ? 'Mac' : 'Windows';
    for (const key in keyPressed.current) {
      if (keyPressed.current[key]) {
        keyCode += `.${key}`;
      }
    }
    onCommand(mapShortcutToKeyboardCommand(keyCode));
    delete keyPressed.current[e.key];
  };
  return (
    <div onKeyDown={handleKeyDown} onKeyUp={handleKeyUp} tabIndex={0} data-test-id="keyboard-zone">
      {children}
    </div>
  );
};
