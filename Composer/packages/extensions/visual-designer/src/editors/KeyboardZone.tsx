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
  const key_pressed = {};
  const handleKeyDown = e => {
    key_pressed[e.key] = true;
  };

  const handleKeyUp = e => {
    if (when !== 'nomal') {
      let command = isMac() ? 'Mac' : 'Windows';
      for (let key in key_pressed) {
        if (key_pressed[key]) {
          command += `.${key}`;
        }
      }
      onCommand(SystemKeyboardCommandTypes[command]);
    }
    key_pressed[e.key] = false;
  };
  return (
    <div onKeyDown={handleKeyDown} onKeyUp={handleKeyUp}>
      {children}
    </div>
  );
};
