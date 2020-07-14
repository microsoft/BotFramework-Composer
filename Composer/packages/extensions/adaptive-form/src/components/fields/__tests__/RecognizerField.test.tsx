// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { render, fireEvent, screen } from '@bfc/test-utils';
import assign from 'lodash/assign';

import { RecognizerField } from '../RecognizerField';
import { usePluginConfig } from '../../../hooks/usePluginConfig';

import { fieldProps } from './testUtils';

jest.mock('../../../hooks/usePluginConfig', () => ({
  usePluginConfig: jest.fn(),
}));

function renderSubject(overrides = {}) {
  const props = assign({}, fieldProps(), overrides);
  return render(<RecognizerField {...props} />);
}

describe('<RecognizerField />', () => {
  it('renders error message when no recognizer matched', () => {
    (usePluginConfig as jest.Mock).mockReturnValue({ recognizers: [] });
    const { container } = renderSubject();
    expect(container).toHaveTextContent(/Unable to determine recognizer type from data:/);
  });

  it('renders error message when multiple recognizers matched', () => {
    (usePluginConfig as jest.Mock).mockReturnValue({
      recognizers: [
        {
          id: 'one',
          isSelected: () => true,
        },
        {
          id: 'two',
          isSelected: () => true,
        },
      ],
    });
    const { container } = renderSubject();
    expect(container).toHaveTextContent(/Unable to determine recognizer type from data:/);
  });

  it('renders a dropdown when only one recognizer matches', () => {
    const handleChange = jest.fn();
    (usePluginConfig as jest.Mock).mockReturnValue({
      recognizers: [
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
      ],
    });
    const { getByTestId } = renderSubject();
    const dropdown = getByTestId('recognizerTypeDropdown');
    expect(dropdown).toHaveTextContent('Two Recognizer');
    fireEvent.click(dropdown);

    fireEvent.click(screen.getByText('One Recognizer'));
    expect(handleChange).toHaveBeenCalled();
  });
});
