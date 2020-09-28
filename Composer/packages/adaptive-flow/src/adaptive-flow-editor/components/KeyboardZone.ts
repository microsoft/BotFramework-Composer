// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { DOMAttributes } from 'react';

import { mapShortcutToKeyboardCommand } from '../constants/KeyboardCommandTypes';

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

const isMac = () => {
  return /macintosh|mac os x/i.test(navigator.userAgent);
};

const buildModifierKeyPrefix = (e: React.KeyboardEvent): string => {
  let prefix = isMac() ? 'Mac.' : 'Windows.';
  ['ctrlKey', 'metaKey', 'altKey', 'shiftKey'].forEach((modifierAttr) => {
    if (e[modifierAttr]) {
      prefix += `${KeyNameByModifierAttr[modifierAttr]}.`;
    }
  });
  return prefix;
};

export type KeyboardCommandHandler = (action: KeyboardCommand, e: React.KeyboardEvent) => object | void;

export const enableKeyboardCommandAttributes = (onCommand: KeyboardCommandHandler): DOMAttributes<HTMLDivElement> => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (overriddenKeyCodes.includes(e.key)) {
      e.preventDefault();
      e.stopPropagation();
    }

    const modifierPrefix = buildModifierKeyPrefix(e);
    const shortcut = modifierPrefix + e.key;
    onCommand(mapShortcutToKeyboardCommand(shortcut), e);
  };
  return {
    onKeyDown: handleKeyDown,
  };
};
