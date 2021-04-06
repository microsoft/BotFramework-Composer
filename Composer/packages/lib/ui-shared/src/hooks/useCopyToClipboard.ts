// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';

/**
 * Creates a textarea at then end of the document body then
 * uses that to copy the specified text to the cliboard.
 */

export const copyToClipboard = (text: string) => {
  // Remember the current selection
  const rangeCount = document.getSelection()?.rangeCount || 0;
  const selected = rangeCount > 0 ? document.getSelection()?.getRangeAt(0) : false;

  // Create an offscreen textarea and copy the text
  const element = document.createElement('textarea');
  element.value = text;
  element.setAttribute('readonly', '');
  element.style.position = 'absolute';
  element.style.left = '-9999px';
  document.body.appendChild(element);
  element.select();
  const success = document.execCommand('copy');
  document.body.removeChild(element);

  // Restore the previous selection
  if (selected) {
    document.getSelection()?.removeAllRanges();
    document.getSelection()?.addRange(selected);
  }

  if (!success) {
    throw new Error('There was a problem copying to the clipboard.');
  }
};

/**
 * Hook to copy text to the clipboard.
 */
export const useCopyToClipboard = (text: string) => {
  const [isCopiedToClipboard, setIsCopiedToClipboard] = React.useState(false);

  const copyTextToClipboard = React.useCallback(() => {
    copyToClipboard(text);
    setIsCopiedToClipboard(true);
  }, [text]);

  const resetIsCopiedToClipboard = React.useCallback(() => setIsCopiedToClipboard(false), []);

  // When the text changes, reset copied.
  React.useEffect(() => () => resetIsCopiedToClipboard(), [text]);

  return { isCopiedToClipboard, copyTextToClipboard, resetIsCopiedToClipboard };
};
