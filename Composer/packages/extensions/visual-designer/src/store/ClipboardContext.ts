import React from 'react';

export const ClipboardContext = React.createContext({
  clipboardActions: [],
  setClipboardActions: actions => {},
});
