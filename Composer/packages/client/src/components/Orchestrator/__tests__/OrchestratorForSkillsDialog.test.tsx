// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { act, getQueriesForElement, within } from '@botframework-composer/test-utils';
import { SDKKinds } from '@botframework-composer/types';
import * as React from 'react';
import userEvent from '@testing-library/user-event';

import { renderWithRecoil } from '../../../../__tests__/testUtils/renderWithRecoil';
import {
  botProjectFileState,
  botProjectIdsState,
  designPageLocationState,
  localeState,
  orchestratorForSkillsDialogState,
  projectMetaDataState,
  settingsState,
} from '../../../recoilModel';
import { recognizersSelectorFamily } from '../../../recoilModel/selectors/recognizers';
import { OrchestratorForSkillsDialog } from '../OrchestratorForSkillsDialog';
import { importOrchestrator } from '../../AddRemoteSkillModal/helper';

jest.mock('../../AddRemoteSkillModal/helper', () => {
  const helper = jest.requireActual('../../AddRemoteSkillModal/helper');
  return {
    ...helper,
    importOrchestrator: jest.fn(),
  };
});

// mimick a project setup with a rootbot and dialog files, and provide conditions for orchestrator skill dialog to be visible
const makeInitialState = (set: any) => {
  set(orchestratorForSkillsDialogState, true);
  set(botProjectIdsState, ['rootBotId']);
  set(botProjectFileState('rootBotId'), { content: { name: 'rootBot', skills: {} }, id: 'rootBot', lastModified: '' });
  set(projectMetaDataState('rootBotId'), { isRootBot: true, isRemote: false });
  set(designPageLocationState('rootBotId'), { dialogId: 'rootBotRootDialogId', focused: 'na', selected: 'na' });
  set(localeState('rootBotId'), 'en-us');
  set(settingsState('rootBotId'), { runtime: { key: 'adaptive-runtime-dotnet-webapp' } });
  set(recognizersSelectorFamily('rootBotId'), [
    { id: 'rootBotRootDialogId.en-us.lu.dialog', content: { $kind: SDKKinds.LuisRecognizer } },
  ]);
};

const orchestratorTestId = 'orchestrator-skill';

describe('<OrchestratorForSkillsDialog />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should not open OrchestratorForSkillsDialog if orchestratorForSkillsDialogState is false', () => {
    const { baseElement } = renderWithRecoil(<OrchestratorForSkillsDialog />, ({ set }) => {
      makeInitialState(set);
      set(orchestratorForSkillsDialogState, false);
    });
    const dialog = getQueriesForElement(baseElement).queryByTestId(orchestratorTestId);
    expect(dialog).toBeNull();
  });

  it('should not open OrchestratorForSkillsDialog if orchestrator already being used in root', () => {
    const { baseElement } = renderWithRecoil(<OrchestratorForSkillsDialog />, ({ set }) => {
      makeInitialState(set);
      set(recognizersSelectorFamily('rootBotId'), [
        { id: 'rootBotRootDialogId.en-us.lu.dialog', content: { $kind: SDKKinds.OrchestratorRecognizer } },
      ]);
    });
    const dialog = getQueriesForElement(baseElement).queryByTestId(orchestratorTestId);
    expect(dialog).toBeNull();
  });

  it('should not render OrchestratorForSkillsDialog if runtime is not supported', () => {
    const { baseElement } = renderWithRecoil(<OrchestratorForSkillsDialog />, ({ set }) => {
      makeInitialState(set);
      set(settingsState('rootBotId'), {
        defaultLanguage: 'en-us',
        languages: ['en-us'],
        luis: {
          authoringEndpoint: '',
          name: '',
          authoringKey: '',
          defaultLanguage: '',
          endpoint: '',
          endpointKey: '',
          environment: '',
        },
        qna: { endpointKey: '', subscriptionKey: '' },
        luFeatures: { enableCompositeEntities: false },
        customFunctions: [],
        importedLibraries: [],
        runtime: { key: 'node-webapp-v1', command: '', path: '', customRuntime: false },
      });
    });
    const dialog = getQueriesForElement(baseElement).queryByTestId(orchestratorTestId);
    expect(dialog).toBeNull();
  });

  it('should not render OrchestratorForSkillsDialog if runtime is missing or invalid', () => {
    const { baseElement } = renderWithRecoil(<OrchestratorForSkillsDialog />, ({ set }) => {
      makeInitialState(set);
      set(settingsState('rootBotId'), {
        defaultLanguage: 'en-us',
        languages: ['en-us'],
        luis: {
          authoringEndpoint: '',
          name: '',
          authoringKey: '',
          defaultLanguage: '',
          endpoint: '',
          endpointKey: '',
          environment: '',
        },
        qna: { endpointKey: '', subscriptionKey: '' },
        luFeatures: { enableCompositeEntities: false },
        customFunctions: [],
        importedLibraries: [],
        runtime: { key: '', command: '', path: '', customRuntime: false },
      });
    });
    const dialog = getQueriesForElement(baseElement).queryByTestId(orchestratorTestId);
    expect(dialog).toBeNull();
  });

  it('open OrchestratorForSkillsDialog if orchestratorForSkillsDialogState and Orchestrator not used in Root Bot Root Dialog, and using dotnet adaptive runtime', () => {
    const { baseElement } = renderWithRecoil(<OrchestratorForSkillsDialog />, ({ set }) => {
      makeInitialState(set);
    });
    const dialog = getQueriesForElement(baseElement).queryByTestId(orchestratorTestId);
    expect(dialog).toBeTruthy();
  });

  it('should install Orchestrator package when user clicks Continue', async () => {
    const { baseElement } = renderWithRecoil(<OrchestratorForSkillsDialog />, ({ set }) => {
      makeInitialState(set);
    });

    await act(async () => {
      userEvent.click(within(baseElement).getByTestId('import-orchestrator'));
    });

    expect(importOrchestrator).toBeCalledWith(
      'rootBotId',
      { key: 'adaptive-runtime-dotnet-webapp' },
      expect.anything(),
      expect.anything()
    );
  });

  it('should install Orchestrator package with adaptive node runtime', async () => {
    const { baseElement } = renderWithRecoil(<OrchestratorForSkillsDialog />, ({ set }) => {
      makeInitialState(set);

      set(settingsState('rootBotId'), {
        defaultLanguage: 'en-us',
        languages: ['en-us'],
        luis: {
          authoringEndpoint: '',
          name: '',
          authoringKey: '',
          defaultLanguage: '',
          endpoint: '',
          endpointKey: '',
          environment: '',
        },
        qna: { endpointKey: '', subscriptionKey: '' },
        luFeatures: { enableCompositeEntities: false },
        customFunctions: [],
        importedLibraries: [],
        runtime: { key: 'adaptive-runtime-js-functions', command: '', path: '', customRuntime: false },
      });
    });

    await act(async () => {
      userEvent.click(within(baseElement).getByTestId('import-orchestrator'));
    });

    expect(importOrchestrator).toBeCalledWith(
      'rootBotId',
      {
        key: 'adaptive-runtime-js-functions',
        path: expect.anything(),
        customRuntime: expect.anything(),
        command: expect.anything(),
      },
      expect.anything(),
      expect.anything()
    );
  });

  it('should not install Orchestrator package when user clicks skip', async () => {
    const { baseElement } = renderWithRecoil(<OrchestratorForSkillsDialog />, ({ set }) => {
      makeInitialState(set);
    });

    await act(async () => {
      userEvent.click(await within(baseElement).findByText('Skip'));
    });

    const dialog = getQueriesForElement(baseElement).queryByTestId(orchestratorTestId);
    expect(dialog).toBeNull();

    expect(importOrchestrator).toBeCalledTimes(0);
  });
});
