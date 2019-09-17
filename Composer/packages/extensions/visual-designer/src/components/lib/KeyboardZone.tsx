/** @jsx jsx */
import { jsx } from '@emotion/core';
import { FC, useState } from 'react';

import { findCommand } from '../../constants/KeyboardCommandTypes';

interface NodeProps {
  when: string;
  onCommand: (action) => object | void;
}

const isMac = () => {
  return /macintosh|mac os x/i.test(navigator.userAgent);
};
export const KeyboardZone: FC<NodeProps> = ({ when, onCommand, children }): JSX.Element => {
  const [keyPressed, setKeyPressed] = useState({});
  const handleKeyDown = e => {
    if (e.key === 'Tab') {
      e.preventDefault();
      e.stopPropagation();
    }
    setKeyPressed({ ...keyPressed, [e.key]: true });
  };

  const handleKeyUp = e => {
    if (when !== 'normal') {
      let keyCode = isMac() ? 'Mac' : 'Windows';
      for (const key in keyPressed) {
        if (keyPressed[key]) {
          keyCode += `.${key}`;
        }
      }
      console.log(keyCode);
      onCommand(findCommand(keyCode));
    }
    delete keyPressed[e.key];
    setKeyPressed(keyPressed);
  };
  return (
    <div onKeyDown={handleKeyDown} onKeyUp={handleKeyUp}>
      {children}
    </div>
  );
};
