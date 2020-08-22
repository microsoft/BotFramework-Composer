// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';

import { renderWithRecoil } from '../../testUtils';
import TableView from '../../../src/pages/language-generation/table-view';
import CodeEditor from '../../../src/pages/language-generation/code-editor';
import {
  projectIdState,
  localeState,
  luFilesState,
  lgFilesState,
  settingsState,
  schemasState,
  dialogsState,
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
  set(projectIdState, state.projectId);
  set(localeState, state.locale);
  set(dialogsState, state.dialogs);
  set(luFilesState, state.luFiles);
  set(lgFilesState, state.lgFiles);
  set(settingsState, state.settings);
  set(schemasState, mockProjectResponse.schemas);
};

describe('LG page all up view', () => {
  it('should render lg page table view', () => {
    const { getByText, getByTestId } = renderWithRecoil(<TableView dialogId={'a'} />, initRecoilState);
    getByTestId('table-view');
    getByText('Name');
  });

  it('should render lg page code editor', () => {
    renderWithRecoil(<CodeEditor dialogId={'a'} />, initRecoilState);
  });
});
