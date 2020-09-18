// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { render, fireEvent, screen } from '@bfc/test-utils';
import { useRecognizerConfig, useShellApi } from '@bfc/extension-client';
import assign from 'lodash/assign';

import { RecognizerField } from '../RecognizerField';

import { fieldProps, mockRecognizerConfig } from './testUtils';

jest.mock('@bfc/extension-client', () => ({
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

  it('renders a dropdown when recognizer matches', () => {
    const handleChange = jest.fn();
    const config = mockRecognizerConfig([
      {
        id: 'one',
        displayName: 'One Recognizer',
        isSelected: () => false,
        seedNewRecognizer: handleChange,
      },
      {
        id: 'two',
        displayName: 'Two Recognizer',
        isSelected: () => true,
        seedNewRecognizer: jest.fn(),
      },
    ]);
    (useRecognizerConfig as jest.Mock).mockReturnValue(config);
    const { getByTestId } = renderSubject({ value: { $kind: 'two' } });
    const dropdown = getByTestId('recognizerTypeDropdown');
    expect(dropdown).toHaveTextContent('Two Recognizer');
    fireEvent.click(dropdown);

    fireEvent.click(screen.getByText('One Recognizer'));
    expect(handleChange).toHaveBeenCalled();
  });
});
