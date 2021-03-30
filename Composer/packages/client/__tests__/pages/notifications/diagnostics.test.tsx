// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import { Range, Position } from '@bfc/shared';
import { fireEvent } from '@botframework-composer/test-utils';

import {
  botDiagnosticsState,
  botProjectIdsState,
  currentProjectIdState,
  dialogIdsState,
  dialogState,
  formDialogSchemaIdsState,
  jsonSchemaFilesState,
  lgFilesSelectorFamily,
  luFilesSelectorFamily,
  qnaFilesSelectorFamily,
  schemasState,
  settingsState,
} from '../../../src/recoilModel';
import mockProjectResponse from '../../../src/recoilModel/dispatchers/__tests__/mocks/mockProjectResponse.json';
import Diagnostics from '../../../src/pages/diagnostics/Diagnostics';
import { renderWithRecoil } from '../../testUtils/renderWithRecoil';

const state = {
  projectId: 'testproj',
  dialogs: [
    {
      id: 'test',
      content: { recognizer: {} },
      luFile: 'test',
      referredLuIntents: [],
      skills: [`=settings.skill['Email-Skill'].endpointUrl`],
      diagnostics: [
        {
          message: 'dialog expression error',
          severity: 0,
          source: 'test',
        },
      ],
    },
  ],
  qnaFiles: [
    {
      content: `# ? tell a joke`,
      id: 'test.en-us',
      diagnostics: [
        {
          message: 'qna syntax error',
          severity: 0,
          source: 'test.en-us',
          range: {
            end: { character: 2, line: 7 },
            start: { character: 0, line: 7 },
          },
        },
      ],
    },
  ],
  luFiles: [
    {
      content: 'test',
      id: 'test.en-us',
      intents: [
        {
          Body: '- test12345 ss',
          Entities: [],
          Name: 'test',
          range: new Range(new Position(4, 0), new Position(7, 14)),
        },
      ],
      diagnostics: [
        {
          message: 'lu syntax error',
          severity: 0,
          source: 'test.en-us',
          range: {
            end: { character: 2, line: 7 },
            start: { character: 0, line: 7 },
          },
        },
      ],
    },
  ],
  lgFiles: [
    {
      content: 'test',
      id: 'test.en-us',
      templates: [
        {
          body: '- ${add(1,2)}',
          name: 'bar',
          range: new Range(new Position(0, 0), new Position(2, 14)),
        },
      ],
      diagnostics: [
        {
          message: 'lg syntax error',
          severity: 1,
          source: 'test.en-us',
          range: {
            end: { character: 2, line: 13 },
            start: { character: 0, line: 13 },
          },
        },
      ],
    },
  ],
  jsonSchemaFiles: [
    {
      id: 'schema1.json',
      content: 'test',
    },
  ],
  diagnostics: [
    {
      message: 'server error',
      severity: 0,
      source: 'server',
    },
  ],
  settings: {
    skill: {
      'Email-Skill': {
        manifestUrl: 'https://yuesuemailskill0207-gjvga67.azurewebsites.net/manifest/manifest-1.0.json',
        endpointUrl: 'https://yuesuemailskill0207-gjvga67.azurewebsites.net/api/messages',
        name: 'Email-Skill',
      },
    },
    languages: ['en-us'],
  },
  formDialogSchemas: [{ id: '1', content: '{}' }],
};
const mockNavigationTo = jest.fn();
jest.mock('../../../src/utils/navigation', () => ({
  navigateTo: (...args) => mockNavigationTo(...args),
}));
describe('<Diagnostics/>', () => {
  const initRecoilState = ({ set }) => {
    set(currentProjectIdState, state.projectId);
    set(botProjectIdsState, [state.projectId]);
    set(dialogIdsState(state.projectId), ['test']);
    set(dialogState({ projectId: state.projectId, dialogId: 'test' }), state.dialogs[0]);
    set(luFilesSelectorFamily(state.projectId), state.luFiles);
    set(lgFilesSelectorFamily(state.projectId), state.lgFiles);
    set(qnaFilesSelectorFamily(state.projectId), state.qnaFiles);
    set(jsonSchemaFilesState(state.projectId), state.jsonSchemaFiles);
    set(botDiagnosticsState(state.projectId), state.diagnostics);
    set(settingsState(state.projectId), state.settings);
    set(schemasState(state.projectId), mockProjectResponse.schemas);
    set(
      formDialogSchemaIdsState(state.projectId),
      state.formDialogSchemas.map((fds) => fds.id)
    );
  };

  it('should render the Diagnostics', () => {
    const { container, getByText } = renderWithRecoil(
      <Diagnostics projectId={state.projectId} skillId={state.projectId} />,
      initRecoilState
    );
    expect(container).toHaveTextContent('Diagnostics');
    fireEvent.doubleClick(getByText(/test.en-us.lg/));
    expect(mockNavigationTo).toBeCalledWith('/bot/testproj/language-generation/test/edit#L=13');
    fireEvent.doubleClick(getByText(/test.en-us.lu/));
    expect(mockNavigationTo).nthCalledWith(2, '/bot/testproj/language-understanding/test/edit#L=7');
    fireEvent.doubleClick(getByText(/test.en-us.qna/));
    expect(mockNavigationTo).nthCalledWith(3, '/bot/testproj/knowledge-base/test/edit#L=7');
  });
});
