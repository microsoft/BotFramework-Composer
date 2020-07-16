// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import * as React from 'react';
import { fireEvent } from '@bfc/test-utils';

import { PublishLuisDialog } from '../../../src/components/TestController/publishDialog';
import { renderWithStore } from '../../testUtils';

describe('<PublishLuisDialog />', () => {
  it('should render the <PublishLuisDialog />', () => {
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
    const { getByText } = renderWithStore(
      <PublishLuisDialog
        isOpen
        botName={'sampleBot0'}
        config={state.settings.luis}
        onDismiss={onDismiss}
        onPublish={onPublish}
      />,
      state
    );
    expect(getByText('What is the name of your bot?')).not.toBeNull();
    const publishButton = getByText('OK');
    expect(publishButton).not.toBeNull();
    fireEvent.click(publishButton);
    expect(onPublish).toBeCalled();
    expect(onPublish).toBeCalledWith({
      name: 'sampleBot0',
      authoringKey: '12345',
      authoringEndpoint: 'testAuthoringEndpoint',
      endpointKey: '12345',
      endpoint: 'testEndpoint',
      authoringRegion: 'westus',
      defaultLanguage: 'en-us',
      environment: 'composer',
    });
  });
});
