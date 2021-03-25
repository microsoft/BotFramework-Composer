// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

// @ts-nocheck

import React from 'react';
import { fireEvent, render } from '@botframework-composer/test-utils';
import { EditorExtension } from '@bfc/extension-client';

import { DialogOptionsField } from '../DialogOptionsField';

jest.mock('@bfc/adaptive-form', () => {
  const AdaptiveForm = jest.requireActual('@bfc/adaptive-form');

  return {
    ...AdaptiveForm,
    JsonField: () => <div>Json Field</div>,
    SchemaField: () => <div>Options Form</div>,
    IntellisenseTextField: () => <div>Intellisense Text Field</div>,
  };
});

jest.mock('office-ui-fabric-react/lib/Dropdown', () => {
  const Dropdown = jest.requireActual('office-ui-fabric-react/lib/Dropdown');

  return {
    ...Dropdown,
    Dropdown: ({ onChange }) => (
      <button
        onClick={(e) => {
          onChange(e, { key: 'code' });
        }}
      >
        Switch to Json Field
      </button>
    ),
  };
});

const renderDialogOptionsField = ({ value } = {}) => {
  const props = {
    description: 'Options passed to the dialog.',
    id: 'dialog.options',
    label: 'Dialog options',
    value,
  };

  const shell = {};

  const shellData = {
    dialogs: [
      { id: 'dialog1', displayName: 'dialog1' },
      { id: 'dialog2', displayName: 'dialog2' },
      { id: 'dialog3', displayName: 'dialog3' },
    ],
    dialogSchemas: [
      {
        id: 'dialog1',
        content: {
          type: 'object',
          properties: {
            foo: {
              type: 'string',
            },
            bar: {
              type: 'number',
            },
          },
        },
      },
    ],
  };
  return render(
    <EditorExtension shell={{ api: shell, data: shellData }}>
      <DialogOptionsField {...props} />
    </EditorExtension>
  );
};

describe('DialogOptionsField', () => {
  it('should render label', async () => {
    const { findByText } = renderDialogOptionsField();
    await findByText('Dialog options');
  });
  it('should render the options form if the dialog schema is defined and options is not a string', async () => {
    const { findByText } = renderDialogOptionsField({ value: { dialog: 'dialog1', options: {} } });
    await findByText('Options Form');
  });
  it('should render the JsonField if the dialog schema is undefined and options is not a string', async () => {
    const { findByText } = renderDialogOptionsField({ value: { dialog: 'dialog2', options: {} } });
    await findByText('Json Field');
  });
  it('should render the IntellisenseTextField if options is a string', async () => {
    const { findByText } = renderDialogOptionsField({ value: { dialog: 'dialog2', options: '=user.data' } });
    await findByText('Intellisense Text Field');
  });
  it('should be able to switch between fields', async () => {
    const { findByText } = renderDialogOptionsField({
      value: { dialog: 'dialog1', options: {} },
    });

    // Should initially render Options Form
    await findByText('Options Form');

    // Switch to Json field
    const button = await findByText('Switch to Json Field');
    fireEvent.click(button);

    await findByText('Json Field');
  });
});
