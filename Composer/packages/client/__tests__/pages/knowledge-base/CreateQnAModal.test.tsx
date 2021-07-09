// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/* eslint-disable react-hooks/rules-of-hooks */
import React from 'react';
import { fireEvent } from '@botframework-composer/test-utils';

import CreateQnAModal from '../../../src/components/QnA/CreateQnAModal';
import { renderWithRecoil } from '../../testUtils';
import {
  localeState,
  dialogsSelectorFamily,
  qnaFilesSelectorFamily,
  settingsState,
  schemasState,
  dispatcherState,
  currentProjectIdState,
  createQnAOnState,
  showCreateQnADialogState,
} from '../../../src/recoilModel';
import mockProjectResponse from '../../../src/recoilModel/dispatchers/__tests__/mocks/mockProjectResponse.json';

const initialContent = `
# ?question
\`\`\`
answer
\`\`\`
`;

const handleSubmit = jest.fn();

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
      id: 'a.source.en-us',
      content: '',
      imports: [],
      options: [],
      diagnostics: [],
      qnaSections: [
        {
          Questions: [{ content: 'question', id: '2' }],
          Answer: 'answer',
          sectionId: '2',
          Body: '',
        },
      ],
      empty: true,
      resource: { Errors: [], Content: '', Sections: [] },
      isContentUnparsed: true,
    },
    {
      id: 'a.en-us',
      content: initialContent,
      imports: [],
      options: [],
      diagnostics: [],
      qnaSections: [
        {
          Questions: [{ content: 'question', id: '1' }],
          Answer: 'answer',
          sectionId: '1',
          Body: '',
        },
      ],
      empty: true,
      resource: { Errors: [], Content: '', Sections: [] },
      isContentUnparsed: true,
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
  set(createQnAOnState, { projectId: state.projectId, dialogId: state.dialogs[0].id });
  set(showCreateQnADialogState(state.projectId), true);
};

describe('QnA creation flow', () => {
  it('should create qna from url', () => {
    const { getByTestId, getByText, getAllByText } = renderWithRecoil(
      <CreateQnAModal
        dialogId={state.dialogs[0].id}
        projectId={state.projectId}
        qnaFiles={state.qnaFiles}
        onSubmit={handleSubmit}
      />,
      initRecoilState
    );

    const nameField = getByTestId('knowledgeLocationTextField-name');
    fireEvent.change(nameField, { target: { value: 'name' } });
    const next1 = getByText('Next');
    fireEvent.click(next1);

    const option = getAllByText('Create new knowledge base from URL or file');
    fireEvent.click(option[0]);

    const urlField = getByTestId('adden-usInCreateQnAFromUrlModal');
    fireEvent.change(urlField, { target: { value: 'http://newUrl.pdf' } });
    const next = getByText('Next');
    fireEvent.click(next);
    expect(handleSubmit).toBeCalled();
  });

  it('should create qna from portal', () => {
    const { getByTestId, getByText } = renderWithRecoil(
      <CreateQnAModal
        dialogId={state.dialogs[0].id}
        projectId={state.projectId}
        qnaFiles={state.qnaFiles}
        onSubmit={handleSubmit}
      />,
      initRecoilState
    );

    const nameField = getByTestId('knowledgeLocationTextField-name');
    fireEvent.change(nameField, { target: { value: 'name' } });
    const next1 = getByText('Next');
    fireEvent.click(next1);

    const option = getByText('Import existing knowledge base from QnA maker portal');
    fireEvent.click(option);

    const next = getByText('Next');
    fireEvent.click(next);
    getByText('Select source knowledge base location');
  });

  it('should create qna from scratch', () => {
    const { getByTestId, getByText } = renderWithRecoil(
      <CreateQnAModal
        dialogId={state.dialogs[0].id}
        projectId={state.projectId}
        qnaFiles={state.qnaFiles}
        onSubmit={handleSubmit}
      />,
      initRecoilState
    );

    const nameField = getByTestId('knowledgeLocationTextField-name');
    fireEvent.change(nameField, { target: { value: 'name' } });
    const next1 = getByText('Next');
    fireEvent.click(next1);

    const next = getByText('Skip & Create blank knowledge base');
    fireEvent.click(next);
    expect(handleSubmit).toBeCalled();
  });
});
