// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { render } from '@bfc/test-utils';
import { ExtensionContext } from '@bfc/extension';

import AdaptiveFlowEditor from '../../src/adaptive-flow-editor/AdaptiveFlowEditor';

import { ShellApiStub } from './stubs/ShellApiStub';

describe('<VisualDesigner/>', () => {
  it('can render.', () => {
    const visualDesigner = render(
      <ExtensionContext.Provider
        value={{
          shellApi: ShellApiStub,
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
