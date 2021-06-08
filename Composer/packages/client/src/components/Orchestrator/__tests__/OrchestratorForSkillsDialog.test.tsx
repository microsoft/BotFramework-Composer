// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { act, screen } from '@botframework-composer/test-utils';
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
} from '../../../recoilModel';
import { recognizersSelectorFamily } from '../../../recoilModel/selectors/recognizers';
import { OrchestratorForSkillsDialog } from '../OrchestratorForSkillsDialog';
import { importOrchestrator } from '../../AddRemoteSkillModal/helper';

jest.mock('../../AddRemoteSkillModal/helper');

// mimick a project setup with a rootbot and dialog files, and provide conditions for orchestrator skill dialog to be visible
const makeInitialState = (set: any) => {
  set(orchestratorForSkillsDialogState, true);
  set(botProjectIdsState, ['rootBotId']);
  set(botProjectFileState('rootBotId'), { content: { name: 'rootBot', skills: {} }, id: 'rootBot', lastModified: '' });
  set(projectMetaDataState('rootBotId'), { isRootBot: true, isRemote: false });
  set(designPageLocationState('rootBotId'), { dialogId: 'rootBotRootDialogId', focused: 'na', selected: 'na' });
  set(localeState('rootBotId'), 'en-us');
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
    renderWithRecoil(<OrchestratorForSkillsDialog />, ({ set }) => {
      makeInitialState(set);
      set(orchestratorForSkillsDialogState, false);
    });
    const dialog = screen.queryByTestId(orchestratorTestId);
    expect(dialog).toBeNull();
  });

  it('should not open OrchestratorForSkillsDialog if orchestrator already being used in root', () => {
    renderWithRecoil(<OrchestratorForSkillsDialog />, ({ set }) => {
      makeInitialState(set);
      set(recognizersSelectorFamily('rootBotId'), [
        { id: 'rootBotRootDialogId.en-us.lu.dialog', content: { $kind: SDKKinds.OrchestratorRecognizer } },
      ]);
    });
    const dialog = screen.queryByTestId(orchestratorTestId);
    expect(dialog).toBeNull();
  });

  it('open OrchestratorForSkillsDialog if orchestratorForSkillsDialogState and Orchestrator not used in Root Bot Root Dialog', () => {
    renderWithRecoil(<OrchestratorForSkillsDialog />, ({ set }) => {
      makeInitialState(set);
    });
    const dialog = screen.queryByTestId(orchestratorTestId);
    expect(dialog).toBeTruthy();
  });

  it('should install Orchestrator package when user clicks Continue', async () => {
    renderWithRecoil(<OrchestratorForSkillsDialog />, ({ set }) => {
      makeInitialState(set);
    });

    await act(async () => {
      userEvent.click(screen.getByTestId('import-orchestrator'));
    });

    expect(importOrchestrator).toBeCalledWith('rootBotId', expect.anything(), expect.anything());
  });

  it('should not install Orchestrator package when user clicks skip', async () => {
    renderWithRecoil(<OrchestratorForSkillsDialog />, ({ set }) => {
      makeInitialState(set);
    });

    await act(async () => {
      userEvent.click(await screen.findByText('Skip'));
    });

    const dialog = screen.queryByTestId(orchestratorTestId);
    expect(dialog).toBeNull();

    expect(importOrchestrator).toBeCalledTimes(0);
  });
});
