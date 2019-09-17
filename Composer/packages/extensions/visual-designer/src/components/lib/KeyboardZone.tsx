/** @jsx jsx */
import { jsx } from '@emotion/core';
import { FC, useRef } from 'react';

import { findCommand } from '../../constants/KeyboardCommandTypes';

interface NodeProps {
  when: string;
  onCommand: (action) => object | void;
}

const isMac = () => {
  return /macintosh|mac os x/i.test(navigator.userAgent);
};
export const KeyboardZone: FC<NodeProps> = ({ when, onCommand, children }): JSX.Element => {
  const keyPressed = useRef({});
  const handleKeyDown = e => {
    keyPressed.current[e.key] = true;
  };

  const handleKeyUp = e => {
    if (when !== 'normal') {
      let keyCode = isMac() ? 'Mac' : 'Windows';
      for (const key in keyPressed.current) {
        if (keyPressed.current[key]) {
          keyCode += `.${key}`;
        }
      }
      onCommand(findCommand(keyCode));
    }
    keyPressed.current[e.key] = false;
  };
  return (
    <div onKeyDown={handleKeyDown} onKeyUp={handleKeyUp}>
      {children}
    </div>
  );
};
