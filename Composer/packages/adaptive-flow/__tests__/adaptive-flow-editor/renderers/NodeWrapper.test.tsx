// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { render, fireEvent } from '@bfc/test-utils';
import ExtensionContext from '@bfc/extension/lib/extensionContext';

import { ActionNodeWrapper } from '../../../src/adaptive-flow-editor/renderers/NodeWrapper';
import { ShellApiStub } from '../stubs/ShellApiStub';

describe('<ActionNodeWrapper>', () => {
  it('can render.', () => {
    const mockOnEvent = jest.fn();
    const ele = render(
      <ExtensionContext.Provider
        value={{
          shellApi: ShellApiStub,
          shellData: {} as any,
          plugins: [],
        }}
      >
        <ActionNodeWrapper data={{}} id="test" onEvent={mockOnEvent} />
      </ExtensionContext.Provider>
    );
    expect(ele.getByTestId('ActionNodeWrapper')).toBeTruthy();

    fireEvent.click(ele.getByTestId('ActionNodeWrapper'));
    expect(mockOnEvent).toHaveBeenCalled();
  });
});
