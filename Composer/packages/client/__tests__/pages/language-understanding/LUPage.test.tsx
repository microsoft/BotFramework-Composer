// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';

import TableView from '../../../src/pages/language-understanding/table-view';
import CodeEditor from '../../../src/pages/language-understanding/code-editor';
import { renderWithRecoil } from '../../testUtils';
import {
  projectIdState,
  localeState,
  dialogsState,
  luFilesState,
  lgFilesState,
  settingsState,
  schemasState,
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
  set(projectIdState, state.projectId);
  set(localeState, state.locale);
  set(dialogsState, state.dialogs);
  set(luFilesState, state.luFiles);
  set(lgFilesState, state.lgFiles);
  set(settingsState, state.settings);
  set(schemasState, mockProjectResponse.schemas);
};

describe('LU page all up view', () => {
  it('should render lu page table view', () => {
    const { getByText, getByTestId } = renderWithRecoil(<TableView dialogId={'a'} />, initRecoilState);
    getByTestId('table-view');
    getByText('Intent');
  });

  it('should render lu page code editor', () => {
    renderWithRecoil(<CodeEditor dialogId={'a'} />, initRecoilState);
  });
});
