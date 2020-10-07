// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { isMac } from 'office-ui-fabric-react/lib/Utilities';
import * as React from 'react';
import { useUndo } from 'src/undo/useUndo';
import { useKeyBinding } from 'src/utils/hooks/useKeyBinding';

export const useUndoKeyBinding = () => {
  const { canRedo, canUndo, redo, undo } = useUndo();
  const callback = React.useCallback(
    (e: KeyboardEvent) => {
      if ((isMac() && e.metaKey) || e.ctrlKey) {
        switch (e.key.toLowerCase()) {
          case 'z': {
            if (e.shiftKey) {
              e.preventDefault();
              canRedo() && redo();
            } else {
              e.preventDefault();
              canUndo() && undo();
            }
          }
        }
      }
    },
    [undo, redo, canRedo, canUndo]
  );

  useKeyBinding('keydown', callback);
};
