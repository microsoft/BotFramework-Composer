// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { render } from '@bfc/test-utils';
import { ExtensionContext } from '@bfc/extension';

import AdaptiveFlowEditor from '../../src/adaptive-flow-editor/AdaptiveFlowEditor';

describe('<VisualDesigner/>', () => {
  const fn = () => ({} as any);
  const fnList = () => [] as any[];
  const fnPromise = () => Promise.resolve({} as any);

  it('can render.', () => {
    const visualDesigner = render(
      <ExtensionContext.Provider
        value={{
          shellApi: {
            getDialog: fn,
            saveDialog: fn,
            saveData: fn,
            navTo: fn,
            onFocusSteps: fn,
            onFocusEvent: fn,
            onSelect: fn,
            getLgTemplates: fnList,
            copyLgTemplate: fnPromise,
            addLgTemplate: fnPromise,
            updateLgTemplate: fnPromise,
            removeLgTemplate: fnPromise,
            removeLgTemplates: fnPromise,
            getLuIntent: fn,
            getLuIntents: fnList,
            addLuIntent: fnPromise,
            updateLuIntent: fnPromise,
            removeLuIntent: fn,
            updateRegExIntent: fn,
            createDialog: fnPromise,
            addCoachMarkRef: fn,
            onCopy: fn,
            undo: fn,
            redo: fn,
            updateUserSettings: fn,
            addSkillDialog: fnPromise,
            announce: fn,
            displayManifestModal: fn,
          },
          shellData: {} as any,
          plugins: [],
        }}
      >
        <AdaptiveFlowEditor />
      </ExtensionContext.Provider>
    );
    expect(visualDesigner).toBeTruthy();
  });
});
