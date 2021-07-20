// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { act, fireEvent } from '@botframework-composer/test-utils';

import { renderWithRecoilAndCustomDispatchers } from '../../testUtils';
import {
  botDisplayNameState,
  botProjectFileState,
  botProjectIdsState,
  dialogsSelectorFamily,
  dispatcherState,
  projectMetaDataState,
  schemasState,
  settingsState,
} from '../../../src/recoilModel';
import { currentProjectIdState } from '../../../src/recoilModel';
import { SAMPLE_DIALOG } from '../../mocks/sampleDialog';
import { RuntimeSettings } from '../../../src/pages/botProject/RuntimeSettings';

const projectId = '12345.6789';
const dialogs = [SAMPLE_DIALOG];
const mockRuntimeCommand = 'dotnet run --project foo';
const mockSettings = {
  defaultLanguage: 'en-us',
  languages: ['en-us', 'fr-fr'],
  runtime: {
    command: mockRuntimeCommand,
  },
};

const setRuntimeFieldMock = jest.fn();

const initRecoilState = ({ set }) => {
  set(settingsState(projectId), mockSettings);
  set(currentProjectIdState, projectId);
  set(botProjectIdsState, [projectId]);
  set(dialogsSelectorFamily(projectId), dialogs);
  set(schemasState(projectId), { sdk: { content: {} } });
  set(projectMetaDataState(projectId), { isRootBot: true });
  set(botProjectFileState(projectId), { foo: 'bar' });
  set(botDisplayNameState(projectId), 'mockBot');
  set(dispatcherState, {
    setRuntimeField: setRuntimeFieldMock,
  });
};

describe('<RuntimeSettings />', () => {
  it('should render existing custom path', async () => {
    const component = renderWithRecoilAndCustomDispatchers(<RuntimeSettings projectId={projectId} />, initRecoilState);

    const startCommandNode = await component.findByTestId('runtimeCommand');

    expect(startCommandNode).toHaveValue(mockRuntimeCommand);
  });

  it('change custom path in settings state and error if empty', async () => {
    const component = renderWithRecoilAndCustomDispatchers(<RuntimeSettings projectId={projectId} />, initRecoilState);

    const startCommandNode = await component.findByTestId('runtimeCommand');
    await act(async () => {
      await fireEvent.change(startCommandNode, { target: { value: '' } });
      await fireEvent.blur(startCommandNode);
    });
    expect(setRuntimeFieldMock).toBeCalledWith(projectId, 'command', '');
    const errorNode = await component.findByTestId('runtimeErrorText');
    expect(errorNode).toBeTruthy();
  });
});
