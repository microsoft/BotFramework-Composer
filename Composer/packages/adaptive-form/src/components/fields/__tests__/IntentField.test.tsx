// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { render, fireEvent } from '@botframework-composer/test-utils';
import assign from 'lodash/assign';
import { useRecognizerConfig, useShellApi } from '@bfc/extension-client';

import { IntentField } from '../IntentField';

import { fieldProps } from './testUtils';

jest.mock('@bfc/extension-client', () => ({
  useShellApi: jest.fn(),
  useRecognizerConfig: jest.fn(),
}));

function renderSubject(overrides = {}) {
  const props = assign({}, fieldProps(), overrides);
  return render(<IntentField {...props} />);
}

const recognizers = [
  {
    id: 'TestRecognizer',
    displayName: 'TestRecognizer',
    intentEditor: ({ id, onChange }) => (
      <div id={id}>
        Test Recognizer <button onClick={onChange}>Update</button>
      </div>
    ),
  },
  {
    id: 'OtherRecognizer',
    displayName: 'OtherRecognizer',
  },
];

describe('<IntentField />', () => {
  it('uses a custom label', () => {
    (useRecognizerConfig as jest.Mock).mockReturnValue({
      recognizers,
      currentRecognizer: recognizers[0],
    });
    (useShellApi as jest.Mock).mockReturnValue({
      shellApi: {},
    });

    const { getByLabelText } = renderSubject({ value: 'MyIntent' });
    expect(getByLabelText('Trigger phrases')).toBeInTheDocument();
  });

  it('invokes change handler with intent name', () => {
    (useRecognizerConfig as jest.Mock).mockReturnValue({
      recognizers,
      currentRecognizer: recognizers[0],
    });

    const onChange = jest.fn();

    const { getByText } = renderSubject({ onChange, value: 'MyIntent' });
    fireEvent.click(getByText('Update'));
    expect(onChange).toHaveBeenCalledWith('MyIntent');
  });

  it('renders message when editor not defined', () => {
    (useRecognizerConfig as jest.Mock).mockReturnValue({
      recognizers,
      currentRecognizer: recognizers[1],
    });

    const { container } = renderSubject({ value: 'MyIntent' });

    expect(container).toHaveTextContent(/No Editor for OtherRecognizer/);
  });
});
