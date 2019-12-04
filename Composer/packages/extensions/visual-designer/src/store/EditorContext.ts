// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';

export interface EditorContextValue {
  focusedId?: string;
  focusedEvent?: string;
  focusedTab?: string;
}

export const EditorContext = React.createContext<EditorContextValue>({
  focusedId: '',
  focusedEvent: '',
  focusedTab: '',
});
