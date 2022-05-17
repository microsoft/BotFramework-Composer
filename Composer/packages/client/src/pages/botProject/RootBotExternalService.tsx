// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import React, { useState, useEffect, useRef, Fragment } from 'react';
import { jsx, keyframes } from '@emotion/react';
import { BotIndexer } from '@bfc/indexers';
import { useRecoilValue } from 'recoil';
import { IDropdownOption } from '@fluentui/react/lib/Dropdown';
import { Icon } from '@fluentui/react/lib/Icon';
import formatMessage from 'format-message';
import get from 'lodash/get';
import { css } from '@emotion/react';
import { FontSizes } from '@fluentui/react/lib/Styling';
import { NeutralColors } from '@fluentui/theme';
import { PrimaryButton } from '@fluentui/react/lib/Button';
import { Link } from '@fluentui/react/lib/Link';
import { MessageBar, MessageBarType } from '@fluentui/react/lib/MessageBar';
import { TextField, DropdownField } from '@bfc/ui-shared';

import {
  dispatcherState,
  settingsState,
  luFilesSelectorFamily,
  qnaFilesSelectorFamily,
  botDisplayNameState,
  dialogsWithLuProviderSelectorFamily,
} from '../../recoilModel';
import settingStorage from '../../utils/dialogSettingStorage';
import { rootBotProjectIdSelector } from '../../recoilModel/selectors/project';
import { mergePropertiesManagedByRootBot } from '../../recoilModel/dispatchers/utils/project';
import { LUIS_REGIONS } from '../../constants';
import { ManageLuis } from '../../components/ManageLuis/ManageLuis';
import { ManageQNA } from '../../components/ManageQNA/ManageQNA';

import { inputFieldStyles, subtext } from './styles';
import { SettingTitle } from './shared/SettingTitle';
// -------------------- Styles -------------------- //

const externalServiceContainerStyle = css`
  display: flex;
  flex-direction: column;
`;

const errorContainer = css`
  display: flex;
  width: 100%;
  height: 48px;
  line-height: 48px;
  background: #fed9cc;
  color: ${NeutralColors.black};
`;

const errorIcon = {
  root: {
    color: '#A80000',
    marginRight: 8,
    paddingLeft: 12,
    fontSize: FontSizes.mediumPlus,
  },
};

const errorTextStyle = css`
  margin-bottom: 5px;
`;

const fadeIn = keyframes`
	from { transform: translate3d(0,-10px,0) }
	to { translate3d(0,0,0) }
`;

const luisRegionErrorContainerStyle = css`
  display: flex;
  width: 100%;
  height: 48px;
  background: #fed9cc;
  color: ${NeutralColors.black};
  line-height: 48px;
  font-size: ${FontSizes.small};
  margin-top: 5px;
  animation-fill-mode: both;
  animation-duration: 0.367s;
  animation-timing-function: cubic-bezier(0.1, 0.9, 0.2, 1);
  animation-name: ${fadeIn};
`;

const luisRegionErrorTextStyle = css`
  margin-bottom: 5px;
`;

// -------------------- ExternalService -------------------- //

type RootBotExternalServiceProps = {
  projectId: string;
  scrollToSectionId?: string;
};

const errorElement = (errorText: string) => {
  if (!errorText) return '';
  return (
    <span css={errorContainer}>
      <Icon iconName="ErrorBadge" styles={errorIcon} />
      <span css={errorTextStyle}>{errorText}</span>
    </span>
  );
};

export const RootBotExternalService: React.FC<RootBotExternalServiceProps> = (props) => {
  const { projectId, scrollToSectionId = '' } = props;
  const { setSettings, setQnASettings } = useRecoilValue(dispatcherState);

  const rootBotProjectId = useRecoilValue(rootBotProjectIdSelector) || '';
  const settings = useRecoilValue(settingsState(projectId));
  const mergedSettings = mergePropertiesManagedByRootBot(projectId, rootBotProjectId, settings);
  const sensitiveGroupManageProperty = settingStorage.get(rootBotProjectId);

  const groupLUISAuthoringKey = get(sensitiveGroupManageProperty, 'luis.authoringKey', {});
  const rootLuisKey = groupLUISAuthoringKey.root;
  const groupLUISEndpointKey = get(sensitiveGroupManageProperty, 'luis.endpointKey', {});
  const rootLuisEndpointKey = groupLUISEndpointKey.root;

  const groupLUISRegion = get(sensitiveGroupManageProperty, 'luis.authoringRegion', {});
  const rootLuisRegion = groupLUISRegion.root;
  const groupQnAKey = get(sensitiveGroupManageProperty, 'qna.subscriptionKey', {});
  const rootqnaKey = groupQnAKey.root;

  const dialogs = useRecoilValue(dialogsWithLuProviderSelectorFamily(projectId));
  const luFiles = useRecoilValue(luFilesSelectorFamily(projectId));
  const qnaFiles = useRecoilValue(qnaFilesSelectorFamily(projectId));
  const botName = useRecoilValue(botDisplayNameState(projectId));
  const isLUISKeyNeeded = BotIndexer.shouldUseLuis(dialogs, luFiles);
  const isQnAKeyNeeded = BotIndexer.shouldUseQnA(dialogs, qnaFiles);

  const rootLuisName = get(settings, 'luis.name', '') || botName;

  const [luisKeyErrorMsg, setLuisKeyErrorMsg] = useState<string>('');
  const [luisRegionErrorMsg, setLuisRegionErrorMsg] = useState<string>('');
  const [qnaKeyErrorMsg, setQnAKeyErrorMsg] = useState<string>('');

  const [localRootLuisKey, setLocalRootLuisKey] = useState<string>(rootLuisKey ?? '');
  const [localRootQnAKey, setLocalRootQnAKey] = useState<string>(rootqnaKey ?? '');
  const [localRootLuisRegion, setLocalRootLuisRegion] = useState<string>(rootLuisRegion ?? '');
  const [localRootLuisName, setLocalRootLuisName] = useState<string>(rootLuisName ?? '');
  const [displayManageLuis, setDisplayManageLuis] = useState<boolean>(false);
  const [displayManageQNA, setDisplayManageQNA] = useState<boolean>(false);

  const luisKeyFieldRef = useRef<HTMLDivElement>(null);
  const luisRegionFieldRef = useRef<HTMLDivElement>(null);
  const qnaKeyFieldRef = useRef<HTMLDivElement>(null);
  const linkToPublishProfile = `/bot/${rootBotProjectId}/publish/all#addNewPublishProfile`;

  const handleRootLUISKeyOnChange = (e, value) => {
    if (value) {
      setLuisKeyErrorMsg('');
      setLocalRootLuisKey(value);
    } else {
      setLuisKeyErrorMsg(
        formatMessage('LUIS key is required with the current recognizer setting to start your bot locally, and publish')
      );
      setLocalRootLuisKey('');
    }
  };

  const handleRootQnAKeyOnChange = (e, value) => {
    if (value) {
      setQnAKeyErrorMsg('');
      setLocalRootQnAKey(value);
    } else {
      setQnAKeyErrorMsg(formatMessage('QnA Maker Subscription key is required to start your bot locally, and publish'));
      setLocalRootQnAKey('');
    }
  };

  const handleRootLuisRegionOnChange = (e, value: IDropdownOption | undefined) => {
    if (value != null) {
      setLuisRegionErrorMsg('');
      setLocalRootLuisRegion(value.key as string);
    } else {
      setLuisRegionErrorMsg(formatMessage('LUIS region is required'));
      setLocalRootLuisRegion('');
    }
  };

  useEffect(() => {
    if (!localRootLuisKey) {
      setLuisKeyErrorMsg(
        formatMessage(
          'LUIS authoring key is required with the current recognizer setting to start your bot locally, and publish'
        )
      );
    } else {
      setLuisKeyErrorMsg('');
    }
    if (!localRootQnAKey) {
      setQnAKeyErrorMsg(formatMessage('QnA Maker Subscription key is required to start your bot locally, and publish'));
    } else {
      setQnAKeyErrorMsg('');
    }

    if (isLUISKeyNeeded && !localRootLuisRegion) {
      setLuisRegionErrorMsg(formatMessage('LUIS region is required'));
    } else {
      setLuisRegionErrorMsg('');
    }
  }, [projectId]);

  useEffect(() => {
    handleRootLUISKeyOnChange(null, rootLuisKey);
  }, [rootLuisKey]);

  useEffect(() => {
    handleRootQnAKeyOnChange(null, rootqnaKey);
  }, [rootqnaKey]);

  useEffect(() => {
    handleRootLuisRegionOnChange(null, { key: rootLuisRegion, text: '' });
  }, [rootLuisRegion]);

  useEffect(() => {
    if (luisKeyFieldRef.current && scrollToSectionId === '#luisKey') {
      luisKeyFieldRef.current.scrollIntoView({ behavior: 'smooth' });
    }
    if (luisRegionFieldRef.current && scrollToSectionId === '#luisRegion') {
      luisRegionFieldRef.current.scrollIntoView({ behavior: 'smooth' });
    }
    if (qnaKeyFieldRef.current && scrollToSectionId === '#qnaKey') {
      qnaKeyFieldRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [scrollToSectionId]);

  const handleRootLUISNameOnChange = (e, value) => {
    setLocalRootLuisName(value);
  };

  const handleRootLUISNameOnBlur = () => {
    setSettings(projectId, {
      ...mergedSettings,
      luis: { ...mergedSettings.luis, name: localRootLuisName },
    });
  };

  const handleRootLuisRegionOnBlur = () => {
    if (isLUISKeyNeeded && !localRootLuisRegion) {
      setLuisRegionErrorMsg(formatMessage('LUIS region is required'));
    }
    setSettings(projectId, {
      ...mergedSettings,
      luis: { ...mergedSettings.luis, authoringRegion: localRootLuisRegion },
    });
  };

  const handleRootLuisAuthoringKeyOnBlur = () => {
    if (!localRootLuisKey) {
      setLuisKeyErrorMsg(
        formatMessage('LUIS key is required with the current recognizer setting to start your bot locally, and publish')
      );
    }
    setSettings(projectId, {
      ...mergedSettings,
      luis: { ...mergedSettings.luis, authoringKey: localRootLuisKey },
    });
  };

  const handleRootQnAKeyOnBlur = () => {
    if (!localRootQnAKey) {
      setQnAKeyErrorMsg(formatMessage('QnA Maker Subscription key is required to start your bot locally, and publish'));
    }
    submitQnASubscripionKey(localRootQnAKey);
  };

  const submitQnASubscripionKey = (key: string) => {
    if (key) {
      setSettings(projectId, {
        ...mergedSettings,
        qna: { ...mergedSettings.qna, subscriptionKey: key },
      });
      setQnASettings(projectId, key);
    } else {
      setSettings(projectId, {
        ...mergedSettings,
        qna: { ...mergedSettings.qna, subscriptionKey: '', endpointKey: '' },
      });
    }
  };

  const updateLuisSettings = (newLuisSettings) => {
    setSettings(projectId, {
      ...mergedSettings,
      luis: { ...mergedSettings.luis, authoringKey: newLuisSettings.key, authoringRegion: newLuisSettings.region },
    });
  };

  const updateQNASettings = (newQNASettings) => {
    setSettings(projectId, {
      ...mergedSettings,
      qna: { ...mergedSettings.qna, subscriptionKey: newQNASettings.key },
    });
    setQnASettings(projectId, newQNASettings.key);
  };

  return (
    <Fragment>
      <SettingTitle>{formatMessage('Azure Language Understanding')}</SettingTitle>
      <div css={subtext}>
        {formatMessage.rich(
          'Language Understanding (LUIS) is an Azure Cognitive Service that uses machine learning to understand natural language input and direct the conversation flow. <a>Learn more.</a> Use an existing Language Understanding (LUIS) key from Azure or create a new key. <a2>Learn more</a2>',
          {
            a: ({ children }) => (
              <Link
                key="luis-root-bot-settings-page"
                aria-label={formatMessage('Learn more about Language Understanding (LUIS)')}
                href={'https://www.luis.ai/'}
                target="_blank"
              >
                {children}
              </Link>
            ),
            a2: ({ children }) => (
              <Link
                key="luis-root-bot-settings-page-learn-more"
                aria-label={formatMessage('Learn more on how to add Language Understanding to your bot')}
                href={'https://aka.ms/composer-luis-learnmore'}
                target="_blank"
              >
                {children}
              </Link>
            ),
          }
        )}
      </div>
      <div css={externalServiceContainerStyle}>
        <TextField
          data-testid={'rootLUISApplicationName'}
          id={'luisName'}
          label={formatMessage('Application name')}
          placeholder={formatMessage('Type application name')}
          styles={inputFieldStyles}
          tooltip={formatMessage('Application name')}
          value={localRootLuisName}
          onBlur={handleRootLUISNameOnBlur}
          onChange={handleRootLUISNameOnChange}
        />
        <div ref={luisKeyFieldRef}>
          <TextField
            data-testid={'rootLUISAuthoringKey'}
            errorMessage={isLUISKeyNeeded ? errorElement(luisKeyErrorMsg) : ''}
            id={'luisAuthoringKey'}
            label={formatMessage('Language Understanding authoring key')}
            placeholder={formatMessage('Type Language Understanding authoring key')}
            required={isLUISKeyNeeded}
            styles={inputFieldStyles}
            tooltip={formatMessage('Language Understanding authoring key')}
            value={localRootLuisKey}
            onBlur={handleRootLuisAuthoringKeyOnBlur}
            onChange={handleRootLUISKeyOnChange}
          />
        </div>
        <div ref={luisRegionFieldRef}>
          <DropdownField
            ariaLabel={formatMessage('Language Understanding region')}
            data-testid={'rootLUISRegion'}
            id={'luisRegion'}
            label={formatMessage('Language Understanding region')}
            options={LUIS_REGIONS}
            placeholder={formatMessage('Select region')}
            required={isLUISKeyNeeded}
            selectedKey={localRootLuisRegion}
            styles={inputFieldStyles}
            tooltip={formatMessage('Language Understanding region')}
            onBlur={handleRootLuisRegionOnBlur}
            onChange={handleRootLuisRegionOnChange}
          />
          {luisRegionErrorMsg && (
            <div css={luisRegionErrorContainerStyle}>
              <Icon iconName="ErrorBadge" styles={errorIcon} />
              <div css={luisRegionErrorTextStyle}>{luisRegionErrorMsg}</div>
            </div>
          )}
        </div>
        <PrimaryButton
          styles={{ root: { width: '250px', marginTop: '15px' } }}
          text={formatMessage('Set up Language Understanding')}
          onClick={() => {
            setDisplayManageLuis(true);
          }}
        />
        {localRootLuisKey && !rootLuisEndpointKey && (
          <MessageBar messageBarType={MessageBarType.info} styles={{ root: { width: '75%', marginTop: 20 } }}>
            {formatMessage.rich(
              'Your bot is configured with only a LUIS authoring key, which has a limit of 1,000 calls per month. If your bot hits this limit, publish it to Azure using a <a>publishing profile</a> to continue testing.<a2>Learn more</a2>',
              {
                a: ({ children }) => (
                  <Link
                    key="luis-endpoint-key-info"
                    aria-label={formatMessage(
                      'Learn more about configuring Azure publishing on the "Publishing Profiles" page'
                    )}
                    href={linkToPublishProfile}
                  >
                    {children}
                  </Link>
                ),
                a2: ({ children }) => (
                  <Link
                    key="luis-endpoint-key-limits-info"
                    aria-label={formatMessage('Learn more about LUIS usage limits')}
                    href={'https://aka.ms/composer-settings-luislimits'}
                    target="_blank"
                  >
                    {children}
                  </Link>
                ),
              }
            )}
          </MessageBar>
        )}
        <SettingTitle>{formatMessage('Azure QnA Maker')}</SettingTitle>
        <div css={subtext}>
          {formatMessage.rich(
            'QnA Maker is an Azure Cognitive services that can extract question-and-answer pairs from a website FAQ. <a>Learn more.</a> Use an existing key from Azure or create a new key. <a2>Learn more.</a2>',
            {
              a: ({ children }) => (
                <Link
                  key="qna-root-bot-settings-page"
                  aria-label={formatMessage('Learn more about QnA Maker')}
                  href={'https://www.qnamaker.ai/'}
                  target="_blank"
                >
                  {children}
                </Link>
              ),
              a2: ({ children }) => (
                <Link
                  key="qna-root-bot-settings-page-learn-more"
                  aria-label={formatMessage('Learn more on how to add QnA to your bot')}
                  href={'https://aka.ms/composer-addqnamaker-learnmore'}
                  target="_blank"
                >
                  {children}
                </Link>
              ),
            }
          )}
        </div>
        <div ref={qnaKeyFieldRef}>
          <TextField
            data-testid={'QnASubscriptionKey'}
            errorMessage={isQnAKeyNeeded ? errorElement(qnaKeyErrorMsg) : ''}
            id={'qnaKey'}
            label={formatMessage('QnA Maker Subscription key')}
            placeholder={formatMessage('Type subscription key')}
            required={isQnAKeyNeeded}
            styles={inputFieldStyles}
            tooltip={formatMessage('QnA Maker Subscription key')}
            value={localRootQnAKey}
            onBlur={handleRootQnAKeyOnBlur}
            onChange={handleRootQnAKeyOnChange}
          />
        </div>
        <PrimaryButton
          styles={{ root: { width: '250px', marginTop: '15px' } }}
          text={formatMessage('Set up QnA Maker')}
          onClick={() => {
            setDisplayManageQNA(true);
          }}
        />
        <ManageLuis
          hidden={!displayManageLuis}
          onDismiss={() => {
            setDisplayManageLuis(false);
          }}
          onGetKey={updateLuisSettings}
          onNext={() => {
            setDisplayManageLuis(false);
          }}
          onToggleVisibility={setDisplayManageLuis}
        />
        <ManageQNA
          hidden={!displayManageQNA}
          onDismiss={() => {
            setDisplayManageQNA(false);
          }}
          onGetKey={updateQNASettings}
          onNext={() => {
            setDisplayManageQNA(false);
          }}
          onToggleVisibility={setDisplayManageQNA}
        />
      </div>
    </Fragment>
  );
};
