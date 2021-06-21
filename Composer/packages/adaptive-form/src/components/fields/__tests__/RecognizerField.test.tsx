// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { render, fireEvent, screen, getAllByText } from '@botframework-composer/test-utils';
import { useRecognizerConfig, useShellApi } from '@bfc/extension-client';
import assign from 'lodash/assign';

import { RecognizerField } from '../RecognizerField';

import { fieldProps } from './testUtils';

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
    const recognizers = [
      {
        id: 'one',
        displayName: 'One Recognizer',
        description: 'test1',
        isSelected: () => false,
        seedNewRecognizer: handleChange,
      },
      {
        id: 'two',
        displayName: 'Two Recognizer',
        description: 'test2',
        isSelected: () => true,
        seedNewRecognizer: jest.fn(),
      },
    ];
    (useRecognizerConfig as jest.Mock).mockReturnValue({
      recognizers,
      currentRecognizer: recognizers[1],
    });
    const { getByText, getAllByText } = renderSubject({ value: { $kind: 'two' } });
    // two recognizer already choosed
    expect(getByText('Two Recognizer')).not.toBeNull();

    // click change recognizer, pop up dialog
    fireEvent.click(getByText('Change'));
    expect(getByText('One Recognizer')).not.toBeNull();
    expect(getAllByText('Two Recognizer').length).toBe(2);

    fireEvent.click(screen.getByText('One Recognizer'));
    fireEvent.click(screen.getByText('Done'));
    expect(handleChange).toHaveBeenCalled();
  });
});
