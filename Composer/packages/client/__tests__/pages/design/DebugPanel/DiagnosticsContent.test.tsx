// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import { fireEvent } from '@botframework-composer/test-utils';
import { DiagnosticSeverity } from '@botframework-composer/types';
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
  luFilesSelectorFamily,
  schemasState,
  settingsState,
  projectMetaDataState,
  dialogState,
} from '../../../../src/recoilModel';
import mockProjectResponse from '../../../../src/recoilModel/dispatchers/__tests__/mocks/mockProjectResponse.json';
import { DiagnosticsContent } from '../../../../src/pages/design/DebugPanel/TabExtensions/DiagnosticsTab/DiagnosticsTabContent';

const mockNavigationTo = jest.fn();
jest.mock('../../../../src/utils/navigation', () => ({
  navigateTo: (...args) => mockNavigationTo(...args),
}));

const state = {
  projectId: 'test',
  dialogs: [
    {
      id: 'test',
      content: 'test',
      luFile: 'test',
      referredLuIntents: [],
      skills: [`=settings.skill['Email-Skill'].endpointUrl`],
      projectId: 'test',
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
          severity: DiagnosticSeverity.Error,
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
          severity: DiagnosticSeverity.Error,
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
      severity: DiagnosticSeverity.Error,
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
    luis: {
      name: 'luis',
      endpointKey: 'asds',
    },
    qna: {
      subscriptionKey: 'asd',
      endpointKey: 'asds',
    },
  },
  formDialogSchemas: [{ id: '1', content: '{}' }],
};

describe('<DiagnosticList/>', () => {
  const initRecoilState = ({ set }) => {
    set(currentProjectIdState, state.projectId);
    set(botProjectIdsState, [state.projectId]);
    set(projectMetaDataState(state.projectId), {
      isRootBot: true,
    });
    set(dialogState({ projectId: state.projectId, dialogId: state.dialogs[0].id }), state.dialogs[0]);
    set(dialogIdsState(state.projectId), ['test']);
    set(luFilesSelectorFamily(state.projectId), state.luFiles);
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

  it('should render the Diagnostics', () => {
    const { getByText } = renderWithRecoil(<DiagnosticsContent isActive />, initRecoilState);

    fireEvent.click(getByText(/test.en-us.lg/));
    expect(mockNavigationTo).toBeCalledWith('/bot/test/language-generation/test/edit#L=13');
    fireEvent.click(getByText(/test.en-us.lu/));
    expect(mockNavigationTo).nthCalledWith(2, '/bot/test/language-understanding/test/edit#L=7');
  });
});
