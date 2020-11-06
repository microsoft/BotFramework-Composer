// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import React from 'react';

import { renderWithRecoil } from '../../testUtils';
import {
  botProjectIdsState,
  currentProjectIdState,
  dialogsSelectorFamily,
  schemasState,
  projectMetaDataState,
  botProjectFileState,
} from '../../../src/recoilModel';
import { undoFunctionState } from '../../../src/recoilModel/undo/history';
import mockProjectResponse from '../../../src/recoilModel/dispatchers/__tests__/mocks/mockProjectResponse.json';
import DesignPage from '../../../src/pages/design/DesignPage';
import { SAMPLE_DIALOG, SAMPLE_DIALOG_2 } from '../../mocks/sampleDialog';

const projectId = '12345.6789';
const skillId = '56789.1234';
const dialogId = SAMPLE_DIALOG.id;

const initRecoilState = ({ set }) => {
  set(currentProjectIdState, projectId);
  set(botProjectIdsState, [projectId]);
  set(dialogsSelectorFamily(projectId), [SAMPLE_DIALOG]);
  set(schemasState(projectId), mockProjectResponse.schemas);
  set(projectMetaDataState(projectId), { isRootBot: true });
  set(botProjectFileState(projectId), { foo: 'bar' });
  set(undoFunctionState(projectId), { canUndo: () => false, canRedo: () => false });
};

const initRecoilStateMulti = ({ set }) => {
  set(currentProjectIdState, projectId);
  set(botProjectIdsState, [projectId, skillId]);
  set(dialogsSelectorFamily(projectId), [SAMPLE_DIALOG]);
  set(dialogsSelectorFamily(skillId), [SAMPLE_DIALOG, SAMPLE_DIALOG_2]);
  set(schemasState(projectId), mockProjectResponse.schemas);
  set(schemasState(skillId), mockProjectResponse.schemas);
  set(projectMetaDataState(projectId), { isRootBot: true });
  set(botProjectFileState(projectId), { foo: 'bar' });
  set(undoFunctionState(projectId), { canUndo: () => false, canRedo: () => false });
  set(undoFunctionState(skillId), { canUndo: () => false, canRedo: () => false });
};

describe('publish page', () => {
  it('should render the design page (no skill)', () => {
    const { getAllByText, getByText } = renderWithRecoil(
      <DesignPage dialogId={dialogId} projectId={projectId} />,
      initRecoilState
    );
    getAllByText(SAMPLE_DIALOG.displayName);
    getByText('Start Bot');
  });

  it('should render the design page (with skill)', () => {
    const { getAllByText, getByText } = renderWithRecoil(
      <DesignPage dialogId={dialogId} projectId={projectId} skillId={skillId} />,
      initRecoilStateMulti
    );
    getAllByText(SAMPLE_DIALOG.displayName);
    getAllByText(SAMPLE_DIALOG_2.displayName);
    getByText('Start Bot');
  });
});
