// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import { act, fireEvent } from '@botframework-composer/test-utils';

import { renderWithRecoil } from '../../testUtils/renderWithRecoil';
import ABSChannels from '../../../src/pages/botProject/adapters/ABSChannels';
import { botDisplayNameState, settingsState } from '../../../src/recoilModel';
import * as authUtils from '../../../src/utils/auth';
import httpClient from '../../../src/utils/httpUtil';

jest.mock('../../../src/utils/httpUtil');

const mockNavigationTo = jest.fn();
jest.mock('../../../src/utils/navigation', () => ({
  navigateTo: (...args) => mockNavigationTo(...args),
}));

const CHANNELS = {
  TEAMS: 'MsTeamsChannel',
  WEBCHAT: 'WebChatChannel',
  SPEECH: 'DirectLineSpeechChannel',
};

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
    (httpClient.get as jest.Mock) = jest
      .fn()
      .mockResolvedValue({ data: { properties: { properties: { acceptedTerms: true } } } });
    (httpClient.put as jest.Mock) = jest.fn().mockResolvedValue({});
    (httpClient.delete as jest.Mock) = jest.fn().mockResolvedValue({});

    jest.spyOn(authUtils, 'isShowAuthDialog').mockReturnValue(false);
    jest.spyOn(authUtils, 'getTokenFromCache').mockReturnValue(mockTokenValue);
    jest.spyOn(authUtils, 'userShouldProvideTokens').mockReturnValue(true);
    jest.spyOn(authUtils, 'getTenantIdFromCache').mockReturnValue(mockTenantId);
  });

  const recoilInitState = ({ set }) => {
    set(botDisplayNameState(mockProjId), mockDisplayName);
    set(settingsState(mockProjId), mockSettingsState);
  };

  function renderComponent() {
    return renderWithRecoil(<ABSChannels projectId={mockProjId} />, recoilInitState);
  }

  async function renderComponentOnInitView() {
    const component = renderComponent();
    const dropdown = await component.getByTestId('publishTargetDropDown');

    await act(async () => {
      await fireEvent.click(dropdown);
    });
    const publishTarget = await component.getByText(mockPublishTargetName);

    await act(async () => {
      await fireEvent.click(publishTarget);
    });
    return component;
  }

  it('should render the component with all connections', async () => {
    const component = await renderComponentOnInitView();

    expect(await component.findByText('MS Teams')).toBeTruthy();
    expect(await component.findByText('Web Chat')).toBeTruthy();
    expect(await component.findByText('Speech')).toBeTruthy();
    expect(
      httpClient.get
    ).toBeCalledWith(
      `https://management.azure.com/subscriptions/${mockSubscriptionId}/resourceGroups/${mockResourceGroup}/providers/Microsoft.BotService/botServices/${mockBotName}/channels/MsTeamsChannel?api-version=2020-06-02`,
      { headers: { Authorization: `Bearer ${mockTokenValue}` } }
    );
  });

  it('should enable/disable Teams connection', async () => {
    const mockData = {
      location: 'global',
      name: `${mockBotName}/${CHANNELS.TEAMS}`,
      properties: {
        channelName: CHANNELS.TEAMS,
        location: 'global',
        properties: {
          acceptedTerms: undefined,
          isEnabled: true,
        },
      },
    };

    const component = await renderComponentOnInitView();

    // assert that documentation and manifest link are present when enabled
    expect(component.container).toHaveTextContent('Learn more');
    expect(component.container).toHaveTextContent('Open manifest');

    const teamsToggle = await component.getByTestId(`${CHANNELS.TEAMS}_toggle`);
    await act(async () => {
      await fireEvent.click(teamsToggle);
    });
    expect(
      httpClient.delete
    ).toBeCalledWith(
      `https://management.azure.com/subscriptions/${mockSubscriptionId}/resourceGroups/${mockResourceGroup}/providers/Microsoft.BotService/botServices/${mockBotName}/channels/MsTeamsChannel?api-version=2020-06-02`,
      { headers: { Authorization: `Bearer ${mockTokenValue}` } }
    );
    await act(async () => {
      await fireEvent.click(teamsToggle);
    });
    expect(
      httpClient.put
    ).toBeCalledWith(
      `https://management.azure.com/subscriptions/${mockSubscriptionId}/resourceGroups/${mockResourceGroup}/providers/Microsoft.BotService/botServices/${mockBotName}/channels/MsTeamsChannel?api-version=2020-06-02`,
      mockData,
      { headers: { Authorization: `Bearer ${mockTokenValue}` } }
    );
  });

  it('should call webchat endpoint to enable/disable', async () => {
    const mockData = {
      name: `${mockBotName}/${CHANNELS.WEBCHAT}`,
      type: 'Microsoft.BotService/botServices/channels',
      location: 'global',
      properties: {
        properties: {
          webChatEmbedCode: null,
          sites: [
            {
              siteName: 'Default Site',
              isEnabled: true,
              isWebchatPreviewEnabled: true,
            },
          ],
        },
        channelName: 'WebChatChannel',
        location: 'global',
      },
    };
    const component = await renderComponentOnInitView();
    const webChatToggle = component.getByTestId(`${CHANNELS.WEBCHAT}_toggle`);
    await act(async () => {
      await fireEvent.click(webChatToggle);
    });
    expect(
      httpClient.delete
    ).toBeCalledWith(
      `https://management.azure.com/subscriptions/${mockSubscriptionId}/resourceGroups/${mockResourceGroup}/providers/Microsoft.BotService/botServices/${mockBotName}/channels/${CHANNELS.WEBCHAT}?api-version=2020-06-02`,
      { headers: { Authorization: `Bearer ${mockTokenValue}` } }
    );
    await act(async () => {
      await fireEvent.click(webChatToggle);
    });
    expect(
      httpClient.put
    ).toBeCalledWith(
      `https://management.azure.com/subscriptions/${mockSubscriptionId}/resourceGroups/${mockResourceGroup}/providers/Microsoft.BotService/botServices/${mockBotName}/channels/${CHANNELS.WEBCHAT}?api-version=2020-06-02`,
      mockData,
      { headers: { Authorization: `Bearer ${mockTokenValue}` } }
    );
  });

  it('should call Speech endpoint to disable', async () => {
    const component = await renderComponentOnInitView();
    const speechToggle = component.getByTestId(`${CHANNELS.SPEECH}_toggle`);
    await act(async () => {
      await fireEvent.click(speechToggle);
    });
    expect(
      httpClient.delete
    ).toBeCalledWith(
      `https://management.azure.com/subscriptions/${mockSubscriptionId}/resourceGroups/${mockResourceGroup}/providers/Microsoft.BotService/botServices/${mockBotName}/channels/${CHANNELS.SPEECH}?api-version=2020-06-02`,
      { headers: { Authorization: `Bearer ${mockTokenValue}` } }
    );
  });

  it('should nav to provision profile', async () => {
    const component = renderComponent();
    const dropdown = component.getByTestId('publishTargetDropDown');

    await act(async () => {
      await fireEvent.click(dropdown);
    });
    await act(async () => {
      await fireEvent.click(component.getByText('Manage profiles'));
    });

    expect(mockNavigationTo).toHaveBeenCalledWith(`/bot/${mockProjId}/publish/all/#addNewPublishProfile`);
  });
});
