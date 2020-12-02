// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import React, { useState, useEffect } from 'react';
import { jsx } from '@emotion/core';
import { mergeStyleSets } from '@uifabric/styling';
import { useRecoilValue } from 'recoil';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { TooltipHost } from 'office-ui-fabric-react/lib/Tooltip';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import formatMessage from 'format-message';
import get from 'lodash/get';
import { css } from '@emotion/core';
import { FontSizes, FontWeights } from 'office-ui-fabric-react/lib/Styling';
import { NeutralColors, SharedColors } from '@uifabric/fluent-theme';

import {
  dispatcherState,
  settingsState,
  luFilesState,
  qnaFilesState,
  validateDialogsSelectorFamily,
  botDisplayNameState,
} from '../../recoilModel';
import settingStorage from '../../utils/dialogSettingStorage';
import { rootBotProjectIdSelector } from '../../recoilModel/selectors/project';
import { CollapsableWrapper } from '../../components/CollapsableWrapper';
import { isLUISMandatory, isQnAKeyMandatory } from '../../utils/dialogValidator';
import { mergePropertiesManagedByRootBot } from '../../recoilModel/dispatchers/utils/project';

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

const customError = {
  root: {
    selectors: {
      'p > span': {
        width: '100%',
      },
    },
  },
};

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
    <div css={errorContainer}>
      <Icon iconName="ErrorBadge" styles={errorIcon} />
      <div css={errorTextStyle}>{errorText}</div>
    </div>
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

  const dialogs = useRecoilValue(validateDialogsSelectorFamily(projectId));
  const luFiles = useRecoilValue(luFilesState(projectId));
  const qnaFiles = useRecoilValue(qnaFilesState(projectId));
  const botName = useRecoilValue(botDisplayNameState(projectId));
  const isLUISKeyNeeded = isLUISMandatory(dialogs, luFiles);
  const isQnAKeyNeeded = isQnAKeyMandatory(dialogs, qnaFiles);

  const rootLuisName = get(settings, 'luis.name', '') || botName;

  const [luisKeyErrorMsg, setLuisKeyErrorMsg] = useState<string>('');
  const [luisRegionErrorMsg, setLuisRegionErrorMsg] = useState<string>('');
  const [qnaKeyErrorMsg, setQnAKeyErrorMsg] = useState<string>('');

  const [localRootLuisKey, setLocalRootLuisKey] = useState<string>(rootLuisKey ?? '');
  const [localRootQnAKey, setLocalRootQnAKey] = useState<string>(rootqnaKey ?? '');
  const [localRootLuisRegion, setLocalRootLuisRegion] = useState<string>(rootLuisRegion ?? '');
  const [localRootLuisName, setLocalRootLuisName] = useState<string>(rootLuisName ?? '');

  const luisKeyFieldRef = React.useRef<HTMLInputElement>(null);
  const qnaKeyFieldRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!localRootLuisKey) {
      setLuisKeyErrorMsg(
        formatMessage('LUIS Key is required with the current recognizer setting to start your bot locally, and publish')
      );
    } else {
      setLuisKeyErrorMsg('');
    }
    if (!localRootQnAKey) {
      setQnAKeyErrorMsg(formatMessage('QnA Maker subscription Key is required to start your bot locally, and publish'));
    } else {
      setQnAKeyErrorMsg('');
    }

    if (isLUISKeyNeeded && !localRootLuisRegion) {
      setLuisRegionErrorMsg(formatMessage('LUIS Region is required'));
    } else {
      setLuisRegionErrorMsg('');
    }
  }, [projectId]);

  useEffect(() => {
    setLocalRootLuisKey(rootLuisKey);
  }, [rootLuisKey]);

  useEffect(() => {
    if (luisKeyFieldRef.current && scrollToSectionId === '#luisKey') {
      luisKeyFieldRef.current.scrollIntoView({ behavior: 'smooth' });
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

  const handleRootLUISKeyOnChange = (e, value) => {
    if (value) {
      setLuisKeyErrorMsg('');
      setLocalRootLuisKey(value);
    } else {
      setLuisKeyErrorMsg(
        formatMessage('LUIS Key is required with the current recognizer setting to start your bot locally, and publish')
      );
      setLocalRootLuisKey('');
    }
  };

  const handleRootQnAKeyOnChange = (e, value) => {
    if (value) {
      setQnAKeyErrorMsg('');
      setLocalRootQnAKey(value);
    } else {
      setQnAKeyErrorMsg(formatMessage('QnA Maker subscription Key is required to start your bot locally, and publish'));
      setLocalRootQnAKey('');
    }
  };

  const handleRootLuisRegionOnChange = (e, value) => {
    if (value) {
      setLuisRegionErrorMsg('');
      setLocalRootLuisRegion(value);
    } else {
      setLuisRegionErrorMsg(formatMessage('LUIS Region is required'));
      setLocalRootLuisRegion('');
    }
  };

  const handleRootLuisRegionOnBlur = () => {
    if (isLUISKeyNeeded && !localRootLuisRegion) {
      setLuisRegionErrorMsg(formatMessage('LUIS Region is required'));
    }
    setSettings(projectId, {
      ...mergedSettings,
      luis: { ...mergedSettings.luis, authoringRegion: localRootLuisRegion },
    });
  };

  const handleRootLuisKeyOnBlur = () => {
    if (!localRootLuisKey) {
      setLuisKeyErrorMsg(
        formatMessage('LUIS Key is required with the current recognizer setting to start your bot locally, and publish')
      );
    }
    setSettings(projectId, {
      ...mergedSettings,
      luis: { ...mergedSettings.luis, authoringKey: localRootLuisKey },
    });
  };

  const handleRootQnAKeyOnBlur = () => {
    if (!localRootQnAKey) {
      setQnAKeyErrorMsg(formatMessage('QnA Maker subscription Key is required to start your bot locally, and publish'));
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

  return (
    <CollapsableWrapper title={formatMessage('External services')} titleStyle={titleStyle}>
      <div css={externalServiceContainerStyle}>
        <TextField
          aria-labelledby={'LUIS name'}
          data-testId={'rootLUISName'}
          id={'luisName'}
          label={formatMessage('LUIS name')}
          placeholder={'Enter LUIS name'}
          value={localRootLuisName}
          onBlur={handleRootLUISNameOnBlur}
          onChange={handleRootLUISNameOnChange}
          onRenderLabel={onRenderLabel}
        />
        <TextField
          aria-labelledby={'LUIS key'}
          data-testId={'rootLUISKey'}
          errorMessage={isLUISKeyNeeded ? errorElement(luisKeyErrorMsg) : ''}
          id={'luisKey'}
          label={formatMessage('LUIS key')}
          placeholder={'Enter LUIS key'}
          required={isLUISKeyNeeded}
          styles={mergeStyleSets({ root: { marginTop: 10 } }, customError)}
          value={localRootLuisKey}
          onBlur={handleRootLuisKeyOnBlur}
          onChange={handleRootLUISKeyOnChange}
          onRenderLabel={onRenderLabel}
        />
        <TextField
          aria-labelledby={'LUIS region'}
          data-testid={'rootLUISRegion'}
          errorMessage={errorElement(luisRegionErrorMsg)}
          label={formatMessage('LUIS region')}
          placeholder={'Enter LUIS region'}
          styles={mergeStyleSets({ root: { marginTop: 10 } }, customError)}
          value={localRootLuisRegion}
          onBlur={handleRootLuisRegionOnBlur}
          onChange={handleRootLuisRegionOnChange}
          onRenderLabel={onRenderLabel}
        />
        <TextField
          aria-labelledby={'QnA Maker Subscription key'}
          data-testId={'QnASubscriptionKey'}
          errorMessage={isQnAKeyNeeded ? errorElement(qnaKeyErrorMsg) : ''}
          id={'qnaKey'}
          label={formatMessage('QnA Maker Subscription key')}
          placeholder={'Enter QnA Maker Subscription key'}
          required={isQnAKeyNeeded}
          styles={mergeStyleSets({ root: { marginTop: 10 } }, customError)}
          value={localRootQnAKey}
          onBlur={handleRootQnAKeyOnBlur}
          onChange={handleRootQnAKeyOnChange}
          onRenderLabel={onRenderLabel}
        />
      </div>
    </CollapsableWrapper>
  );
};
