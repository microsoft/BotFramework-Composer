// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import React, { useEffect, useRef, useState, Fragment } from 'react';
import { jsx, css } from '@emotion/core';
import formatMessage from 'format-message';
import { FontSizes, FontWeights } from 'office-ui-fabric-react/lib/Styling';
import { Dropdown } from 'office-ui-fabric-react/lib/Dropdown';
import { Toggle } from 'office-ui-fabric-react/lib/Toggle';

import { useRecoilValue } from 'recoil';

import { settingsState } from '../../recoilModel';
import { CollapsableWrapper } from '../../components/CollapsableWrapper';
import { AuthClient } from '../../utils/authClient';
import { AuthDialog } from '../../components/Auth/AuthDialog';
import { armScopes } from '../../constants';
import { getTokenFromCache, isShowAuthDialog, isGetTokenFromUser } from '../../utils/auth';
import httpClient from '../../utils/httpUtil';

// -------------------- Styles -------------------- //

const titleStyle = css`
  font-size: ${FontSizes.medium};
  font-weight: ${FontWeights.semibold};
  margin-left: 22px;
  margin-top: 6px;
`;

// -------------------- RuntimeSettings -------------------- //

const CHANNELS = {
  TEAMS: 'MsTeamsChannel',
  WEBCHAT: 'WebChatChannel',
  SPEECH: 'DirectLineSpeechChannel',
};

type RuntimeSettingsProps = {
  projectId: string;
  scrollToSectionId?: string;
};

type AzureResourcePointer = {
  subscriptionId: string | undefined;
  resourceName: string;
  resourceGroupName: string;
};

type AzureChannelStatus = {
  [CHANNELS.TEAMS]: {
    enabled: boolean;
    configured: boolean;
    data: any;
  };
  webchat: {
    enabled: boolean;
    configured: boolean;
    data: any;
  };
  speech: {
    enabled: boolean;
    configured: boolean;
    data: any;
  };
};

export const ABSChannels: React.FC<RuntimeSettingsProps> = (props) => {
  const { projectId, scrollToSectionId } = props;
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [currentResource, setCurrentResource] = useState<AzureResourcePointer | undefined>();
  const [channelStatus, setChannelStatus] = useState<AzureChannelStatus | undefined>();
  const { publishTargets } = useRecoilValue(settingsState(projectId));
  const [token, setToken] = useState<string | undefined>();
  const containerRef = useRef<HTMLDivElement>(null);

  const onSelectProfile = async (evt, opt, index) => {
    console.log('SELETED', opt);
    let newtoken = '';
    if (isGetTokenFromUser()) {
      if (isShowAuthDialog(false)) {
        setShowAuthDialog(true);
      }
      newtoken = getTokenFromCache('accessToken');
    } else {
      newtoken = await AuthClient.getAccessToken(armScopes);
    }
    setToken(newtoken);
    console.log('GOT A TOKEN', newtoken);

    // identify the publishing profile in the list
    const profile = publishTargets?.find((p) => p.name === opt.key);
    if (profile) {
      const config = JSON.parse(profile.configuration);
      setCurrentResource({
        resourceName: config.name,
        resourceGroupName: config.name,
        subscriptionId: config.subscriptionId,
      });
    }
  };

  useEffect(() => {
    console.log('current resource changed!', currentResource);
    if (currentResource && !currentResource.subscriptionId) {
      // fetch list of available subscriptions
      alert('load subscription list');
    } else if (currentResource) {
      console.log('check on status...');
      // we already know everything we need to make the call...
      updateChannelStatus();
    } else {
      // do nothing...
      console.log('do nothing with', currentResource);
    }
  }, [currentResource]);

  useEffect(() => {
    console.log('channel status changed', channelStatus);
  }, [channelStatus]);

  const fetchChannelStatus = async (channelId: string) => {
    try {
      const url = `https://management.azure.com/subscriptions/${currentResource.subscriptionId}/resourceGroups/${currentResource?.resourceGroupName}/providers/Microsoft.BotService/botServices/${currentResource?.resourceName}/channels/${channelId}?api-version=2020-06-02`;
      const res = await httpClient.get(url, { headers: { Authorization: `Bearer ${token}` } });
      console.log(`status of ${channelId}`, channelId, res.data);
      return {
        enabled: true,
        configured: true,
        data: res.data,
      };
    } catch (err) {
      switch (err?.response.data?.error.code) {
        case 'AuthenticationFailed':
        // the auth failed for some reason.
        case 'ResourceNotFound':
          // this channel has not yet been created, should display as disabled
          console.log('RESOURCe NOT FOUND == NOT ENABLED, RETURN FALSE');
          return {
            enabled: false,
            configured: false,
            data: {},
          };
        case 'ResourceGroupNotFound':
        // this resource group is not found - in other words, can't find a channel registration in the expected spot.
        case 'SubscriptionNotFound':
        // the subscription is not found or invalid
        default:
          // handle error.
          break;
      }
      throw new Error(`Failed to retrieve status for ${channelId}`, err?.data?.error.message);
    }
  };

  const createChannelService = async (channelId: string) => {
    try {
      const url = `https://management.azure.com/subscriptions/${currentResource.subscriptionId}/resourceGroups/${currentResource?.resourceGroupName}/providers/Microsoft.BotService/botServices/${currentResource?.resourceName}/channels/${channelId}?api-version=2020-06-02`;
      let data = {};
      switch (channelId) {
        case CHANNELS.TEAMS:
          data = {
            location: 'global',
            name: `${currentResource.name}/${channelId}`,
            properties: {
              channelName: channelId,
              location: 'global',
              properties: {
                // enableCalling: false,
                isEnabled: true,
                // callingWebhook: null,
                // deploymentEnvironment: 0,
                // incomingCallRoute: 'graphPma',
              },
            },
          };
          break;
        case CHANNELS.WEBCHAT:
          data = {
            name: `${currentResource.name}/${channelId}`,
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
          break;
        case CHANNELS.SPEECH:
          data = {
            name: `${currentResource.name}/${channelId}`,
            type: 'Microsoft.BotService/botServices/channels',
            location: 'global',
            properties: {
              properties: {
                cognitiveServiceRegion: null,
                cognitiveServiceSubscriptionKey: null,
                isEnabled: true,
                customVoiceDeploymentId: '',
                customSpeechModelId: '',
                isDefaultBotForCogSvcAccount: false,
              },
              channelName: 'DirectLineSpeechChannel',
              location: 'global',
            },
          };
      }
      const res = await httpClient.put(url, data, { headers: { Authorization: `Bearer ${token}` } });

      // success!!
      setChannelStatus({
        ...channelStatus,
        [channelId]: {
          enabled: true,
          configured: true,
          data: res.data,
        },
      });

      console.log(`status of ${channelId}`, channelId, res.data);
      return {
        enabled: res.data.properties.properties.isEnabled,
        configured: true,
      };
    } catch (err) {
      switch (err?.response.data?.error.code) {
        case 'AuthenticationFailed':
        // the auth failed for some reason.
        case 'ResourceGroupNotFound':
        // this resource group is not found - in other words, can't find a channel registration in the expected spot.
        case 'SubscriptionNotFound':
        // the subscription is not found or invalid
        default:
          // handle error.
          break;
      }
      throw new Error(`Failed to retrieve status for ${channelId}`, err?.data?.error.message);
    }
  };

  const deleteChannelService = async (channelId: string) => {
    try {
      const url = `https://management.azure.com/subscriptions/${currentResource.subscriptionId}/resourceGroups/${currentResource?.resourceGroupName}/providers/Microsoft.BotService/botServices/${currentResource?.resourceName}/channels/${channelId}?api-version=2020-06-02`;
      const data = {
        parameters: {},
      };
      const res = await httpClient.delete(url, { headers: { Authorization: `Bearer ${token}` } });

      console.log('DELETE COMPLETED', res);

      // success!!
      setChannelStatus({
        ...channelStatus,
        [channelId]: {
          enabled: false,
          configured: false,
          data: {},
        },
      });
    } catch (err) {
      switch (err?.response.data?.error.code) {
        case 'AuthenticationFailed':
        // the auth failed for some reason.
        case 'ResourceGroupNotFound':
        // this resource group is not found - in other words, can't find a channel registration in the expected spot.
        case 'SubscriptionNotFound':
        // the subscription is not found or invalid
        default:
          // handle error.
          break;
      }
      throw new Error(`Failed to retrieve status for ${channelId}`, err?.data?.error.message);
    }
  };

  const setEnabledChannelService = async (channelId: string, enabled: boolean) => {
    try {
      const url = `https://management.azure.com/subscriptions/${currentResource.subscriptionId}/resourceGroups/${currentResource?.resourceGroupName}/providers/Microsoft.BotService/botServices/${currentResource?.resourceName}/channels/${channelId}?api-version=2020-06-02`;

      let data = {};
      switch (channelId) {
        case CHANNELS.TEAMS:
          data = {
            ...channelStatus[CHANNELS.TEAMS].data,
          };
          console.log('DATA PARAMETER', data);
          data.properties.properties.isEnabled = enabled;
          console.log('MUTATED DATA', data);
          break;
        case CHANNELS.WEBCHAT:
          // data = { properties: { isEnabled: enabled }};
          // isEnabled = res.data.properties.properties.sites[0].isEnabled;
          break;
      }

      const res = await httpClient.patch(url, data, { headers: { Authorization: `Bearer ${token}` } });
      console.log(`status of ${channelId}`, channelId, res.data);
    } catch (err) {
      switch (err?.response?.data?.error.code) {
        case 'AuthenticationFailed':
        // the auth failed for some reason.
        case 'ResourceGroupNotFound':
        // this resource group is not found - in other words, can't find a channel registration in the expected spot.
        case 'SubscriptionNotFound':
        // the subscription is not found or invalid
        default:
          // handle error.
          break;
      }
      console.error(err);
      // throw new Error(`Failed to retrieve status for ${channelId}`,err?.data?.error.message || err);
    }
  };

  const updateChannelStatus = async () => {
    // there is a chance subscriptionId is blank.
    console.log('update channelSTatus of ', currentResource);
    if (currentResource?.subscriptionId) {
      // NOW, call ARM api to determine status of each channel...
      // Swagger file for this is here: https://raw.githubusercontent.com/Azure/azure-rest-api-specs/master/specification/botservice/resource-manager/Microsoft.BotService/stable/2020-06-02/botservice.json
      try {
        const teams = await fetchChannelStatus(CHANNELS.TEAMS);
        const webchat = await fetchChannelStatus(CHANNELS.WEBCHAT);
        const speech = await fetchChannelStatus(CHANNELS.SPEECH);

        console.log({ teams, webchat, speech });
        setChannelStatus({
          [CHANNELS.TEAMS]: teams,
          [CHANNELS.WEBCHAT]: webchat,
          [CHANNELS.SPEECH]: speech,
        });
      } catch (err) {
        console.error(err);
      }
    }
  };

  const hasAuth = () => {
    console.log('rEADY TO GO');
  };

  const toggleTeams = async (evt, enabled) => {
    console.log('toggle tams to', enabled, channelStatus[CHANNELS.TEAMS]);
    if (enabled) {
      if (channelStatus[CHANNELS.TEAMS].configured) {
        // enable an already existing service
        console.log('ENABLE EXISTING SERVICE');
        const res = await setEnabledChannelService(CHANNELS.TEAMS, true);
      } else {
        // create the teams service and turn it on
        console.log('CREATE A NEW SERVICE');
        const res = await createChannelService(CHANNELS.TEAMS);
      }
    } else {
      if (channelStatus[CHANNELS.TEAMS].configured) {
        // enable an already existing service
        console.log('DISABLE AN EXISTING SERVICE');
        const res = await deleteChannelService(CHANNELS.TEAMS);
      } else {
        // do nothing, service does not exist.
      }
    }
  };

  const toggleWebchat = async (evt, enabled) => {
    console.log('toggle webchat to', enabled, channelStatus[CHANNELS.WEBCHAT]);
    if (enabled) {
      if (channelStatus[CHANNELS.WEBCHAT].configured) {
        // enable an already existing service
        console.log('ENABLE EXISTING SERVICE');
        const res = await setEnabledChannelService(CHANNELS.WEBCHAT, true);
      } else {
        // create the teams service and turn it on
        console.log('CREATE A NEW SERVICE');
        const res = await createChannelService(CHANNELS.WEBCHAT);
      }
    } else {
      if (channelStatus[CHANNELS.WEBCHAT].configured) {
        // enable an already existing service
        console.log('DISABLE AN EXISTING SERVICE');
        const res = await deleteChannelService(CHANNELS.WEBCHAT);
      } else {
        // do nothing, service does not exist.
      }
    }
  };

  const toggleSpeech = async (evt, enabled) => {
    console.log('toggle SPEECH to', enabled, channelStatus[CHANNELS.SPEECH]);
    if (enabled) {
      if (channelStatus[CHANNELS.SPEECH].configured) {
        // enable an already existing service
        console.log('ENABLE EXISTING SERVICE');
        const res = await setEnabledChannelService(CHANNELS.SPEECH, true);
      } else {
        // create the teams service and turn it on
        console.log('CREATE A NEW SERVICE');
        const res = await createChannelService(CHANNELS.SPEECH);
      }
    } else {
      if (channelStatus[CHANNELS.SPEECH].configured) {
        // enable an already existing service
        console.log('DISABLE AN EXISTING SERVICE');
        const res = await deleteChannelService(CHANNELS.SPEECH);
      } else {
        // do nothing, service does not exist.
      }
    }
  };

  useEffect(() => {
    if (containerRef.current && scrollToSectionId === '#runtimeSettings') {
      containerRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [scrollToSectionId]);

  return (
    <CollapsableWrapper title={formatMessage('Azure Bot Service Connections')} titleStyle={titleStyle}>
      {showAuthDialog && (
        <AuthDialog
          needGraph={false}
          next={hasAuth}
          onDismiss={() => {
            setShowAuthDialog(false);
          }}
        />
      )}
      <div ref={containerRef}>
        <Dropdown
          options={publishTargets.map((p) => {
            return { key: p.name, text: p.name };
          })}
          placeholder={formatMessage('Choose publishing profile')}
          onChange={onSelectProfile}
        />

        {currentResource && channelStatus && (
          <Fragment>
            MS Teams
            <Toggle
              inlineLabel
              checked={channelStatus[CHANNELS.TEAMS].enabled}
              // label={formatMessage('Use custom runtime')}
              onChange={toggleTeams}
            />
            Webchat
            <Toggle inlineLabel checked={channelStatus[CHANNELS.WEBCHAT].enabled} onChange={toggleWebchat} />
            Speech
            <Toggle inlineLabel checked={channelStatus[CHANNELS.SPEECH].enabled} onChange={toggleSpeech} />
          </Fragment>
        )}
      </div>
    </CollapsableWrapper>
  );
};
