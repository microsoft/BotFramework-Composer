// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import React, { useEffect, useState, Fragment } from 'react';
import { jsx } from '@emotion/core';
import formatMessage from 'format-message';
import { Dropdown, IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import { Link } from 'office-ui-fabric-react/lib/Link';
import { Toggle } from 'office-ui-fabric-react/lib/Toggle';
import { useRecoilValue } from 'recoil';
import { SubscriptionClient } from '@azure/arm-subscriptions';
import { Subscription } from '@azure/arm-subscriptions/esm/models';
import { TokenCredentials } from '@azure/ms-rest-js';
import { Spinner } from 'office-ui-fabric-react/lib/Spinner';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
import { OpenConfirmModal } from '@bfc/ui-shared';
import { Text } from 'office-ui-fabric-react/lib/Text';
import { TeachingBubble } from 'office-ui-fabric-react/lib/TeachingBubble';

import TelemetryClient from '../../../telemetry/TelemetryClient';
import { LoadingSpinner } from '../../../components/LoadingSpinner';
import { navigateTo } from '../../../utils/navigation';
import { botDisplayNameState, settingsState } from '../../../recoilModel';
import { AuthClient } from '../../../utils/authClient';
import { AuthDialog } from '../../../components/Auth/AuthDialog';
import { armScopes } from '../../../constants';
import { getTokenFromCache, isShowAuthDialog, userShouldProvideTokens } from '../../../utils/auth';
import httpClient from '../../../utils/httpUtil';
import { dispatcherState } from '../../../recoilModel';
import {
  tableHeaderRow,
  tableRow,
  tableRowItem,
  tableColumnHeader,
  errorContainer,
  errorIcon,
  errorTextStyle,
  extendedColumnSizes,
  teamsCallOutStyles,
} from '../styles';
import { TeamsManifestGeneratorModal } from '../../../components/Adapters/TeamsManifestGeneratorModal';
import { ManageSpeech } from '../../../components/ManageSpeech/ManageSpeech';

const teamsHelpLink = 'https://aka.ms/composer-channel-teams';
const webchatHelpLink = 'https://aka.ms/composer-channel-webchat';
const speechHelpLink = 'https://aka.ms/composer-channel-speech';

const CHANNELS = {
  TEAMS: 'MsTeamsChannel',
  WEBCHAT: 'WebChatChannel',
  SPEECH: 'DirectLineSpeechChannel',
};

type RuntimeSettingsProps = {
  projectId: string;
};

type AzureResourcePointer = {
  subscriptionId: string | undefined;
  alternateSubscriptionId?: string | undefined;
  resourceName: string;
  resourceGroupName: string;
  microsoftAppId: string;
};

type AzureChannelStatus = {
  enabled: boolean;
  loading: boolean;
};

type AzureChannelsStatus = {
  [key: string]: AzureChannelStatus;
};

/* Copied from Azure Publishing extension */
export enum AzureAPIStatus {
  INFO = 'INFO',
  PARAM_ERROR = 'PARAM_ERROR',
  ERROR = 'ERROR',
}

export const ABSChannels: React.FC<RuntimeSettingsProps> = (props) => {
  const { projectId } = props;
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [currentResource, setCurrentResource] = useState<AzureResourcePointer | undefined>();
  const [channelStatus, setChannelStatus] = useState<AzureChannelsStatus | undefined>();
  const { publishTargets } = useRecoilValue(settingsState(projectId));
  const botDisplayName = useRecoilValue(botDisplayNameState(projectId));
  const [token, setToken] = useState<string | undefined>();
  const [availableSubscriptions, setAvailableSubscriptions] = useState<Subscription[]>([]);
  const [publishTargetOptions, setPublishTargetOptions] = useState<IDropdownOption[]>([]);
  const [isLoading, setLoadingStatus] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);
  const [showSpeechModal, setShowSpeechModal] = useState<boolean>(false);
  const [showTeamsManifestModal, setShowTeamsManifestModal] = useState<boolean>(false);
  const [showTeamsCallOut, setShowTeamsCallOut] = useState<boolean>(false);
  const { setApplicationLevelError } = useRecoilValue(dispatcherState);
  /* Copied from Azure Publishing extension */
  const getSubscriptions = async (token: string): Promise<Array<Subscription>> => {
    const tokenCredentials = new TokenCredentials(token);
    try {
      const subscriptionClient = new SubscriptionClient(tokenCredentials);
      const subscriptionsResult = await subscriptionClient.subscriptions.list();
      // eslint-disable-next-line no-underscore-dangle
      if (subscriptionsResult._response.status >= 300) {
        // eslint-disable-next-line no-underscore-dangle
        setErrorMessage(subscriptionsResult._response.bodyAsText);
        return [];
      }
      // eslint-disable-next-line no-underscore-dangle
      return subscriptionsResult._response.parsedBody;
    } catch (err) {
      setErrorMessage(JSON.stringify(err, Object.getOwnPropertyNames(err)));
      return [];
    }
  };

  const onSelectProfile = async (_, opt) => {
    if (opt.key === 'manageProfiles') {
      TelemetryClient.track('ConnectionsAddNewProfile');
      navigateTo(`/bot/${projectId}/publish/all/#addNewPublishProfile`);
    } else {
      let newtoken = '';
      if (userShouldProvideTokens()) {
        if (isShowAuthDialog(false)) {
          setShowAuthDialog(true);
        }
        newtoken = getTokenFromCache('accessToken');
      } else {
        newtoken = await AuthClient.getAccessToken(armScopes);
      }
      setToken(newtoken);

      // identify the publishing profile in the list
      const profile = publishTargets?.find((p) => p.name === opt.key);
      if (profile) {
        const config = JSON.parse(profile.configuration);
        setCurrentResource({
          microsoftAppId: config?.settings?.MicrosoftAppId,
          resourceName: config.botName || config.name,
          resourceGroupName: config.resourceGroup || config.botName || config.name,
          subscriptionId: config.subscriptionId,
        });
      }
    }
  };

  // allow a user to provide a subscription id if one is missing
  const onChangeSubscription = async (_, opt) => {
    if (currentResource) {
      setCurrentResource({
        ...currentResource,
        alternateSubscriptionId: opt.key,
      });
    }
  };

  const fetchChannelStatus = async (channelId: string) => {
    if (currentResource) {
      try {
        const url = `https://management.azure.com/subscriptions/${
          currentResource.subscriptionId || currentResource.alternateSubscriptionId
        }/resourceGroups/${currentResource.resourceGroupName}/providers/Microsoft.BotService/botServices/${
          currentResource.resourceName
        }/channels/${channelId}?api-version=2020-06-02`;
        await httpClient.get(url, { headers: { Authorization: `Bearer ${token}` } });
        return {
          enabled: true,
          loading: false,
        };
      } catch (err) {
        if (err?.response.data?.error.code === 'ResourceNotFound') {
          // this channel has not yet been created, should display as disabled
          return {
            enabled: false,
            loading: false,
          };
        }
        throw new Error(err?.response.data?.error.message || 'Failed to fetch channel status');
      }
    }
  };

  const createChannelService = async (channelId: string, opts?: any) => {
    if (currentResource) {
      const url = `https://management.azure.com/subscriptions/${
        currentResource.subscriptionId || currentResource.alternateSubscriptionId
      }/resourceGroups/${currentResource.resourceGroupName}/providers/Microsoft.BotService/botServices/${
        currentResource.resourceName
      }/channels/${channelId}?api-version=2020-06-02`;
      let data = {};
      switch (channelId) {
        case CHANNELS.TEAMS:
          data = {
            location: 'global',
            name: `${currentResource.resourceName}/${channelId}`,
            properties: {
              channelName: channelId,
              location: 'global',
              properties: {
                isEnabled: true,
              },
            },
          };
          break;
        case CHANNELS.WEBCHAT:
          data = {
            name: `${currentResource.resourceName}/${channelId}`,
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
            name: `${currentResource.resourceName}/${channelId}`,
            type: 'Microsoft.BotService/botServices/channels',
            location: 'global',
            properties: {
              properties: {
                cognitiveServiceRegion: opts?.cognitiveServiceRegion,
                cognitiveServiceSubscriptionKey: opts?.cognitiveServiceSubscriptionKey,
                isEnabled: true,
                customVoiceDeploymentId: '',
                customSpeechModelId: '',
                isDefaultBotForCogSvcAccount: opts?.isDefaultBotForCogSvcAccount,
              },
              channelName: 'DirectLineSpeechChannel',
              location: 'global',
            },
          };
      }
      await httpClient.put(url, data, { headers: { Authorization: `Bearer ${token}` } });
      if (channelId === CHANNELS.TEAMS) {
        setShowTeamsCallOut(true);
      }
      // success!!
      setChannelStatus({
        ...channelStatus,
        [channelId]: {
          enabled: true,
          loading: false,
        },
      });

      return {
        enabled: true,
        loading: false,
      };
    }
  };

  const deleteChannelService = async (channelId: string) => {
    if (currentResource) {
      const url = `https://management.azure.com/subscriptions/${
        currentResource.subscriptionId || currentResource.alternateSubscriptionId
      }/resourceGroups/${currentResource.resourceGroupName}/providers/Microsoft.BotService/botServices/${
        currentResource.resourceName
      }/channels/${channelId}?api-version=2020-06-02`;
      await httpClient.delete(url, { headers: { Authorization: `Bearer ${token}` } });

      // success!!
      setChannelStatus({
        ...channelStatus,
        [channelId]: {
          enabled: false,
          loading: false,
        },
      });
    }
  };

  const updateChannelStatus = async () => {
    setLoadingStatus(true);
    setErrorMessage(undefined);
    // there is a chance subscriptionId is blank.
    if (currentResource?.subscriptionId || currentResource?.alternateSubscriptionId) {
      // NOW, call ARM api to determine status of each channel...
      // Swagger file for this is here: https://raw.githubusercontent.com/Azure/azure-rest-api-specs/master/specification/botservice/resource-manager/Microsoft.BotService/stable/2020-06-02/botservice.json
      try {
        const teams = await fetchChannelStatus(CHANNELS.TEAMS);
        const webchat = await fetchChannelStatus(CHANNELS.WEBCHAT);
        const speech = await fetchChannelStatus(CHANNELS.SPEECH);

        TelemetryClient.track('ConnectionsChannelStatusDisplayed', {
          teams: teams?.enabled ?? false,
          webchat: webchat?.enabled ?? false,
          speech: speech?.enabled ?? false,
        });

        if (teams && webchat && speech) {
          setChannelStatus({
            [CHANNELS.TEAMS]: teams,
            [CHANNELS.WEBCHAT]: webchat,
            [CHANNELS.SPEECH]: speech,
          });
          setLoadingStatus(false);
        }
      } catch (err) {
        TelemetryClient.track('ConnectionsChannelStatusError', { error: err.message });
        setLoadingStatus(false);
        setChannelStatus(undefined);
        setErrorMessage(err.message);
      }
    }
  };

  const hasAuth = async () => {
    let newtoken = '';
    if (userShouldProvideTokens()) {
      if (isShowAuthDialog(false)) {
        setShowAuthDialog(true);
      }
      newtoken = getTokenFromCache('accessToken');
    } else {
      newtoken = await AuthClient.getAccessToken(armScopes);
    }
    setToken(newtoken);
  };

  const toggleService = (channel) => {
    return async (_, enabled) => {
      TelemetryClient.track('ConnectionsToggleChannel', { channel, enabled });

      if (enabled && channel === CHANNELS.SPEECH) {
        setShowSpeechModal(true);
      } else {
        setChannelStatus({
          ...channelStatus,
          [channel]: {
            enabled: enabled,
            loading: true,
          },
        });

        try {
          if (enabled) {
            await createChannelService(channel);
          } else {
            await deleteChannelService(channel);
          }
        } catch (err) {
          TelemetryClient.track('ConnectionsToggleChannelFailed', { channel, enabled });

          setApplicationLevelError(err);
          setChannelStatus({
            ...channelStatus,
            [channel]: {
              enabled: !enabled,
              loading: false,
            },
          });
        }
      }
    };
  };

  const toggleSpeechOn = async (settings: { key: string; region: string }, isDefault: boolean, attempt = 0) => {
    setChannelStatus({
      ...channelStatus,
      [CHANNELS.SPEECH]: {
        enabled: true,
        loading: true,
      },
    });

    try {
      await createChannelService(CHANNELS.SPEECH, {
        cognitiveServiceSubscriptionKey: settings.key,
        cognitiveServiceRegion: settings.region,
        isDefaultBotForCogSvcAccount: isDefault,
      });
    } catch (err) {
      TelemetryClient.track('ConnectionsToggleChannelFailed', { channel: 'speech', enabled: true });

      setChannelStatus({
        ...channelStatus,
        [CHANNELS.SPEECH]: {
          enabled: false,
          loading: false,
        },
      });
      if (err?.response?.data?.error.code === 'UnknownError' && attempt < 5) {
        console.error(err);
        console.log('Retrying...');
        setTimeout(() => {
          toggleSpeechOn(settings, isDefault, attempt + 1);
        }, 3000);
      } else if (err?.response?.data?.error.code === 'InvalidChannelData') {
        const result = await OpenConfirmModal(
          formatMessage('Enable speech'),
          formatMessage(
            'This cognitive service account is already set as the default for another bot. Do you want to enable this service without setting it as default?'
          )
        );
        if (result) {
          toggleSpeechOn(settings, false);
        }
      } else {
        setApplicationLevelError(err);
      }
    }
  };

  /* Copied from BotStatusList.tx */
  const renderDropdownOption = (option?: IDropdownOption): JSX.Element | null => {
    if (!option) return null;
    const style = {
      ...option.data?.style,
      textOverflow: 'ellipsis',
      overflow: 'hidden',
      whiteSpace: 'nowrap',
    };
    return <div style={style}>{option.text}</div>;
  };

  useEffect(() => {
    // reset the ui back to no selection
    setPublishTargetOptions([]);

    // generate options
    const options: IDropdownOption[] =
      publishTargets?.map((p) => {
        return { key: p.name, text: p.name };
      }) || [];

    // add a link to jump down to create a profile
    options.push({
      key: 'manageProfiles',
      text: formatMessage('Manage profiles'),
      data: { style: { color: '#0078D4' } },
    });
    setPublishTargetOptions(options);
  }, [publishTargets, projectId]);

  useEffect(() => {
    // reset UI
    setChannelStatus(undefined);

    if (token && currentResource && !currentResource.subscriptionId && !currentResource.alternateSubscriptionId) {
      // if we have no subscription id selected, load available subscriptions

      // reset the list
      setAvailableSubscriptions([]);

      // fetch list of available subscriptions
      getSubscriptions(token).then((subscriptions) => setAvailableSubscriptions(subscriptions));
    } else if (
      token &&
      currentResource &&
      (currentResource.subscriptionId || currentResource.alternateSubscriptionId)
    ) {
      // if we have a subscription and a token, go fetch the status
      // we can hide the subscription list
      if (currentResource.subscriptionId) {
        setAvailableSubscriptions([]);
      }
      // we already know everything we need to make the call...
      updateChannelStatus();
    } else {
      // if we have neither a token nor a subscription, we're not ready to do anything yet...
      // reset the UI
      setAvailableSubscriptions([]);
    }
  }, [token, currentResource]);

  const absTableToggle = (key: string) => (
    <Stack horizontal tokens={{ childrenGap: 10 }}>
      <Stack.Item>
        <Toggle
          inlineLabel
          checked={channelStatus?.[key].enabled}
          disabled={channelStatus?.[key].loading}
          styles={{ root: { paddingTop: '8px' } }}
          onChange={toggleService(key)}
        />
      </Stack.Item>
      {channelStatus?.[key].loading && (
        <Stack.Item>
          <Spinner />
        </Stack.Item>
      )}
    </Stack>
  );

  const absTableRow = (channel: string, name: string, link: string) => (
    <div key={channel} css={tableRow}>
      <div css={tableRowItem(extendedColumnSizes[0])}>{name}</div>
      <div css={tableRowItem(extendedColumnSizes[1])}>{absTableToggle(channel)}</div>
      <div css={tableRowItem(extendedColumnSizes[2])}>
        <Stack horizontal tokens={{ childrenGap: 60 }}>
          <Stack.Item>
            <Link href={link} id={channel} target="_docs">
              {formatMessage('Learn more')}
            </Link>
          </Stack.Item>
          {channel === CHANNELS.TEAMS && channelStatus?.[channel].enabled && !channelStatus?.[channel].loading && (
            <Stack.Item>
              <Link
                onClick={() => {
                  setShowTeamsManifestModal(true);
                }}
              >
                {formatMessage('Open manifest')}
              </Link>
            </Stack.Item>
          )}
        </Stack>
      </div>
    </div>
  );

  return (
    <React.Fragment>
      {showAuthDialog && (
        <AuthDialog
          needGraph={false}
          next={hasAuth}
          onDismiss={() => {
            setShowAuthDialog(false);
          }}
        />
      )}
      <ManageSpeech
        hidden={!showSpeechModal}
        onDismiss={() => {
          setShowSpeechModal(false);
        }}
        onGetKey={(settings) => {
          toggleSpeechOn(settings, true);
        }}
        onNext={() => {
          setShowSpeechModal(false);
        }}
        onToggleVisibility={setShowSpeechModal}
      />
      {showTeamsCallOut && (
        <TeachingBubble
          hasCondensedHeadline
          headline={formatMessage('Almost there!')}
          target={`#${CHANNELS.TEAMS}`}
          onDismiss={() => {
            setShowTeamsCallOut(false);
          }}
        >
          <Text block variant="small">
            {formatMessage(
              'Teams requires a few more steps to get your connection up and running. Follow the instructions on our documentation page to learn how.'
            )}
          </Text>
          <Link className={teamsCallOutStyles.link} href={teamsHelpLink} target="_blank">
            {formatMessage('See instructions')}
          </Link>
        </TeachingBubble>
      )}
      <div>
        <Dropdown
          options={publishTargetOptions}
          placeholder={formatMessage('Select publishing profile')}
          styles={{
            root: { display: 'flex', alignItems: 'center', marginBottom: 10 },
            label: { width: 200 },
            dropdown: { width: 300 },
          }}
          onChange={onSelectProfile}
          onRenderOption={renderDropdownOption}
        />

        {availableSubscriptions?.length > 0 && (
          <Dropdown
            label={formatMessage('Subscription Id:')}
            options={
              availableSubscriptions
                ?.filter((p) => p.subscriptionId && p.displayName)
                .map((p) => {
                  return { key: p.subscriptionId ?? '', text: p.displayName ?? 'Unnamed' };
                }) ?? []
            }
            placeholder={formatMessage('Select publishing profile')}
            styles={{
              root: { display: 'flex', alignItems: 'center', marginBottom: 10 },
              label: { width: 200 },
              dropdown: { width: 300 },
            }}
            onChange={onChangeSubscription}
          />
        )}
        {isLoading && <LoadingSpinner />}
        {errorMessage != null && (
          <div css={errorContainer}>
            <Icon iconName="ErrorBadge" styles={errorIcon} />
            <div css={errorTextStyle}>{errorMessage}</div>
          </div>
        )}
        {currentResource && channelStatus && (
          <Fragment>
            <div css={tableHeaderRow}>
              <div css={tableColumnHeader(extendedColumnSizes[0])}>{formatMessage('Name')}</div>
              <div css={tableColumnHeader(extendedColumnSizes[1])}>{formatMessage('Enabled')}</div>
              <div css={tableColumnHeader(extendedColumnSizes[2])}>{formatMessage('Documentation')}</div>
            </div>
            {absTableRow(CHANNELS.TEAMS, formatMessage('MS Teams'), teamsHelpLink)}
            {absTableRow(CHANNELS.WEBCHAT, formatMessage('Web Chat'), webchatHelpLink)}
            {absTableRow(CHANNELS.SPEECH, formatMessage('Speech'), speechHelpLink)}
          </Fragment>
        )}
        <TeamsManifestGeneratorModal
          botAppId={currentResource?.microsoftAppId ? currentResource.microsoftAppId : ''}
          botDisplayName={botDisplayName}
          hidden={!showTeamsManifestModal}
          onDismiss={() => {
            setShowTeamsManifestModal(false);
          }}
        />
      </div>
    </React.Fragment>
  );
};

export default ABSChannels;
