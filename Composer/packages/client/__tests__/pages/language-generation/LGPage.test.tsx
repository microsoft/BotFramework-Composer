// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';

import { renderWithRecoil } from '../../testUtils';
import TableView from '../../../src/pages/language-generation/table-view';
import CodeEditor from '../../../src/pages/language-generation/code-editor';
import {
  localeState,
  luFilesState,
  lgFilesState,
  settingsState,
  schemasState,
  dialogsState,
  currentProjectIdState,
} from '../../../src/recoilModel';
import mockProjectResponse from '../../../src/recoilModel/dispatchers/__tests__/mocks/mockProjectResponse.json';

const initialContent = `
# Greeting
- hello
`;

const initialTemplates = [
  {
    name: 'Greeting',
    body: '- hello',
  },
];

const state = {
  projectId: 'test',
  dialogs: [{ id: '1' }, { id: '2' }],
  locale: 'en-us',
  lgFiles: [
    { id: 'a.en-us', content: initialContent, templates: initialTemplates },
    { id: 'a.fr-fr', content: initialContent, templates: initialTemplates },
  ],
  luFiles: [
    { id: 'a.en-us', content: initialContent, templates: initialTemplates },
    { id: 'a.fr-fr', content: initialContent, templates: initialTemplates },
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

describe('LG page all up view', () => {
  it('should render lg page table view', () => {
    const { getByText, getByTestId } = renderWithRecoil(<TableView dialogId={'a'} />, initRecoilState);
    getByTestId('table-view');
    getByText('Name');
  });

  it('should render lg page code editor', () => {
    renderWithRecoil(<CodeEditor dialogId={'a'} projectId={state.projectId} />, initRecoilState);
  });
});
