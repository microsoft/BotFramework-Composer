// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import { Range, Position } from '@bfc/shared';

import { renderWithRecoil } from '../../../testUtils';
import { DiagnosticList } from '../../../../src/pages/design/DebugPanel/TabExtensions/DiagnosticsTab/DiagnosticList';
import {
  botDiagnosticsState,
  botProjectIdsState,
  currentProjectIdState,
  dialogIdsState,
  formDialogSchemaIdsState,
  jsonSchemaFilesState,
  lgFilesSelectorFamily,
  luFilesState,
  schemasState,
  settingsState,
} from '../../../../src/recoilModel';
import mockProjectResponse from '../../../../src/recoilModel/dispatchers/__tests__/mocks/mockProjectResponse.json';

const state = {
  projectId: 'test',
  dialogs: [
    {
      id: 'test',
      content: 'test',
      luFile: 'test',
      referredLuIntents: [],
      skills: [`=settings.skill['Email-Skill'].endpointUrl`],
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
          severity: 'Error',
          location: 'test.en-us',
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
          severity: 'Error',
          location: 'test.en-us',
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
      severity: 'Error',
      location: 'server',
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

describe('<DiagnosticList/>', () => {
  const initRecoilState = ({ set }) => {
    set(currentProjectIdState, state.projectId);
    set(botProjectIdsState, [state.projectId]);
    set(dialogIdsState(state.projectId), []);
    set(luFilesState(state.projectId), state.luFiles);
    set(lgFilesSelectorFamily(state.projectId), state.lgFiles);
    set(jsonSchemaFilesState(state.projectId), state.jsonSchemaFiles);
    set(botDiagnosticsState(state.projectId), state.diagnostics);
    set(settingsState(state.projectId), state.settings);
    set(schemasState(state.projectId), mockProjectResponse.schemas);
    set(
      formDialogSchemaIdsState(state.projectId),
      state.formDialogSchemas.map((fds) => fds.id)
    );
  };

  it('should render the DiagnosticList', () => {
    const { container } = renderWithRecoil(
      <DiagnosticList diagnosticItems={state.diagnostics as any} />,
      initRecoilState
    );
    expect(container).toHaveTextContent('server');
  });
});
