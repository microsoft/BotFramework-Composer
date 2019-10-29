// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';

export const ClipboardContext = React.createContext({
  clipboardActions: [],
  setClipboardActions: _actions => {},
});
