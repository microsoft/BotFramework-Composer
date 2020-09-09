// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { render, fireEvent } from '@bfc/test-utils';
import assign from 'lodash/assign';
import { useShellApi, useRecognizerConfig } from '@bfc/extension';

import { IntentField } from '../IntentField';

import { fieldProps } from './testUtils';

jest.mock('@bfc/extension', () => ({
  useShellApi: jest.fn(),
  useRecognizerConfig: jest.fn(),
}));

function renderSubject(overrides = {}) {
  const props = assign({}, fieldProps(), overrides);
  return render(<IntentField {...props} />);
}

describe('<IntentField />', () => {
  beforeEach(() => {
    (useRecognizerConfig as jest.Mock).mockReturnValue([
      {
        id: 'TestRecognizer',
        isSelected: (data) => data?.$kind === 'TestRecognizer',
        editor: ({ id, onChange }) => (
          <div id={id}>
            Test Recognizer <button onClick={onChange}>Update</button>
          </div>
        ),
      },
      {
        id: 'OtherRecognizer',
        isSelected: (data) => data?.$kind === 'OtherRecognizer',
      },
    ]);
  });

  it('uses a custom label', () => {
    (useShellApi as jest.Mock).mockReturnValue({
      currentDialog: { content: { recognizer: { $kind: 'TestRecognizer' } } },
    });

    const { getByLabelText } = renderSubject({ value: 'MyIntent' });
    expect(getByLabelText('Trigger phrases (intent: #MyIntent)')).toBeInTheDocument();
  });

  it('invokes change handler with intent name', () => {
    (useShellApi as jest.Mock).mockReturnValue({
      currentDialog: { content: { recognizer: { $kind: 'TestRecognizer' } } },
    });
    const onChange = jest.fn();

    const { getByText } = renderSubject({ onChange, value: 'MyIntent' });
    fireEvent.click(getByText('Update'));
    expect(onChange).toHaveBeenCalledWith('MyIntent');
  });

  it('renders message when editor not defined', () => {
    (useShellApi as jest.Mock).mockReturnValue({
      currentDialog: { content: { recognizer: { $kind: 'OtherRecognizer' } } },
    });

    const { container } = renderSubject({ value: 'MyIntent' });

    expect(container).toHaveTextContent(/No Editor for OtherRecognizer/);
  });
});
