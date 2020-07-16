// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import * as React from 'react';
import { fireEvent } from '@bfc/test-utils';

import { PublishLuisDialog } from '../../../src/components/TestController/publishDialog';
import { projectIdState, botNameState, settingsState, dispatcherState } from '../../../src/recoilModel';
import { renderWithRecoil } from '../../testUtils';
jest.useFakeTimers();

const luisConfig = {
  name: '',
  authoringKey: '12345',
  authoringEndpoint: 'testAuthoringEndpoint',
  endpointKey: '12345',
  endpoint: 'testEndpoint',
  authoringRegion: 'westus',
  defaultLanguage: 'en-us',
  environment: 'composer',
};
describe('<PublishLuisDialog />', () => {
  it('should render the <PublishLuisDialog />', () => {
    const onDismiss = jest.fn(() => {});
    const onPublish = jest.fn(() => {});
    const setSettingsMock = jest.fn(() => {});
    const recoilInitState = ({ set }) => {
      set(dispatcherState, {
        setSettings: setSettingsMock,
      });
      set(projectIdState, '12345');
      set(botNameState, 'sampleBot0');
      set(settingsState, {
        luis: luisConfig,
      });
    };
    const { getByText } = renderWithRecoil(
      <PublishLuisDialog
        isOpen
        botName={'sampleBot0'}
        config={luisConfig}
        onDismiss={onDismiss}
        onPublish={onPublish}
      />,
      recoilInitState
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
