// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';

import LUPage from '../../../src/pages/language-understanding/LUPage';
import TableView from '../../../src/pages/language-understanding/table-view';
import CodeEditor from '../../../src/pages/language-understanding/code-editor';
import { renderWithRecoil } from '../../testUtils';
import {
  localeState,
  dialogsSelectorFamily,
  luFilesSelectorFamily,
  settingsState,
  schemasState,
  currentProjectIdState,
} from '../../../src/recoilModel';
import mockProjectResponse from '../../../src/recoilModel/dispatchers/__tests__/mocks/mockProjectResponse.json';

const initialContent = `
# Greeting
- hello
`;

const initialIntents = [
  {
    Name: 'Greeting',
    Body: '- hello',
  },
];

const state = {
  projectId: 'test',
  dialogs: [
    { id: '1', content: '', skills: [] },
    { id: '2', content: '', skills: [] },
  ],
  locale: 'en-us',
  luFiles: [
    { id: 'a.en-us', content: initialContent, templates: initialIntents, diagnostics: [], intents: [] },
    { id: 'a.fr-fr', content: initialContent, templates: initialIntents, diagnostics: [], intents: [] },
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
  set(luFilesSelectorFamily(state.projectId), state.luFiles);
  set(settingsState(state.projectId), state.settings);
  set(schemasState(state.projectId), mockProjectResponse.schemas);
};

describe('LU page all up view', () => {
  it('should render lu page table view', () => {
    const { getByText, getByTestId } = renderWithRecoil(
      <TableView dialogId={'a'} projectId={state.projectId} />,
      initRecoilState
    );
    getByTestId('table-view');
    getByText('Intent');
  });

  it('should render lu page code editor', () => {
    renderWithRecoil(<CodeEditor dialogId={'a'} projectId={state.projectId} />, initRecoilState);
  });

  it('should render lu page', () => {
    renderWithRecoil(<LUPage dialogId={'a'} projectId={state.projectId} />, initRecoilState);
  });
});
