// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { render } from '@botframework-composer/test-utils';
import { EditorExtensionContext } from '@bfc/extension-client';

import AdaptiveFlowEditor from '../../src/adaptive-flow-editor/AdaptiveFlowEditor';

import { ShellApiStub } from './stubs/ShellApiStub';

describe('<VisualDesigner/>', () => {
  it('can render.', () => {
    const visualDesigner = render(
      <EditorExtensionContext.Provider
        value={{
          shellApi: ShellApiStub,
          shellData: {} as any,
          plugins: [],
        }}
      >
        <AdaptiveFlowEditor />
      </EditorExtensionContext.Provider>
    );
    expect(visualDesigner).toBeTruthy();
  });
});
