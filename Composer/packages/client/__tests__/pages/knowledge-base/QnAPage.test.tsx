// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/* eslint-disable react-hooks/rules-of-hooks */
import React from 'react';

import QnAPage from '../../../src/pages/knowledge-base/QnAPage';
import TableView from '../../../src/pages/knowledge-base/table-view';
import CodeEditor from '../../../src/pages/knowledge-base/code-editor';
import { TabHeader } from '../../../src/pages/knowledge-base/TabHeader';
import { renderWithRecoil } from '../../testUtils';
import {
  localeState,
  dialogsSelectorFamily,
  qnaFilesSelectorFamily,
  settingsState,
  schemasState,
  dispatcherState,
  currentProjectIdState,
} from '../../../src/recoilModel';
import mockProjectResponse from '../../../src/recoilModel/dispatchers/__tests__/mocks/mockProjectResponse.json';

const initialContent = `
# ?question
\`\`\`
answer
\`\`\`
`;

const state = {
  projectId: 'test',
  skillId: '',
  dialogs: [
    { id: '1', content: '', skills: [] },
    { id: '2', content: '', skills: [] },
  ],
  locale: 'en-us',
  qnaFiles: [
    {
      id: 'a.en-us',
      content: initialContent,
      imports: [],
      qnaSections: [
        {
          Questions: [{ content: 'question', id: 1 }],
          Answer: 'answer',
          uuid: 1,
        },
      ],
    },
  ],
  settings: {
    defaultLanguage: 'en-us',
    languages: ['en-us', 'zh-cn'],
  },
};

const updateQnAFileMock = jest.fn();

const initRecoilState = ({ set }) => {
  set(currentProjectIdState, state.projectId);
  set(localeState(state.projectId), state.locale);
  set(dialogsSelectorFamily(state.projectId), state.dialogs);
  set(qnaFilesSelectorFamily(state.projectId), state.qnaFiles);
  set(settingsState(state.projectId), state.settings);
  set(schemasState(state.projectId), mockProjectResponse.schemas);
  set(dispatcherState, {
    updateQnAFile: updateQnAFileMock,
  });
};

describe('QnA page all up view', () => {
  it('should render QnA page table view', () => {
    const { getByTestId, getByText } = renderWithRecoil(
      <TableView dialogId={'a'} locale={state.locale} projectId={state.projectId} skillId={state.skillId} />,
      initRecoilState
    );
    getByTestId('table-view');
    getByText('Question');
  });

  it('should render QnA page code editor', () => {
    renderWithRecoil(
      <CodeEditor dialogId={'a'} locale={state.locale} projectId={state.projectId} skillId={state.skillId} />,
      initRecoilState
    );
  });

  it('should render QnA page', () => {
    const { getByTestId } = renderWithRecoil(<QnAPage dialogId={'a'} projectId={state.projectId} />, initRecoilState);
    getByTestId('QnAPage');
  });

  it('should render QnA page TabHeader', () => {
    const { getByText } = renderWithRecoil(
      <TabHeader
        defaultLanguage={state.settings.defaultLanguage}
        languages={state.settings.languages}
        locale={'en-us'}
        onChangeLocale={() => {}}
      />,
      initRecoilState
    );
    getByText('English (United States)(Default)');
    getByText('Chinese (Simplified, China)');
  });
});
