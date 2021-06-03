// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import { fireEvent } from '@botframework-composer/test-utils';

import { renderWithRecoil } from '../testUtils';
import { SAMPLE_DIALOG } from '../mocks/sampleDialog';
import { ProjectTree } from '../../src/components/ProjectTree/ProjectTree';
import { TriggerCreationModal } from '../../src/components/TriggerCreationModal';
import { CreateDialogModal } from '../../src/pages/design/createDialogModal';
import {
  dialogsSelectorFamily,
  currentProjectIdState,
  botProjectIdsState,
  schemasState,
  projectMetaDataState,
  botProjectFileState,
} from '../../src/recoilModel';

jest.mock('@bfc/code-editor', () => {
  return {
    LuEditor: () => <div></div>,
  };
});
const projectId = '12345.6789';
const dialogs = [SAMPLE_DIALOG];

const initRecoilState = ({ set }) => {
  set(currentProjectIdState, projectId);
  set(botProjectIdsState, [projectId]);
  set(dialogsSelectorFamily(projectId), dialogs);
  set(schemasState(projectId), { sdk: { content: {} } });
  set(projectMetaDataState(projectId), { isRootBot: true });
  set(botProjectFileState(projectId), { foo: 'bar' });
};

describe('<ProjectTree/>', () => {
  it('should render the ProjectTree', async () => {
    const handleSelect = jest.fn(() => {});
    const handleDeleteDialog = jest.fn(() => {});
    const handleDeleteTrigger = jest.fn(() => {});

    const { findByTestId } = renderWithRecoil(
      <ProjectTree
        onBotDeleteDialog={handleDeleteDialog}
        onDialogDeleteTrigger={handleDeleteTrigger}
        onSelect={handleSelect}
      />,
      initRecoilState
    );
    const node = await findByTestId('EchoBot-1_Greeting');
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
      <CreateDialogModal isOpen={isOpen} projectId={projectId} onDismiss={handleDismiss} onSubmit={handleSubmit} />
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
      <TriggerCreationModal
        dialogId={'todobot'}
        isOpen={isOpen}
        projectId={projectId}
        onDismiss={handleDismiss}
        onSubmit={handleSubmit}
      />
    );
    const cancelButton = getByText('Cancel');
    fireEvent.click(cancelButton);
    expect(isOpen).toBe(false);
  });
});
