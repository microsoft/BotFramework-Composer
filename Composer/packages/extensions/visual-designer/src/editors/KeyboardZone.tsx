/** @jsx jsx */
import { jsx } from '@emotion/core';
import { FC } from 'react';

import { KeyboardCommandTypes } from '../constants/KeyboardCommandTypes';
interface NodeProps {
  when: string;
  onCommand: (action) => object | void;
}

const isMac = () => {
  return /macintosh|mac os x/i.test(navigator.userAgent);
};
export const KeyboardZone: FC<NodeProps> = ({ when, onCommand, children }): JSX.Element => {
  const handleKeyDown = e => {
    const keyName = e.key;

    switch (when) {
      case 'focused':
        if (keyName.includes('Arrow')) {
          onCommand(KeyboardCommandTypes[keyName.substr(5)]);
        } else if (keyName === 'c' && ((isMac() && e.metaKey) || (!isMac() && e.ctrlKey))) {
          onCommand(KeyboardCommandTypes.Copy);
        } else if (keyName === 'Delete') {
          onCommand(KeyboardCommandTypes.Delete);
        } else if (keyName === 'v' && ((isMac() && e.metaKey) || (!isMac() && e.ctrlKey))) {
          onCommand(KeyboardCommandTypes.Paste);
        }
        break;
      case 'selected':
        if (keyName === 'c' && ((isMac() && e.metaKey) || (!isMac() && e.ctrlKey))) {
          onCommand(KeyboardCommandTypes.Copy);
        }
        break;
      default:
        break;
    }
  };
  return <div onKeyDown={handleKeyDown}>{children}</div>;
};
