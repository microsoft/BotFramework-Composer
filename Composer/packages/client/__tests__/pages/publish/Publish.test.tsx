// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import React from 'react';

import { renderWithRecoil } from '../../testUtils';
import {
  settingsState,
  botDisplayNameState,
  publishTypesState,
  publishHistoryState,
  currentProjectIdState,
  botProjectIdsState,
} from '../../../src/recoilModel';
import Publish from '../../../src/pages/publish/Publish';
import { PublishDialog } from '../../../src/pages/publish/PublishDialog';
import { BotStatusList } from '../../../src/pages/publish/BotStatusList';

const projectIds = ['rootTest', 'skillTest'];
const rootState = {
  projectId: 'rootTest',
  botName: 'rootTest',
  settings: {
    defaultLanguage: 'en-us',
    languages: ['en-us', 'fr-fr'],
    publishTargets: [
      {
        name: 'profile1',
        type: 'azurewebapp',
        configuration: '{}',
      },
    ],
  },
  publishTypes: [
    {
      name: 'azurePublish',
      description: 'azure publish',
      instructions: 'plugin instruction',
      extensionId: 'azurePublish',
      schema: {
        default: {
          test: 'test',
        },
      },
      features: {
        history: true,
        publish: true,
        status: true,
        rollback: true,
        pull: true,
        provision: true,
      },
    },
  ],
  publishHistory: {},
};
const skillState = {
  projectId: 'skillTest',
  botName: 'skillTest',
  settings: {
    defaultLanguage: 'en-us',
    languages: ['en-us', 'fr-fr'],
    publishTargets: [
      {
        name: 'profile2',
        type: 'azurewebapp',
        configuration: '{}',
      },
    ],
  },
  publishTypes: [
    {
      name: 'azurePublish',
      description: 'azure publish',
      instructions: 'plugin instruction',
      extensionId: 'azurePublish',
      schema: {
        default: {
          test: 'test',
        },
      },
      features: {
        history: true,
        publish: true,
        status: true,
        rollback: true,
        pull: true,
      },
    },
  ],
  publishHistory: {},
};
const initRecoilState = ({ set }) => {
  set(currentProjectIdState, rootState.projectId);
  set(botProjectIdsState, projectIds);
  set(botDisplayNameState(rootState.projectId), rootState.botName);
  set(publishTypesState(rootState.projectId), rootState.publishTypes);
  set(publishHistoryState(rootState.projectId), rootState.publishHistory);
  set(settingsState(rootState.projectId), rootState.settings);
  set(botDisplayNameState(skillState.projectId), skillState.botName);
  set(publishTypesState(skillState.projectId), skillState.publishTypes);
  set(publishHistoryState(skillState.projectId), skillState.publishHistory);
  set(settingsState(skillState.projectId), skillState.settings);
};

describe('publish page', () => {
  it('should render status list in publish page', () => {
    const { getByText } = renderWithRecoil(
      <BotStatusList
        botPublishHistoryList={{}}
        botStatusList={[]}
        checkedIds={[]}
        disableCheckbox={false}
        onChangePublishTarget={jest.fn()}
        onCheck={jest.fn()}
        onManagePublishProfile={jest.fn()}
        onRollbackClick={jest.fn()}
      />,
      initRecoilState
    );
    getByText('Bot');
    getByText('Date');
    getByText('Status');
  });

  it('should render publish dialog when click publish', () => {
    const selectedBots = [
      {
        id: 'rootTest',
        name: 'rootTest',
        publishTarget: 'profile1',
        publishTargets: [
          {
            name: 'profile1',
            type: 'azurewebapp',
            configuration: '{}',
          },
        ],
      },
      {
        id: 'skillTest',
        name: 'skillTest',
        publishTarget: 'profile2',
        publishTargets: [
          {
            name: 'profile2',
            type: 'azurewebapp',
            configuration: '{}',
          },
        ],
      },
    ];
    const { getByText } = renderWithRecoil(
      <PublishDialog items={selectedBots} onDismiss={jest.fn()} onSubmit={jest.fn()} />,
      initRecoilState
    );
    getByText('Publish');
    getByText('You are about to publish your bot to the profile below. Do you want to proceed?');
    getByText('Bot');
    getByText('Publish target');
    getByText('Comments');
  });

  it('should include publish button and pull button in publish page', () => {
    const { getByText } = renderWithRecoil(<Publish />, initRecoilState);
    getByText('Publish selected bots');
    getByText('Pull from selected profile');
  });
});
