// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import React, { useEffect, useRef, useState, Fragment } from 'react';
import { jsx, css } from '@emotion/core';
import formatMessage from 'format-message';
import { FontSizes, FontWeights } from 'office-ui-fabric-react/lib/Styling';
import { Dropdown, IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import { TooltipHost } from 'office-ui-fabric-react/lib/Tooltip';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import { Link } from 'office-ui-fabric-react/lib/Link';
import { Toggle } from 'office-ui-fabric-react/lib/Toggle';
import { useRecoilValue } from 'recoil';
import { SubscriptionClient } from '@azure/arm-subscriptions';
import { Subscription } from '@azure/arm-subscriptions/esm/models';
import { TokenCredentials } from '@azure/ms-rest-js';
import { NeutralColors, SharedColors } from '@uifabric/fluent-theme';
import { Spinner } from 'office-ui-fabric-react/lib/Spinner';
import { Stack } from 'office-ui-fabric-react/lib/Stack';

import { LoadingSpinner } from '../../components/LoadingSpinner';
import { navigateTo } from '../../utils/navigation';
import { settingsState } from '../../recoilModel';
import { CollapsableWrapper } from '../../components/CollapsableWrapper';
import { AuthClient } from '../../utils/authClient';
import { AuthDialog } from '../../components/Auth/AuthDialog';
import { armScopes } from '../../constants';
import { getTokenFromCache, isShowAuthDialog, isGetTokenFromUser } from '../../utils/auth';
import httpClient from '../../utils/httpUtil';

import { tableRow, tableRowItem, tableColumnHeader } from './styles';

// TODO: move these to the styles file once we merge with Ben Y's branch
// -------------------- Styles -------------------- //

const titleStyle = css`
  font-size: ${FontSizes.medium};
  font-weight: ${FontWeights.semibold};
  margin-left: 22px;
  margin-top: 6px;
`;

const labelContainer = css`
  display: flex;
  flex-direction: row;
  width: 200px;
`;

const customerLabel = css`
  font-size: ${FontSizes.medium};
  margin-right: 5px;
`;

const errorContainer = css`
  display: flex;
  width: 100%;
  line-height: 24px;
  padding-top: 12px;
  padding-bottom: 12px;
  background: #fed9cc;
  color: ${NeutralColors.black};
`;

const errorTextStyle = css`
  margin-bottom: 5px;
  font-size: ${FontSizes.small};
`;

const errorIcon = {
  root: {
    color: '#A80000',
    marginRight: 8,
    paddingLeft: 12,
    fontSize: FontSizes.mediumPlus,
  },
};

const unknownIconStyle = (required) => {
  return {
    root: {
      selectors: {
        '&::before': {
          content: required ? " '*'" : '',
          color: SharedColors.red10,
          paddingRight: 10,
        },
      },
    },
  };
};

// -------------------- RuntimeSettings -------------------- //

const teamsHelpLink = 'https://aka.ms/configureComposerTeamsChannel';
const webchatHelpLink = 'https://aka.ms/configureComposerWebchatChannel';
const speechHelpLink = 'https://aka.ms/configureComposerSpeechChannel';

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
  const { projectId, scrollToSectionId } = props;
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [currentResource, setCurrentResource] = useState<AzureResourcePointer | undefined>();
  const [channelStatus, setChannelStatus] = useState<AzureChannelsStatus | undefined>();
  const { publishTargets } = useRecoilValue(settingsState(projectId));
  const [token, setToken] = useState<string | undefined>();
  const [availableSubscriptions, setAvailableSubscriptions] = useState<Subscription[]>([]);
  const [publishTargetOptions, setPublishTargetOptions] = useState<IDropdownOption[]>([]);
  const [isLoadingStatus, setLoadingStatus] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);

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
        }/resourceGroups/${currentResource?.resourceGroupName}/providers/Microsoft.BotService/botServices/${
          currentResource?.resourceName
        }/channels/${channelId}?api-version=2020-06-02`;
        await httpClient.get(url, { headers: { Authorization: `Bearer ${token}` } });
        return {
          enabled: true,
          loading: false,
        };
      } catch (err) {
        switch (err?.response.data?.error.code) {
          case 'ResourceNotFound':
            // this channel has not yet been created, should display as disabled
            return {
              enabled: false,
              loading: false,
            };
            break;
          case 'AuthenticationFailed':
            // the auth failed for some reason.
            break;
          case 'ResourceGroupNotFound':
            // this resource group is not found - in other words, can't find a channel registration in the expected spot.
            break;
          case 'SubscriptionNotFound':
            // the subscription is not found or invalid
            break;
          default:
            // handle error.
            break;
        }
        throw new Error(err?.response.data?.error.message || 'Failed to fetch channel status');
      }
    }
  };

  const createChannelService = async (channelId: string) => {
    if (currentResource) {
      try {
        const url = `https://management.azure.com/subscriptions/${
          currentResource.subscriptionId || currentResource.alternateSubscriptionId
        }/resourceGroups/${currentResource?.resourceGroupName}/providers/Microsoft.BotService/botServices/${
          currentResource?.resourceName
        }/channels/${channelId}?api-version=2020-06-02`;
        let data = {};
        switch (channelId) {
          case CHANNELS.TEAMS:
            data = {
              location: 'global',
              name: `${currentResource?.resourceName}/${channelId}`,
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
              name: `${currentResource?.resourceName}/${channelId}`,
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
              name: `${currentResource?.resourceName}/${channelId}`,
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
      } catch (err) {
        switch (err?.response.data?.error.code) {
          case 'AuthenticationFailed':
            // the auth failed for some reason.
            break;
          case 'ResourceGroupNotFound':
            // this resource group is not found - in other words, can't find a channel registration in the expected spot.
            break;
          case 'SubscriptionNotFound':
            // the subscription is not found or invalid
            break;
          default:
            // handle error.
            break;
        }
        throw new Error(err?.response.data?.error.message || 'Failed to create new channel');
      }
    }
  };

  const deleteChannelService = async (channelId: string) => {
    if (currentResource) {
      try {
        const url = `https://management.azure.com/subscriptions/${
          currentResource.subscriptionId || currentResource.alternateSubscriptionId
        }/resourceGroups/${currentResource?.resourceGroupName}/providers/Microsoft.BotService/botServices/${
          currentResource?.resourceName
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
      } catch (err) {
        switch (err?.response.data?.error.code) {
          case 'AuthenticationFailed':
            // the auth failed for some reason.
            break;

          case 'ResourceGroupNotFound':
            // this resource group is not found - in other words, can't find a channel registration in the expected spot.
            break;

          case 'SubscriptionNotFound':
            // the subscription is not found or invalid
            break;

          default:
            // handle error.
            break;
        }
        throw new Error(err?.response.data?.error.message || 'Failed to delete new channel');
      }
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
      setChannelStatus({
        ...channelStatus,
        [channel]: {
          enabled: enabled,
          loading: true,
        },
      });

      if (enabled) {
        await createChannelService(channel);
      } else {
        await deleteChannelService(channel);
      }
    };
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
    if (containerRef.current && scrollToSectionId === '#runtimeSettings') {
      containerRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [scrollToSectionId]);

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

        {availableSubscriptions?.length ? (
          <Dropdown
            label={formatMessage('Subscription Id:')}
            options={
              availableSubscriptions
                ?.filter((p) => p.subscriptionId && p.displayName)
                .map((p) => {
                  return { key: p.subscriptionId || '', text: p.displayName || 'Unnamed' };
                }) || []
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
        ) : (
          ''
        )}
        {isLoadingStatus ? <LoadingSpinner /> : ''}
        {errorMessage ? (
          <div css={errorContainer}>
            <Icon iconName="ErrorBadge" styles={errorIcon} />
            <div css={errorTextStyle}>{errorMessage}</div>
          </div>
        ) : (
          ''
        )}
        {currentResource && channelStatus && (
          <Fragment>
            <div css={tableRow}>
              <div css={tableColumnHeader(columnWidths[0])}>{formatMessage('Name')}</div>
              <div css={tableColumnHeader(columnWidths[1])}>{formatMessage('Documentation')}</div>
              <div css={tableColumnHeader(columnWidths[2])}>{formatMessage('Enabled')}</div>
            </div>
            <div key={CHANNELS.TEAMS} css={tableRow}>
              <div css={tableRowItem(columnWidths[0])}>{formatMessage('MS Teams')}</div>
              <div css={tableRowItem(columnWidths[1])}>
                <Link href={teamsHelpLink} target="_docs">
                  {formatMessage('Learn more')}
                </Link>
              </div>
              <div css={tableRowItem(columnWidths[2])}>
                <Stack horizontal tokens={{ childrenGap: 10 }}>
                  <Stack.Item>
                    <Toggle
                      inlineLabel
                      checked={channelStatus[CHANNELS.TEAMS].enabled}
                      disabled={channelStatus[CHANNELS.TEAMS].loading}
                      onChange={toggleService(CHANNELS.TEAMS)}
                    />
                  </Stack.Item>
                  {channelStatus[CHANNELS.TEAMS].loading ? (
                    <Stack.Item>
                      <Spinner />
                    </Stack.Item>
                  ) : (
                    ''
                  )}
                </Stack>
              </div>
            </div>
            <div key={CHANNELS.WEBCHAT} css={tableRow}>
              <div css={tableRowItem(columnWidths[0])}>{formatMessage('Webchat')}</div>
              <div css={tableRowItem(columnWidths[1])}>
                <Link href={webchatHelpLink} target="_docs">
                  {formatMessage('Learn more')}
                </Link>
              </div>
              <div css={tableRowItem(columnWidths[2])}>
                <Stack horizontal tokens={{ childrenGap: 10 }}>
                  <Stack.Item>
                    <Toggle
                      inlineLabel
                      checked={channelStatus[CHANNELS.WEBCHAT].enabled}
                      disabled={channelStatus[CHANNELS.WEBCHAT].loading}
                      onChange={toggleService(CHANNELS.WEBCHAT)}
                    />
                  </Stack.Item>
                  {channelStatus[CHANNELS.WEBCHAT].loading ? (
                    <Stack.Item>
                      <Spinner />
                    </Stack.Item>
                  ) : (
                    ''
                  )}
                </Stack>
              </div>
            </div>
            <div key={CHANNELS.SPEECH} css={tableRow}>
              <div css={tableRowItem(columnWidths[0])}>{formatMessage('Speech')}</div>
              <div css={tableRowItem(columnWidths[1])}>
                {' '}
                <Link href={speechHelpLink} target="_docs">
                  {formatMessage('Learn more')}
                </Link>
              </div>
              <div css={tableRowItem(columnWidths[2])}>
                <Stack horizontal tokens={{ childrenGap: 10 }}>
                  <Stack.Item>
                    <Toggle
                      inlineLabel
                      checked={channelStatus[CHANNELS.SPEECH].enabled}
                      disabled={channelStatus[CHANNELS.SPEECH].loading}
                      onChange={toggleService(CHANNELS.SPEECH)}
                    />
                  </Stack.Item>
                  {channelStatus[CHANNELS.SPEECH].loading ? (
                    <Stack.Item>
                      <Spinner />
                    </Stack.Item>
                  ) : (
                    ''
                  )}
                </Stack>
              </div>
            </div>
          </Fragment>
        )}
      </div>
    </CollapsableWrapper>
  );
};
