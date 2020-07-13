// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import * as React from 'react';
import { fireEvent } from '@bfc/test-utils';
import { act } from '@bfc/test-utils/lib/hooks';

import { PublishLuis } from '../../../src/pages/language-understanding/publish-luis-modal';
import { projectIdState, botNameState, settingsState, dispatcherState } from '../../../src/recoilModel';
import { renderWithRecoil } from '../../testUtils';
jest.useFakeTimers();

describe('<PublishLuis />', () => {
  it('should render the <PublishLuis />', async () => {
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
      });
    };

    const { getByText } = renderWithRecoil(
      <PublishLuis workState={0} onDismiss={onDismiss} onPublish={onPublish} />,
      recoilInitState
    );

    expect(getByText('What is the name of your bot?')).not.toBeNull();
    const publishButton = getByText('OK');
    expect(publishButton).not.toBeNull();
    act(() => {
      fireEvent.click(publishButton);
    });

    setTimeout(() => {
      expect(setSettingsMock).toHaveBeenCalledTimes(1);
      expect(setSettingsMock).toHaveBeenCalledWith('12345', {
        luis: {
          authoringEndpoint: 'testAuthoringEndpoint',
          authoringKey: '12345',
          authoringRegion: 'westus',
          defaultLanguage: 'en-us',
          endpoint: 'testEndpoint',
          endpointKey: '12345',
          environment: 'composer',
          name: 'sampleBot0',
        },
      });
    }, 10);
  });
});
