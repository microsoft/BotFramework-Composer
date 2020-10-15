// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { render, fireEvent } from '@botframework-composer/test-utils';
import { EditorExtensionContext } from '@bfc/extension-client';

import { ActionNodeWrapper } from '../../../src/adaptive-flow-editor/renderers/NodeWrapper';
import { ShellApiStub } from '../stubs/ShellApiStub';

describe('<ActionNodeWrapper>', () => {
  it('can render.', () => {
    const mockOnEvent = jest.fn();
    const ele = render(
      <EditorExtensionContext.Provider
        value={{
          shellApi: ShellApiStub,
          shellData: {} as any,
          plugins: [],
        }}
      >
        <ActionNodeWrapper data={{}} id="test" onEvent={mockOnEvent} />
      </EditorExtensionContext.Provider>
    );
    expect(ele.getByTestId('ActionNodeWrapper')).toBeTruthy();

    fireEvent.click(ele.getByTestId('ActionNodeWrapper'));
    expect(mockOnEvent).toHaveBeenCalled();
  });
});
