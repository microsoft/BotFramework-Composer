// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';

import TableView from '../../../src/pages/language-understanding/table-view';
import CodeEditor from '../../../src/pages/language-understanding/code-editor';
import { renderWithRecoil } from '../../testUtils';
import {
  localeState,
  dialogsState,
  luFilesState,
  lgFilesState,
  settingsState,
  schemasState,
  currentProjectIdState,
} from '../../../src/recoilModel';
import mockProjectResponse from '../../../src/recoilModel/dispatchers/__tests__/mocks/mockProjectResponse.json';

const initialContent = `
# Greeting
- hello
`;

const state = {
  projectId: 'test',
  dialogs: [{ id: '1' }, { id: '2' }],
  locale: 'en-us',
  lgFiles: [
    { id: 'a.en-us', content: initialContent },
    { id: 'a.fr-fr', content: initialContent },
  ],
  luFiles: [
    { id: 'a.en-us', content: initialContent },
    { id: 'a.fr-fr', content: initialContent },
  ],
  settings: {
    defaultLanguage: 'en-us',
    languages: ['en-us', 'fr-fr'],
  },
};

const initRecoilState = ({ set }) => {
  set(currentProjectIdState, state.projectId);
  set(localeState(state.projectId), state.locale);
  set(dialogsState(state.projectId), state.dialogs);
  set(luFilesState(state.projectId), state.luFiles);
  set(lgFilesState(state.projectId), state.lgFiles);
  set(settingsState(state.projectId), state.settings);
  set(schemasState(state.projectId), mockProjectResponse.schemas);
};

describe('LU page all up view', () => {
  it('should render lu page table view', () => {
    const { getByText, getByTestId } = renderWithRecoil(<TableView dialogId={'a'} />, initRecoilState);
    getByTestId('table-view');
    getByText('Intent');
  });

  it('should render lu page code editor', () => {
    renderWithRecoil(<CodeEditor dialogId={'a'} projectId={state.projectId} />, initRecoilState);
  });
});
