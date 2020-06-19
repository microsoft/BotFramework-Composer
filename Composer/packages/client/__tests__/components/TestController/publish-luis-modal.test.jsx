// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import * as React from 'react';
import { fireEvent } from '@bfc/test-utils';

import { PublishLuis } from '../../../src/pages/language-understanding/publish-luis-modal';
import { renderWithStore } from '../../testUtils';

describe('<PublishLuis />', () => {
  it('should render the <PublishLuis />', () => {
    const onDismiss = jest.fn(() => {});
    const onPublish = jest.fn(() => {});
    const state = {
      projectId: '12345',
      botName: 'sampleBot0',
      settings: {
        luis: {
          name: '',
          authoringKey: '12345',
          authoringEndpoint: 'testAuthoringEndpoint',
          endpointKey: '12345',
          endpoint: 'testEndpoint',
          authoringRegion: 'westus',
          defaultLanguage: 'en-us',
          environment: 'composer',
        },
      },
    };
    const actions = {
      setSettings: jest.fn((projectId, settings) => {
        state.settings = settings;
      }),
    };
    const { getByText } = renderWithStore(
      <PublishLuis workState={0} onDismiss={onDismiss} onPublish={onPublish} />,
      state,
      actions
    );
    expect(getByText('What is the name of your bot?')).not.toBeNull();
    const publishButton = getByText('OK');
    expect(publishButton).not.toBeNull();
    fireEvent.click(publishButton);
    expect(actions.setSettings).toBeCalled();
    expect(state).toEqual({
      projectId: '12345',
      botName: 'sampleBot0',
      settings: {
        luis: {
          name: 'sampleBot0',
          authoringKey: '12345',
          authoringEndpoint: 'testAuthoringEndpoint',
          endpointKey: '12345',
          endpoint: 'testEndpoint',
          authoringRegion: 'westus',
          defaultLanguage: 'en-us',
          environment: 'composer',
        },
      },
    });
  });
});
