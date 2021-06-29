// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { act, fireEvent } from '@botframework-composer/test-utils';

import { RootBotExternalService } from '../../../src/pages/botProject/RootBotExternalService';
import { renderWithRecoilAndCustomDispatchers } from '../../testUtils';
import { dialogIdsState, dispatcherState } from '../../../src/recoilModel';
import {
  settingsState,
  currentProjectIdState,
  projectMetaDataState,
  botProjectIdsState,
  dialogState,
  luFilesSelectorFamily,
} from '../../../src/recoilModel';
import { SkillBotExternalService } from '../../../src/pages/botProject/SkillBotExternalService';

const rootProjId = '123';
const skillProjId = '456';
const mockDialogId1 = 'dialog1';
const mockDialogId2 = 'dialog2';
const sharedState = {
  dialogs: [
    {
      content: {
        recognizer: '',
      },
      id: mockDialogId1,
    },
    {
      content: {
        recognizer: '',
      },
      id: mockDialogId2,
    },
  ],
  qnaFiles: [
    {
      content: '',
      empty: true,
      id: 'dialog1.en-us',
    },
  ],
  luFiles: [
    {
      content: '',
      empty: true,
      id: 'dialog1.en-us',
    },
  ],
  botProjectIdsState: [rootProjId, skillProjId],
};

const rootBotState = {
  ...sharedState,
  projectId: rootProjId,
  settings: {},
  projectMetaDataState: {
    isRootBot: true,
    isRemote: false,
  },
};

const skillBotState = {
  ...sharedState,
  projectId: skillProjId,
  settings: {},
  projectMetaDataState: {
    isRootBot: true,
    isRemote: false,
  },
};

jest.mock('@bfc/indexers', () => ({
  BotIndexer: {
    shouldUseLuis: jest.fn().mockReturnValue(true),
    shouldUseQnA: jest.fn().mockReturnValue(true),
  },
}));

const setSettingsMock = jest.fn();
const setQnASettingsMock = jest.fn();
const initRecoilState = ({ set }) => {
  // Skill state set up
  set(currentProjectIdState, skillProjId);
  set(dialogIdsState(skillProjId), [mockDialogId1, mockDialogId2]);
  set(dialogState({ projectId: skillProjId, dialogId: sharedState.dialogs[0].id }), sharedState.dialogs[0]);
  set(dialogState({ projectId: skillProjId, dialogId: sharedState.dialogs[1].id }), sharedState.dialogs[1]);
  set(luFilesSelectorFamily(skillProjId), sharedState.luFiles);
  set(projectMetaDataState(skillProjId), skillBotState.projectMetaDataState);
  set(settingsState(skillProjId), skillBotState.settings);
  // root bot state set up
  set(dialogState({ projectId: rootProjId, dialogId: sharedState.dialogs[0].id }), sharedState.dialogs[0]);
  set(dialogState({ projectId: rootProjId, dialogId: sharedState.dialogs[1].id }), sharedState.dialogs[1]);
  set(luFilesSelectorFamily(rootProjId), sharedState.luFiles);
  set(projectMetaDataState(rootProjId), rootBotState.projectMetaDataState);
  set(settingsState(rootProjId), rootBotState.settings);

  // shared state set up
  set(dispatcherState, {
    setSettings: setSettingsMock,
    setQnASettings: setQnASettingsMock,
  });
  set(botProjectIdsState, sharedState.botProjectIdsState);
};

describe('<SkillBotExternalService />', () => {
  it('should disable text field and show errors if root bot luis keys are empty', async () => {
    //test
    const component = renderWithRecoilAndCustomDispatchers(
      <SkillBotExternalService projectId={skillProjId} />,
      initRecoilState
    );

    const textFieldAuthoring = await component.getByTestId('skillLUISAuthoringKeyField');
    expect(textFieldAuthoring).toBeDisabled();
    const endpointErrorMessage = await component.getByText('Root Bot LUIS region is empty');
    expect(endpointErrorMessage).toBeTruthy();
    const regionErrorMessage = await component.getByText('Root Bot LUIS region is empty');
    expect(regionErrorMessage).toBeTruthy();
  });
  it('should allow skill specific luis key that is updated in settings', async () => {
    const component = renderWithRecoilAndCustomDispatchers(
      <SkillBotExternalService projectId={skillProjId} />,
      initRecoilState
    );
    const useSkillLuisKeyBtn = await component.getByTestId('skillLUISAuthoringKeyBtn');
    await act(async () => {
      await fireEvent.click(useSkillLuisKeyBtn);
    });
    const skillLuisKeyField = await component.getByTestId('skillLUISAuthoringKeyField');
    await act(async () => {
      await fireEvent.change(skillLuisKeyField, { target: { value: 'newLuisKey' } });
      await fireEvent.blur(skillLuisKeyField);
    });
    expect(setSettingsMock).toBeCalledWith(skillProjId, {
      luis: {
        authoringKey: 'newLuisKey',
        authoringRegion: '',
        endpointKey: '',
      },
      qna: {
        subscriptionKey: '',
      },
    });
  });

  it('should allow skill specific qna key that is updated in settings', async () => {
    const component = renderWithRecoilAndCustomDispatchers(
      <SkillBotExternalService projectId={skillProjId} />,
      initRecoilState
    );
    const useSkillQnaKeyBtn = await component.getByTestId('skillQnaAuthoringBtn');
    await act(async () => {
      await fireEvent.click(useSkillQnaKeyBtn);
    });
    const skillQnaKeyField = await component.getByTestId('skillQnaAuthoringField');
    await act(async () => {
      await fireEvent.change(skillQnaKeyField, { target: { value: 'newQnaKey' } });
      await fireEvent.blur(skillQnaKeyField);
    });
    expect(setSettingsMock).toBeCalledWith(skillProjId, {
      luis: {
        authoringKey: '',
        authoringRegion: '',
        endpointKey: '',
      },
      qna: {
        subscriptionKey: 'newQnaKey',
      },
    });
  });
});
