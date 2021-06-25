// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import { fireEvent } from '@botframework-composer/test-utils';

import { renderWithRecoil } from '../../testUtils/renderWithRecoil';
import ABSChannels from '../../../src/pages/botProject/adapters/ABSChannels';
import { botDisplayNameState, dispatcherState, settingsState } from '../../../src/recoilModel';
import * as authUtils from '../../../src/utils/auth';

const mockProjId = '123';
const mockDisplayName = '';
const mockPublishTargetName = 'target1';
const mockConfigName = mockPublishTargetName;
const mockBotName = 'mockBotName';
const mockAppId = '123';
const mockSubscriptionId = '456';
const mockTenantId = '123';
const mockResourceGroup = 'mockResourceGroup';
const mockTokenValue = '123';

const mockTargetConfig = {
  name: mockConfigName,
  botName: mockBotName,
  MicrosoftAppId: mockAppId,
  resourceGroup: mockResourceGroup,
  tenantId: mockTenantId,
  subscriptionId: mockSubscriptionId,
};

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

const qnaConfig = { subscriptionKey: '12345', endpointKey: '12345', qnaRegion: 'westus' };

const mockSettingsState = {
  luis: luisConfig,
  qna: qnaConfig,
  defaultLanguage: 'en-us',
  languages: ['en-us'],
  luFeatures: {},
  runtime: {
    key: '',
    customRuntime: true,
    path: '',
    command: '',
  },
  importedLibraries: [],
  customFunctions: [],
  publishTargets: [
    {
      name: mockPublishTargetName,
      type: 'azurewebapp',
      configuration: JSON.stringify(mockTargetConfig),
    },
  ],
};

describe('<ABSChannels />', () => {
  beforeEach(() => {
    jest.spyOn(authUtils, 'isShowAuthDialog').mockReturnValue(false);
    jest.spyOn(authUtils, 'getTokenFromCache').mockReturnValue(mockTokenValue);
    jest.spyOn(authUtils, 'userShouldProvideTokens').mockReturnValue(true);
    jest.spyOn(authUtils, 'getTenantIdFromCache').mockReturnValue(mockTenantId);
  });

  const setApplicationLevelErrorMock = jest.fn();
  const recoilInitState = ({ set }) => {
    set(dispatcherState, {
      setApplicationLevelError: setApplicationLevelErrorMock,
    });
    set(botDisplayNameState(mockProjId), mockDisplayName);
    set(settingsState(mockProjId), mockSettingsState);
  };

  function renderComponent() {
    return renderWithRecoil(<ABSChannels projectId={mockProjId} />, recoilInitState);
  }

  it('should render the component with all connections', async () => {
    const component = renderComponent();
    const dropdown = component.getByTestId('publishTargetDropDown');
    fireEvent.click(dropdown);
    fireEvent.click(component.getByText(mockPublishTargetName));

    expect(component.findByText('MS Teams')).toBeTruthy();
    expect(component.findByText('Web Chat')).toBeTruthy();
    expect(component.findByText('Speech')).toBeTruthy();
  });

  // it('should call Teams endpoint to enable/disable', async () => {
  //   const component = renderComponent();
  // });

  // it('should call webchat endpoint to enable/disable', async () => {
  //   const component = renderComponent();
  // });

  // it('should call Speech endpoint to enable/disable', async () => {
  //   const component = renderComponent();
  // });

  // it('should display openable manifest button when Teams is enabled', async () => {
  //   const component = renderComponent();
  // });

  // it('should open external docs', async () => {
  //   const component = renderComponent();
  // });

  // it('should ask to auth if not authenticated', async () => {
  //   const component = renderComponent();
  // });

  // it('should nav to provision profile', async () => {
  //   const component = renderComponent();
  // });
});
