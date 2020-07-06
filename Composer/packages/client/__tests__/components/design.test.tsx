// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import { fireEvent } from '@bfc/test-utils';
import { DialogInfo } from '@bfc/shared';

import { renderWithRecoil } from '../testUtils';
import { dialogs } from '../constants.json';
import { ProjectTree } from '../../src/components/ProjectTree/ProjectTree';
import { TriggerCreationModal } from '../../src/components/ProjectTree/TriggerCreationModal';
import { CreateDialogModal } from '../../src/pages/design/createDialogModal';

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
    const handleDeleteDialog = jest.fn(() => {});
    const handleDeleteTrigger = jest.fn(() => {});
    const { findByText } = renderWithRecoil(
      <ProjectTree
        dialogId={dialogId}
        dialogs={dialogs as DialogInfo[]}
        selected={selected}
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
    const { getByText } = renderWithRecoil(
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
    const { getByText } = renderWithRecoil(
      <TriggerCreationModal dialogId={'todobot'} isOpen={isOpen} onDismiss={handleDismiss} onSubmit={handleSubmit} />
    );
    const cancelButton = getByText('Cancel');
    fireEvent.click(cancelButton);
    expect(isOpen).toBe(false);
  });
});
