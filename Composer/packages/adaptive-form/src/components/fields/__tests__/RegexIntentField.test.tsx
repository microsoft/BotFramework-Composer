// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { render, fireEvent } from '@botframework-composer/test-utils';
import assign from 'lodash/assign';
import { useShellApi } from '@bfc/extension-client';

import { RegexIntentField } from '../RegexIntentField';

import { fieldProps } from './testUtils';

jest.mock('@bfc/extension-client', () => ({
  useShellApi: jest.fn(),
}));

function renderSubject(overrides = {}, shellOverrides = {}) {
  (useShellApi as jest.Mock).mockReturnValue(
    assign(
      {},
      {
        currentDialog: {
          content: { recognizer: undefined },
        },
        shellApi: {
          updateRegExIntent: jest.fn(),
        },
        focusedSteps: [],
      },
      shellOverrides
    )
  );

  const props = assign({}, fieldProps(), overrides);
  return render(<RegexIntentField {...props} />);
}

describe('<RegexIntentField />', () => {
  it('renders a string field with the pattern of the current intent', () => {
    const intents = [
      {
        intent: 'FirstIntent',
        pattern: 'first-pattern',
      },
      {
        intent: 'SecondIntent',
        pattern: 'second-pattern',
      },
    ];
    const dialog = {
      recognizer: {
        intents,
      },
    };
    const updateRegExIntent = jest.fn();
    const { getByDisplayValue } = renderSubject(
      { value: 'FirstIntent' },
      { shellApi: { updateRegExIntent }, currentDialog: { id: 'current-dialog-id', content: dialog } }
    );

    const input = getByDisplayValue('first-pattern');
    expect(input).toBeInTheDocument();

    fireEvent.change(input, { target: { value: 'new-pattern' } });
    expect(updateRegExIntent).toHaveBeenCalledWith('current-dialog-id', 'FirstIntent', 'new-pattern');
  });

  it('still renders if no intents found', () => {
    const { container } = renderSubject(
      { value: 'FirstIntent' },
      { currentDialog: { id: 'current-dialog-id', content: {} } }
    );

    expect(container).not.toBeEmptyDOMElement();
  });
});
