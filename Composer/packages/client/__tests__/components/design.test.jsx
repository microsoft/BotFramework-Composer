// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import { render, fireEvent } from '@bfc/test-utils';

import { renderWithStore } from '../testUtils';
import { dialogs } from '../constants.json';
import { ProjectTree } from '../../src/components/ProjectTree/ProjectTree';

import { TriggerCreationModal } from './../../src/components/ProjectTree/TriggerCreationModal';
import { CreateDialogModal } from './../../src/pages/design/createDialogModal';

jest.mock('@bfc/code-editor', () => {
  return {
    LuEditor: () => <div></div>,
  };
});

describe('<ProjectTree/>', () => {
  it('should render the ProjectTree', async () => {
    const dialogId = 'todobot';
    const selected = 'triggers[0]';
    const handleSelect = jest.fn(() => {});
    const handleAddDialog = jest.fn(() => {});
    const handleDeleteDialog = jest.fn(() => {});
    const handleDeleteTrigger = jest.fn(() => {});
    const openNewTriggerModal = jest.fn(() => {});
    const { findByText } = renderWithStore(
      <ProjectTree
        dialogId={dialogId}
        dialogs={dialogs}
        openNewTriggerModal={openNewTriggerModal}
        selected={selected}
        onAdd={handleAddDialog}
        onDeleteDialog={handleDeleteDialog}
        onDeleteTrigger={handleDeleteTrigger}
        onSelect={handleSelect}
      />
    );
    const node = await findByText('addtodo');
    fireEvent.click(node);
    expect(handleSelect).toHaveBeenCalledTimes(1);
  });

  it('should open CreateDialog Modal, close after clicking cancel', async () => {
    let isOpen = true;
    const handleDismiss = jest.fn(() => {
      isOpen = false;
    });
    const handleSubmit = jest.fn(() => {});
    const { getByText } = render(
      <CreateDialogModal isOpen={isOpen} onDismiss={handleDismiss} onSubmit={handleSubmit} />
    );
    const cancelButton = getByText('Cancel');
    fireEvent.click(cancelButton);
    expect(isOpen).toBe(false);
  });

  it('should open the TriggerCreationModal, close after clicking cancel', async () => {
    let isOpen = true;
    const handleDismiss = jest.fn(() => {
      isOpen = false;
    });
    const handleSubmit = jest.fn(() => {});
    const { getByText } = render(
      <TriggerCreationModal dialogId={'todobot'} isOpen={isOpen} onDismiss={handleDismiss} onSubmit={handleSubmit} />
    );
    const cancelButton = getByText('Cancel');
    fireEvent.click(cancelButton);
    expect(isOpen).toBe(false);
  });
});
