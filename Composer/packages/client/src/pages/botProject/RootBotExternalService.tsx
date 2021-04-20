// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import React, { useState, useEffect, useRef, Fragment } from 'react';
import { jsx, keyframes } from '@emotion/core';
import { BotIndexer } from '@bfc/indexers';
import { useRecoilValue } from 'recoil';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { Dropdown, IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import { TooltipHost } from 'office-ui-fabric-react/lib/Tooltip';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import formatMessage from 'format-message';
import get from 'lodash/get';
import { css } from '@emotion/core';
import { FontSizes } from 'office-ui-fabric-react/lib/Styling';
import { NeutralColors, SharedColors } from '@uifabric/fluent-theme';
import { PrimaryButton } from 'office-ui-fabric-react/lib/Button';
import { Link } from 'office-ui-fabric-react/lib/Link';

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

import { inputFieldStyles, subtext, title } from './styles';

// -------------------- Styles -------------------- //

const labelContainer = css`
  display: flex;
  flex-direction: row;
`;

const customerLabel = css`
  font-size: ${FontSizes.small};
  margin-right: 5px;
`;

const unknownIconStyle = (required) => {
  return {
    root: {
      selectors: {
        '&::before': {
          content: required ? " '*'" : '',
          color: SharedColors.red10,
          paddingRight: 3,
        },
      },
    },
  };
};

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
      luis: { ...mergedSettings.luis, ...newLuisSettings },
    });
  };

  const updateQNASettings = (newQNASettings) => {
    setSettings(projectId, {
      ...mergedSettings,
      qna: { ...mergedSettings.qna, ...newQNASettings },
    });
    setQnASettings(projectId, newQNASettings.subscriptionKey);
  };

  return (
    <Fragment>
      <div css={title}>{formatMessage('Language Understanding')}</div>
      <div css={subtext}>
        {formatMessage.rich(
          '<a>Language Understanding Intelligent Service (LUIS)</a> is a machine learning-driven recognition service that enables advanced conversational capabilities. If you already have LUIS keys you’d like to use, you can paste them below. To fetch existing keys from Azure or create new keys, you can click “Get LUIS keys”. <a2>Learn more</a2>.',
          {
            a: ({ children }) => (
              <Link href={''} target="_blank">
                {children}
              </Link>
            ),
            a2: ({ children }) => (
              <Link href={''} target="_blank">
                {children}
              </Link>
            ),
          }
        )}
      </div>
      <div css={externalServiceContainerStyle}>
        <TextField
          ariaLabel={formatMessage('LUIS application name')}
          data-testid={'rootLUISApplicationName'}
          id={'luisName'}
          label={formatMessage('LUIS application name')}
          placeholder={formatMessage('Enter LUIS application name')}
          styles={inputFieldStyles}
          value={localRootLuisName}
          onBlur={handleRootLUISNameOnBlur}
          onChange={handleRootLUISNameOnChange}
          onRenderLabel={onRenderLabel}
        />
        <div ref={luisKeyFieldRef}>
          <TextField
            ariaLabel={formatMessage('LUIS authoring key')}
            data-testid={'rootLUISAuthoringKey'}
            errorMessage={isLUISKeyNeeded ? errorElement(luisKeyErrorMsg) : ''}
            id={'luisAuthoringKey'}
            label={formatMessage('LUIS authoring key')}
            placeholder={formatMessage('Enter LUIS authoring key')}
            required={isLUISKeyNeeded}
            styles={inputFieldStyles}
            value={localRootLuisKey}
            onBlur={handleRootLuisAuthoringKeyOnBlur}
            onChange={handleRootLUISKeyOnChange}
            onRenderLabel={onRenderLabel}
          />
        </div>
        <div ref={luisRegionFieldRef}>
          <Dropdown
            ariaLabel={formatMessage('LUIS region')}
            data-testid={'rootLUISRegion'}
            id={'luisRegion'}
            label={formatMessage('LUIS region')}
            options={LUIS_REGIONS}
            placeholder={formatMessage('Enter LUIS region')}
            required={isLUISKeyNeeded}
            selectedKey={localRootLuisRegion}
            styles={inputFieldStyles}
            onBlur={handleRootLuisRegionOnBlur}
            onChange={handleRootLuisRegionOnChange}
            onRenderLabel={onRenderLabel}
          />
          {luisRegionErrorMsg && (
            <div css={luisRegionErrorContainerStyle}>
              <Icon iconName="ErrorBadge" styles={errorIcon} />
              <div css={luisRegionErrorTextStyle}>{luisRegionErrorMsg}</div>
            </div>
          )}
        </div>
        <PrimaryButton
          disabled={displayManageLuis || displayManageQNA}
          styles={{ root: { width: '130px', marginTop: '15px' } }}
          text={formatMessage('Get LUIS keys')}
          onClick={() => {
            setDisplayManageLuis(true);
          }}
        />
        <div css={title}>{formatMessage('QnA Maker')}</div>
        <div css={subtext}>
          {formatMessage.rich(
            'Integrate with <a>QnA Maker</a> to provide bot content from easy-to-manage knowledge bases. If you already have a QnA key you’d like to use, you can paste it below. To fetch an existing key from Azure or create a new key, you can click “Get QnA key”. <a2>Learn more</a2>.',
            {
              a: ({ children }) => (
                <Link href={''} target="_blank">
                  {children}
                </Link>
              ),
              a2: ({ children }) => (
                <Link href={''} target="_blank">
                  {children}
                </Link>
              ),
            }
          )}
        </div>
        <div ref={qnaKeyFieldRef}>
          <TextField
            ariaLabel={formatMessage('QnA Maker Subscription key')}
            data-testid={'QnASubscriptionKey'}
            errorMessage={isQnAKeyNeeded ? errorElement(qnaKeyErrorMsg) : ''}
            id={'qnaKey'}
            label={formatMessage('QnA Maker Subscription key')}
            placeholder={formatMessage('Enter QnA Maker Subscription key')}
            required={isQnAKeyNeeded}
            styles={inputFieldStyles}
            value={localRootQnAKey}
            onBlur={handleRootQnAKeyOnBlur}
            onChange={handleRootQnAKeyOnChange}
            onRenderLabel={onRenderLabel}
          />
        </div>
        <PrimaryButton
          disabled={displayManageLuis || displayManageQNA}
          styles={{ root: { width: '130px', marginTop: '15px' } }}
          text={formatMessage('Get QnA key')}
          onClick={() => {
            setDisplayManageQNA(true);
          }}
        />
        <ManageLuis
          hidden={!displayManageLuis}
          setDisplayManageLuis={setDisplayManageLuis}
          onDismiss={() => {
            setDisplayManageLuis(false);
          }}
          onGetKey={updateLuisSettings}
          onNext={() => {
            setDisplayManageLuis(false);
          }}
        />
        <ManageQNA
          hidden={!displayManageQNA}
          setDisplayManageQna={setDisplayManageQNA}
          onDismiss={() => {
            setDisplayManageQNA(false);
          }}
          onGetKey={updateQNASettings}
          onNext={() => {
            setDisplayManageQNA(false);
          }}
        />
      </div>
    </Fragment>
  );
};
