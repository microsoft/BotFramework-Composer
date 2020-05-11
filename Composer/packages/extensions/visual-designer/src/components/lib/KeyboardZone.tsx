// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { FC } from 'react';

import { mapShortcutToKeyboardCommand } from '../../constants/KeyboardCommandTypes';

const styles = css`
  position: relative;

  &:focus {
    outline: none;

    &::after {
      content: '';
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;
      border: 1px solid black;
    }
  }
`;

const KeyNameByModifierAttr = {
  ctrlKey: 'Control',
  metaKey: 'Meta',
  altKey: 'Alt',
  shiftKey: 'Shift',
};

const overriddenKeyCodes = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];

interface KeyboardZoneProps {
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

export const KeyboardZone: FC<KeyboardZoneProps> = ({ onCommand, children }): JSX.Element => {
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
    <div onKeyDown={handleKeyDown} tabIndex={0} data-test-id="keyboard-zone" css={styles}>
      {children}
    </div>
  );
};
