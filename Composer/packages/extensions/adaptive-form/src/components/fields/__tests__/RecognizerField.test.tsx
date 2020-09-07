// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { render, fireEvent, screen } from '@bfc/test-utils';
import { useRecognizerConfig, useShellApi } from '@bfc/extension';
import assign from 'lodash/assign';

import { RecognizerField } from '../RecognizerField';

import { fieldProps } from './testUtils';

jest.mock('@bfc/extension', () => ({
  useShellApi: jest.fn(),
  useRecognizerConfig: jest.fn(),
}));

function renderSubject(overrides = {}) {
  const props = assign({}, fieldProps(), overrides);
  return render(<RecognizerField {...props} />);
}

describe('<RecognizerField />', () => {
  beforeEach(() => {
    (useShellApi as jest.Mock).mockReturnValue({
      shellApi: 'shell api',
      qnaFiles: [],
      luFiles: [],
      currentDialog: { id: 'testId' },
      other: 'data',
    });
  });

  it('renders error message when no recognizer matched', () => {
    (useRecognizerConfig as jest.Mock).mockReturnValue([]);
    const { container } = renderSubject();
    expect(container).toHaveTextContent(/Unable to determine recognizer type from data:/);
  });

  it('renders a dropdown when recognizer matches', () => {
    const handleChange = jest.fn();
    (useRecognizerConfig as jest.Mock).mockReturnValue([
      {
        id: 'one',
        displayName: 'One Recognizer',
        isSelected: () => false,
        handleRecognizerChange: handleChange,
      },
      {
        id: 'two',
        displayName: 'Two Recognizer',
        isSelected: () => true,
        handleRecognizerChange: jest.fn(),
      },
    ]);
    const { getByTestId } = renderSubject({ value: 'one' });
    const dropdown = getByTestId('recognizerTypeDropdown');
    expect(dropdown).toHaveTextContent('Two Recognizer');
    fireEvent.click(dropdown);

    fireEvent.click(screen.getByText('One Recognizer'));
    expect(handleChange).toHaveBeenCalled();
  });
});
