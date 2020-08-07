// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import React from 'react';

import { renderWithRecoil } from '../../testUtils';
import {
  settingsState,
  botNameState,
  publishTypesState,
  projectIdState,
  publishHistoryState,
} from '../../../src/recoilModel';
// import { CreatePublishTarget } from '../../../src/pages/publish/createPublishTarget';
import { PublishStatusList } from '../../../src/pages/publish/publishStatusList';
import { TargetList } from '../../../src/pages/publish/targetList';

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
  publishTypes: [],
  publishHistory: {},
};

const initRecoilState = ({ set }) => {
  set(projectIdState, state.projectId);
  set(botNameState, state.botName);
  set(publishTypesState, state.publishTypes);
  set(publishHistoryState, state.publishHistory);
  set(settingsState, state.settings);
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
});
