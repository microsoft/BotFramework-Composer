// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

// @ts-nocheck

import React from 'react';
import { fireEvent, getAllByRole, render } from '@bfc/test-utils';
import { Extension } from '@bfc/extension';

import { SelectDialog } from '../SelectDialog';

const flushPromises = () => Promise.resolve();

const renderSelectDialog = ({ createDialog, navTo, onChange } = {}) => {
  const props = {
    description: 'Name of the dialog to call.',
    id: 'select.dialog',
    label: 'Dialog name',
    onChange,
  };

  const shell = {
    navTo,
    createDialog,
  };

  const shellData = {
    currentDialog: { id: 'dialog1' },
    dialogs: [
      { id: 'dialog1', displayName: 'dialog1' },
      { id: 'dialog2', displayName: 'dialog2' },
      { id: 'dialog3', displayName: 'dialog3' },
    ],
  };
  return render(
    <Extension shell={{ api: shell, data: shellData }}>
      <SelectDialog {...props} />
    </Extension>
  );
};

describe('Select Dialog', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  it('should create a new dialog', async () => {
    const createDialog = jest.fn().mockResolvedValue('newDialog');
    const navTo = jest.fn().mockResolvedValue();
    const onChange = jest.fn();

    const { baseElement, findByRole } = renderSelectDialog({ createDialog, navTo, onChange });
    const combobox = await findByRole('combobox');
    fireEvent.click(combobox);

    const dialogs = await getAllByRole(baseElement, 'option');
    fireEvent.click(dialogs[dialogs.length - 1]);

    await flushPromises();
    jest.advanceTimersByTime(1000);

    expect(createDialog);
    expect(onChange).toHaveBeenCalledWith('newDialog');
    expect(navTo).toHaveBeenCalledWith('newDialog');
  });

  it('should select dialog', async () => {
    const onChange = jest.fn();

    const { baseElement, findByRole } = renderSelectDialog({ onChange });
    const combobox = await findByRole('combobox');
    fireEvent.click(combobox);

    const [dialog] = getAllByRole(baseElement, 'option');
    fireEvent.click(dialog);

    expect(onChange).toHaveBeenCalledWith('dialog2');
  });

  it('should display label', async () => {
    const { findByText } = renderSelectDialog();
    await findByText('Dialog name');
  });
});
