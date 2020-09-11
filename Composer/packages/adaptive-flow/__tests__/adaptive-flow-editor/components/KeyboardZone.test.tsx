// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { render, fireEvent } from '@bfc/test-utils';

import { enableKeyboardCommandAttributes } from '../../../src/adaptive-flow-editor/components/KeyboardZone';

const KeyboardZone = ({ onCommand, children }) => {
  return (
    <div data-testid="keyboard-zone" tabIndex={0} {...enableKeyboardCommandAttributes(onCommand)}>
      {children}
    </div>
  );
};

describe('KeyboardZone', () => {
  it('can be rendered.', () => {
    const zone = render(
      <KeyboardZone onCommand={() => undefined}>
        <span data-testid="zone-child">children</span>
      </KeyboardZone>
    );
    expect(zone).toBeTruthy();
    expect(zone.getByTestId('zone-child')).toBeTruthy();
  });

  it('can trigger onCommand.', () => {
    const mockOnCommand = jest.fn();
    const zone = render(
      <KeyboardZone onCommand={mockOnCommand}>
        <span data-testid="zone-child">children</span>
      </KeyboardZone>
    ).getByTestId('keyboard-zone');

    fireEvent.focus(zone);
    fireEvent.keyDown(
      zone,
      new KeyboardEvent('keydown', {
        key: 'C',
        code: 'C',
        ctrlKey: true,
      })
    );
    expect(mockOnCommand).toHaveBeenCalled();
  });
});
