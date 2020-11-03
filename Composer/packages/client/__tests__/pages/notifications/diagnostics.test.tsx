// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import { Range, Position } from '@bfc/shared';
import { MutableSnapshot, RecoilRoot } from 'recoil';
import { render } from '@botframework-composer/test-utils';
import noop from 'lodash/noop';

import {
  botDiagnosticsState,
  botProjectIdsState,
  currentProjectIdState,
  dialogIdsState,
  formDialogSchemaIdsState,
  jsonSchemaFilesState,
  lgFilesState,
  luFilesState,
  qnaFilesState,
  schemasState,
  settingsState,
} from '../../../src/recoilModel';
import mockProjectResponse from '../../../src/recoilModel/dispatchers/__tests__/mocks/mockProjectResponse.json';
import Diagnostics from '../../../src/pages/diagnostics/Diagnostics';

const state = {
  projectId: 'testproj',
  dialogs: [
    {
      id: 'test',
      content: { recognizer: 'test.en-us.lu' },
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
  },
  formDialogSchemas: [{ id: '1', content: '{}' }],
};

export function renderWithRecoil(subject, initRecoilState: (mutableSnapshot: MutableSnapshot) => void = noop) {
  return render(<RecoilRoot initializeState={initRecoilState}>{subject}</RecoilRoot>);
}

describe('<Diagnostics/>', () => {
  const initRecoilState = ({ set }) => {
    set(currentProjectIdState, state.projectId);
    set(botProjectIdsState, [state.projectId]);
    set(dialogIdsState(state.projectId), []);
    set(luFilesState(state.projectId), state.luFiles);
    set(lgFilesState(state.projectId), state.lgFiles);
    set(qnaFilesState(state.projectId), state.qnaFiles);
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
    const { container } = renderWithRecoil(<Diagnostics />, initRecoilState);
    expect(container).toHaveTextContent('Diagnostics');
  });
});
