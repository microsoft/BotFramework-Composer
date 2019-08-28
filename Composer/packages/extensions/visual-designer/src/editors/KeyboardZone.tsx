/** @jsx jsx */
import { jsx } from '@emotion/core';
import { FC } from 'react';

import { SystemKeyboardCommandTypes } from '../constants/KeyboardCommandTypes';
interface NodeProps {
  when: string;
  onCommand: (action) => object | void;
}

const isMac = () => {
  return /macintosh|mac os x/i.test(navigator.userAgent);
};
export const KeyboardZone: FC<NodeProps> = ({ when, onCommand, children }): JSX.Element => {
  const keyPressed = {};
  const handleKeyDown = e => {
    keyPressed[e.key] = true;
  };

  const handleKeyUp = e => {
    if (when !== 'nomal') {
      let command = isMac() ? 'Mac' : 'Windows';
      for (const key in keyPressed) {
        if (keyPressed[key]) {
          command += `.${key}`;
        }
      }
      onCommand(SystemKeyboardCommandTypes[command]);
    }
    keyPressed[e.key] = false;
  };
  return (
    <div onKeyDown={handleKeyDown} onKeyUp={handleKeyUp}>
      {children}
    </div>
  );
};
