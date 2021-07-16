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
  botDisplayNameState,
} from '../../../src/recoilModel';
import { undoFunctionState } from '../../../src/recoilModel/undo/history';
import mockProjectResponse from '../../../src/recoilModel/dispatchers/__tests__/mocks/mockProjectResponse.json';
import DesignPage from '../../../src/pages/design/DesignPage';
import { SAMPLE_DIALOG } from '../../mocks/sampleDialog';

const projectId = '12345.6789';
const dialogId = SAMPLE_DIALOG.id;

const initRecoilState = ({ set }) => {
  set(currentProjectIdState, projectId);
  set(botProjectIdsState, [projectId]);
  set(dialogsSelectorFamily(projectId), [SAMPLE_DIALOG]);
  set(schemasState(projectId), mockProjectResponse.schemas);
  set(projectMetaDataState(projectId), { isRootBot: true });
  set(botProjectFileState(projectId), { foo: 'bar' });
  set(undoFunctionState(projectId), { canUndo: () => false, canRedo: () => false });
  set(botDisplayNameState(projectId), 'Root-Bot');
};

describe('Design page', () => {
  it('should render the design page (no skill)', () => {
    const { container } = renderWithRecoil(<DesignPage dialogId={dialogId} projectId={projectId} />, initRecoilState);
    expect(container).toBeDefined();
  });
});
