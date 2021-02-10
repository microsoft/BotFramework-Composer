// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';

import { renderWithRecoil } from '../../testUtils';
import LGPage from '../../../src/pages/language-generation/LGPage';
import TableView from '../../../src/pages/language-generation/table-view';
import CodeEditor from '../../../src/pages/language-generation/code-editor';
import {
  localeState,
  lgFilesSelectorFamily,
  settingsState,
  schemasState,
  dialogsSelectorFamily,
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
  dialogs: [
    { id: '1', content: '', diagnostics: [], skills: [] },
    { id: '2', content: '', diagnostics: [], skills: [] },
  ],
  locale: 'en-us',
  lgFiles: [
    { id: 'a.en-us', content: initialContent, templates: initialTemplates, diagnostics: [] },
    { id: 'a.fr-fr', content: initialContent, templates: initialTemplates, diagnostics: [] },
  ],

  settings: {
    defaultLanguage: 'en-us',
    languages: ['en-us', 'fr-fr'],
  },
};

const initRecoilState = ({ set }) => {
  set(currentProjectIdState, state.projectId);
  set(localeState(state.projectId), state.locale);
  set(dialogsSelectorFamily(state.projectId), state.dialogs);
  set(lgFilesSelectorFamily(state.projectId), state.lgFiles);
  set(settingsState(state.projectId), state.settings);
  set(schemasState(state.projectId), mockProjectResponse.schemas);
};

describe('LG page all up view', () => {
  it('should render lg page table view', () => {
    const { getByText, getByTestId } = renderWithRecoil(
      <TableView dialogId={'a'} projectId={state.projectId} />,
      initRecoilState
    );
    getByTestId('table-view');
    getByText('Name');
  });

  it('should render lg page code editor', () => {
    renderWithRecoil(<CodeEditor dialogId={'a'} projectId={state.projectId} />, initRecoilState);
  });

  it('should render lg page', () => {
    const { getByTestId } = renderWithRecoil(<LGPage dialogId={'a'} projectId={state.projectId} />, initRecoilState);
    getByTestId('LGPage');
  });
});
