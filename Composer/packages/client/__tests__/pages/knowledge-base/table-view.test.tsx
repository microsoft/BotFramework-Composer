// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/* eslint-disable react-hooks/rules-of-hooks */
import React from 'react';
import { fireEvent } from '@botframework-composer/test-utils';

import TableView from '../../../src/pages/knowledge-base/table-view';
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
    { id: 'dialog1', content: '', skills: [] },
    { id: 'dialog2', content: '', skills: [] },
  ],
  locale: 'en-us',
  qnaFiles: [
    {
      id: 'a.source.en-us',
      content: initialContent,
      imports: [],
      options: [],
      qnaSections: [
        {
          Questions: [{ content: 'question1', id: 1 }],
          Answer: 'answer1',
          uuid: 1,
        },
      ],
    },
    {
      id: 'dialog1.en-us',
      content: '[import](a.source.qna)',
      imports: [{ id: 'a.source.qna', description: 'import', path: 'a.source.qna' }],
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
      <TableView dialogId={'dialog1'} locale={state.locale} projectId={state.projectId} />,
      initRecoilState
    );
    const more = getByTestId('knowledgeBaseMore');
    fireEvent.click(more);
    getByText('Import new url and overwrite');
    getByText('Delete knowledge base');
    getByText('Show code');
  });
});
