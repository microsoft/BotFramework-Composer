// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/* eslint-disable @typescript-eslint/no-explicit-any */

import React from 'react';
import { EditorExtension } from '@bfc/extension-client';
import { render, fireEvent, findAllByRole } from '@botframework-composer/test-utils';

import { SchemaEditorField } from '../Fields/SchemaEditorField';

const renderSchemaEditor = ({ updateDialogSchema = jest.fn() } = {}) => {
  const api: any = {
    updateDialogSchema,
  };

  const data: any = {
    dialogs: [{ displayName: 'test', id: 'test_id' }],
    dialogSchemas: [],
    dialogId: 'test_id',
  };

  const shell: any = {
    api,
    data,
  };

  return render(
    <EditorExtension plugins={{}} shell={shell}>
      <SchemaEditorField />
    </EditorExtension>
  );
};

describe('Schema Editor', () => {
  it('adds value property', async () => {
    const updateDialogSchema = jest.fn();
    const { baseElement, findAllByText, findByLabelText, getByPlaceholderText } = renderSchemaEditor({
      updateDialogSchema,
    });
    const [add] = await findAllByText('Add new');

    add.click();

    const propertyNameInput = getByPlaceholderText('Add a new key');
    propertyNameInput.focus();
    fireEvent.change(propertyNameInput, { target: { value: 'propertyName' } });
    propertyNameInput.blur();

    const listbox = await findByLabelText('Type');
    fireEvent.click(listbox);

    const options = await findAllByRole(baseElement, 'option');
    fireEvent.click(options[options.length - 1]);

    expect(updateDialogSchema).toHaveBeenLastCalledWith(
      expect.objectContaining({
        id: 'test_id',
        content: expect.objectContaining({
          title: 'test',
          properties: expect.objectContaining({
            propertyName: {
              title: 'Property Name',
              $ref: '#/definitions/valueExpression',
            },
          }),
          definitions: expect.objectContaining({
            valueExpression: expect.any(Object),
            equalsExpression: expect.any(Object),
          }),
        }),
      })
    );
  });

  it('adds result property', async () => {
    const updateDialogSchema = jest.fn();
    const { baseElement, findAllByText, findByLabelText, getByPlaceholderText } = renderSchemaEditor({
      updateDialogSchema,
    });
    const [, add] = await findAllByText('Add new');

    add.click();

    const propertyNameInput = getByPlaceholderText('Add a new key');
    propertyNameInput.focus();
    fireEvent.change(propertyNameInput, { target: { value: 'propertyName' } });
    propertyNameInput.blur();

    const listbox = await findByLabelText('Type');
    fireEvent.click(listbox);

    const options = await findAllByRole(baseElement, 'option');
    fireEvent.click(options[1]);

    expect(updateDialogSchema).toHaveBeenLastCalledWith(
      expect.objectContaining({
        id: 'test_id',
        content: expect.objectContaining({
          title: 'test',
          $result: expect.objectContaining({
            properties: expect.objectContaining({
              propertyName: {
                title: 'Property Name',
                type: 'array',
              },
            }),
          }),
        }),
      })
    );
  });
});
