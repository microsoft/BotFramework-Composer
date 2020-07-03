// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import React from 'react';

import { mapShortcutToKeyboardCommand } from '../constants/KeyboardCommandTypes';

const styles = css`
  border: 1px solid transparent;

  &:focus {
    outline: none;
    border-color: black;
  }
`;

const KeyNameByModifierAttr = {
  ctrlKey: 'Control',
  metaKey: 'Meta',
  altKey: 'Alt',
  shiftKey: 'Shift',
};

const overriddenKeyCodes = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];

interface KeyboardCommand {
  area: string;
  command: string;
}

interface KeyboardZoneProps {
  onCommand: (action: KeyboardCommand, e: KeyboardEvent) => object | void;
  children: React.ReactChild;
}

const isMac = () => {
  return /macintosh|mac os x/i.test(navigator.userAgent);
};

const buildModifierKeyPrefix = (e: KeyboardEvent): string => {
  let prefix = isMac() ? 'Mac.' : 'Windows.';
  ['ctrlKey', 'metaKey', 'altKey', 'shiftKey'].forEach((modifierAttr) => {
    if (e[modifierAttr]) {
      prefix += `${KeyNameByModifierAttr[modifierAttr]}.`;
    }
  });
  return prefix;
};

export const KeyboardZone = React.forwardRef<HTMLDivElement, KeyboardZoneProps>(({ onCommand, children }, ref) => {
  const handleKeyDown = (e) => {
    if (overriddenKeyCodes.includes(e.key)) {
      e.preventDefault();
      e.stopPropagation();
    }

    const modifierPrefix = buildModifierKeyPrefix(e);
    const shortcut = modifierPrefix + e.key;
    onCommand(mapShortcutToKeyboardCommand(shortcut), e);
  };

  return (
    <div ref={ref} css={styles} data-testid="keyboard-zone" tabIndex={0} onKeyDown={handleKeyDown}>
      {children}
    </div>
  );
});
