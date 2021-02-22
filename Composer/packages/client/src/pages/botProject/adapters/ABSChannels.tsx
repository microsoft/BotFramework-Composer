// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import React, { useEffect, useState, Fragment } from 'react';
import { jsx } from '@emotion/core';
import formatMessage from 'format-message';
import { Dropdown, IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import { TooltipHost } from 'office-ui-fabric-react/lib/Tooltip';
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

import { LoadingSpinner } from '../../../components/LoadingSpinner';
import { navigateTo } from '../../../utils/navigation';
import { settingsState } from '../../../recoilModel';
import { AuthClient } from '../../../utils/authClient';
import { AuthDialog } from '../../../components/Auth/AuthDialog';
import { armScopes } from '../../../constants';
import { getTokenFromCache, isShowAuthDialog, isGetTokenFromUser } from '../../../utils/auth';
import httpClient from '../../../utils/httpUtil';
import { dispatcherState } from '../../../recoilModel';
import {
  tableRow,
  tableRowItem,
  tableColumnHeader,
  labelContainer,
  customerLabel,
  unknownIconStyle,
  errorContainer,
  errorIcon,
  errorTextStyle,
} from '../styles';

import ABSChannelSpeechModal from './ABSChannelSpeechModal';

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
  const [token, setToken] = useState<string | undefined>();
  const [availableSubscriptions, setAvailableSubscriptions] = useState<Subscription[]>([]);
  const [publishTargetOptions, setPublishTargetOptions] = useState<IDropdownOption[]>([]);
  const [isLoading, setLoadingStatus] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);
  const [showSpeechModal, setShowSpeechModal] = useState<boolean>(false);
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
      navigateTo(`/bot/${projectId}/botProjectsSettings/#addNewPublishProfile`);
    } else {
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

        if (teams && webchat && speech) {
          setChannelStatus({
            [CHANNELS.TEAMS]: teams,
            [CHANNELS.WEBCHAT]: webchat,
            [CHANNELS.SPEECH]: speech,
          });
          setLoadingStatus(false);
        }
      } catch (err) {
        setLoadingStatus(false);
        setChannelStatus(undefined);
        setErrorMessage(err.message);
      }
    }
  };

  const hasAuth = async () => {
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
  };

  const toggleService = (channel) => {
    return async (_, enabled) => {
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

  const toggleSpeechOn = async (key: string, region: string, isDefault: boolean) => {
    setChannelStatus({
      ...channelStatus,
      [CHANNELS.SPEECH]: {
        enabled: true,
        loading: true,
      },
    });

    try {
      await createChannelService(CHANNELS.SPEECH, {
        cognitiveServiceSubscriptionKey: key,
        cognitiveServiceRegion: region,
        isDefaultBotForCogSvcAccount: isDefault,
      });
    } catch (err) {
      setChannelStatus({
        ...channelStatus,
        [CHANNELS.SPEECH]: {
          enabled: false,
          loading: false,
        },
      });

      if (err?.response?.data?.error.code === 'InvalidChannelData') {
        const result = await OpenConfirmModal(
          formatMessage('Enable speech'),
          formatMessage(
            'This cognitive service account is already set as the default for another bot. Do you want to enable this service without setting it as default?'
          )
        );
        if (result) {
          toggleSpeechOn(key, region, false);
        }
      } else {
        setApplicationLevelError(err);
      }
    }
  };

  const onRenderLabel = (props) => {
    return (
      <div css={labelContainer}>
        <div css={customerLabel}> {props.label} </div>
        <TooltipHost content={props.label}>
          <Icon iconName="Unknown" styles={unknownIconStyle(props.required)} />
        </TooltipHost>
      </div>
    );
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

  const columnWidths = ['300px', '150px', '150px'];

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
      <div css={tableRowItem(columnWidths[0])}>{name}</div>
      <div css={tableRowItem(columnWidths[1])}>
        <Link href={link} target="_docs">
          {formatMessage('Learn more')}
        </Link>
      </div>
      <div css={tableRowItem(columnWidths[2])}>{absTableToggle(channel)}</div>
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
      <ABSChannelSpeechModal
        isOpen={showSpeechModal}
        onClose={() => {
          setShowSpeechModal(false);
        }}
        onUpdateKey={toggleSpeechOn}
      />
      <div>
        <Dropdown
          label={formatMessage('Publish profile to configure:')}
          options={publishTargetOptions}
          placeholder={formatMessage('Choose publishing profile')}
          styles={{
            root: { display: 'flex', alignItems: 'center', marginBottom: 10 },
            label: { width: 200 },
            dropdown: { width: 300 },
          }}
          onChange={onSelectProfile}
          onRenderLabel={onRenderLabel}
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
            placeholder={formatMessage('Choose subscription')}
            styles={{
              root: { display: 'flex', alignItems: 'center', marginBottom: 10 },
              label: { width: 200 },
              dropdown: { width: 300 },
            }}
            onChange={onChangeSubscription}
            onRenderLabel={onRenderLabel}
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
            <div css={tableRow}>
              <div css={tableColumnHeader(columnWidths[0])}>{formatMessage('Name')}</div>
              <div css={tableColumnHeader(columnWidths[1])}>{formatMessage('Documentation')}</div>
              <div css={tableColumnHeader(columnWidths[2])}>{formatMessage('Enabled')}</div>
            </div>
            {absTableRow(CHANNELS.TEAMS, formatMessage('MS Teams'), teamsHelpLink)}
            {absTableRow(CHANNELS.WEBCHAT, formatMessage('Webchat'), webchatHelpLink)}
            {absTableRow(CHANNELS.SPEECH, formatMessage('Speech'), speechHelpLink)}
          </Fragment>
        )}
      </div>
    </React.Fragment>
  );
};

export default ABSChannels;
