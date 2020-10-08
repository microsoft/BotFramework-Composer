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
} from '../../../src/recoilModel';
import { CreatePublishTarget } from '../../../src/pages/publish/createPublishTarget';
import { PublishStatusList } from '../../../src/pages/publish/publishStatusList';
import { TargetList } from '../../../src/pages/publish/targetList';
import Publish from '../../../src/pages/publish/Publish';
import { PublishDialog } from '../../../src/pages/publish/publishDialog';

const state = {
  projectId: 'test',
  botName: 'test',
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
      },
    },
  ],
  publishHistory: {},
};

const initRecoilState = ({ set }) => {
  set(currentProjectIdState, state.projectId);
  set(botDisplayNameState(state.projectId), state.botName);
  set(publishTypesState(state.projectId), state.publishTypes);
  set(publishHistoryState(state.projectId), state.publishHistory);
  set(settingsState(state.projectId), state.settings);
};

describe('publish page', () => {
  it('should render status list in publish page', () => {
    const { getByText } = renderWithRecoil(
      <PublishStatusList groups={[]} items={[]} updateItems={jest.fn()} onItemClick={jest.fn()} />,
      initRecoilState
    );
    getByText('Time');
    getByText('Date');
    getByText('Status');
  });

  it('should render target list in publish page', () => {
    const { getByText } = renderWithRecoil(
      <TargetList
        list={state.settings.publishTargets}
        selectedTarget={'all'}
        onDelete={jest.fn()}
        onEdit={jest.fn()}
        onSelect={jest.fn()}
      />,
      initRecoilState
    );
    getByText('profile1');
  });

  it('should render create profile dialog in publish page', () => {
    const { getByText } = renderWithRecoil(
      <CreatePublishTarget
        closeDialog={jest.fn()}
        current={null}
        targets={state.settings.publishTargets}
        types={state.publishTypes}
        updateSettings={jest.fn()}
      />,
      initRecoilState
    );
    getByText('Name');
    getByText('Publish Destination Type');
    getByText('Publish Configuration');
  });

  it('should render publish dialog when click publish', () => {
    const { getByText } = renderWithRecoil(
      <PublishDialog target={state.settings.publishTargets[0]} onDismiss={jest.fn()} onSubmit={jest.fn()} />,
      initRecoilState
    );
    getByText('Publish');
    getByText('You are about to publish your bot to the profile below. Do you want to proceed?');
    getByText('profile1');
  });

  it('should include add button and publish button in publish page', () => {
    const { getByText } = renderWithRecoil(<Publish />, initRecoilState);
    getByText('Add new profile');
    getByText('Publish to selected profile');
  });
});
