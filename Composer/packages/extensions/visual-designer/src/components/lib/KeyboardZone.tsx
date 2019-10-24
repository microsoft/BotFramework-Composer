/** @jsx jsx */
import { jsx } from '@emotion/core';
import { FC } from 'react';

import { mapShortcutToKeyboardCommand } from '../../constants/KeyboardCommandTypes';

const KeyNameByModifierAttr = {
  ctrlKey: 'Control',
  metaKey: 'Meta',
  altKey: 'Alt',
  shiftKey: 'Shift',
};

const overriddenKeyCodes = ['Tab', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];

interface KeyboardZoneProps {
  when: string;
  onCommand: (action, e: KeyboardEvent) => object | void;
}

const isMac = () => {
  return /macintosh|mac os x/i.test(navigator.userAgent);
};

const buildModifierKeyPrefix = (e: KeyboardEvent): string => {
  let prefix = isMac() ? 'Mac.' : 'Windows.';
  ['ctrlKey', 'metaKey', 'altKey', 'shiftKey'].forEach(modifierAttr => {
    if (e[modifierAttr]) {
      prefix += `${KeyNameByModifierAttr[modifierAttr]}.`;
    }
  });
  return prefix;
};

export const KeyboardZone: FC<KeyboardZoneProps> = ({ when, onCommand, children }): JSX.Element => {
  const handleKeyDown = e => {
    if (overriddenKeyCodes.includes(e.key)) {
      e.preventDefault();
      e.stopPropagation();
    }

    const modifierPrefix = buildModifierKeyPrefix(e);
    const shortcut = modifierPrefix + e.key;
    onCommand(mapShortcutToKeyboardCommand(shortcut), e);
  };

  return (
    <div onKeyDown={handleKeyDown} tabIndex={0} data-test-id="keyboard-zone">
      {children}
    </div>
  );
};
