// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import { render, fireEvent } from 'react-testing-library';

import { renderWithStore } from '../testUtils';
import { dialogs } from '../constants.json';

import { TriggerCreationModal } from './../../src/components/ProjectTree/TriggerCreationModal';
import { ProjectTree } from './../../src/components/ProjectTree';
import NewDialogModal from './../../src/pages/design/new-dialog-modal';
describe('<ProjectTree/>', () => {
  it('should render the ProjectTree', async () => {
    const dialogId = 'Main';
    const selected = 'triggers[0]';
    const handleSelect = jest.fn(() => {});
    const handleAddDialog = jest.fn(() => {});
    const handleDeleteDialog = jest.fn(() => {});
    const handleDeleteTrigger = jest.fn(() => {});
    const openNewTriggerModal = jest.fn(() => {});
    const { findByText } = renderWithStore(
      <ProjectTree
        dialogs={dialogs}
        dialogId={dialogId}
        selected={selected}
        onSelect={handleSelect}
        onAdd={handleAddDialog}
        onDeleteDialog={handleDeleteDialog}
        onDeleteTrigger={handleDeleteTrigger}
        openNewTriggerModal={openNewTriggerModal}
      />
    );
    const node = await findByText('AddToDo');
    fireEvent.click(node);
    expect(handleSelect).toHaveBeenCalledTimes(1);
  });

  it('should open NewDialogModal, close after clicking cancel', async () => {
    let isOpen = true;
    const handleDismiss = jest.fn(() => {
      isOpen = false;
    });
    const handleSubmit = jest.fn(() => {});
    const { getByText } = render(
      <NewDialogModal isOpen={isOpen} onDismiss={handleDismiss} onSubmit={handleSubmit} onGetErrorMessage={() => {}} />
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
      <TriggerCreationModal dialogId={'Main'} isOpen={isOpen} onDismiss={handleDismiss} onSubmit={handleSubmit} />
    );
    const cancelButton = getByText('Cancel');
    fireEvent.click(cancelButton);
    expect(isOpen).toBe(false);
  });
});
