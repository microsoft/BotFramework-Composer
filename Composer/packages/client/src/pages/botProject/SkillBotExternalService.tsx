// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import React, { useEffect, useState, useRef } from 'react';
import { jsx } from '@emotion/core';
import { BotIndexer } from '@bfc/indexers';
import { useRecoilValue } from 'recoil';
import formatMessage from 'format-message';
import get from 'lodash/get';
import { css } from '@emotion/core';
import { FontSizes, FontWeights } from 'office-ui-fabric-react/lib/Styling';
import { SharedColors } from '@uifabric/fluent-theme';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { TooltipHost } from 'office-ui-fabric-react/lib/Tooltip';
import { Icon } from 'office-ui-fabric-react/lib/Icon';

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
import { TextFieldWithCustomButton } from '../../components/TextFieldWithCustomButton';
import { mergePropertiesManagedByRootBot } from '../../recoilModel/dispatchers/utils/project';
// -------------------- Styles -------------------- //

const titleStyle = css`
  font-size: ${FontSizes.medium};
  font-weight: ${FontWeights.semibold};
  margin-left: 22px;
  margin-top: 6px;
`;

const externalServiceContainerStyle = css`
  display: flex;
  flex-direction: column;
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

// -------------------- ExternalService -------------------- //

type SkillBotExternalServiceProps = {
  projectId: string;
  scrollToSectionId?: string;
};

export const SkillBotExternalService: React.FC<SkillBotExternalServiceProps> = (props) => {
  const { projectId, scrollToSectionId = '' } = props;
  const { setSettings, setQnASettings } = useRecoilValue(dispatcherState);
  const rootBotProjectId = useRecoilValue(rootBotProjectIdSelector) || '';
  const settings = useRecoilValue(settingsState(projectId));
  const mergedSettings = mergePropertiesManagedByRootBot(projectId, rootBotProjectId, settings);
  const botName = useRecoilValue(botDisplayNameState(projectId));
  const skillLuisName = get(settings, 'luis.name', '') || botName;
  const [localSkillLuisName, setLocalSkillLuisName] = useState<string>(skillLuisName ?? '');

  const sensitiveGroupManageProperty = settingStorage.get(rootBotProjectId);
  const groupLUISAuthoringKey = get(sensitiveGroupManageProperty, 'luis.authoringKey', {});
  const rootLuisKey = groupLUISAuthoringKey.root;
  const skillLuisKey = groupLUISAuthoringKey[projectId];
  const groupLUISRegion = get(sensitiveGroupManageProperty, 'luis.authoringRegion', {});
  const rootLuisRegion = groupLUISRegion.root;
  const skillLuisRegion = groupLUISRegion[projectId];
  const groupQnAKey = get(sensitiveGroupManageProperty, 'qna.subscriptionKey', {});
  const rootqnaKey = groupQnAKey.root;
  const skillqnaKey = groupQnAKey[projectId];

  const dialogs = useRecoilValue(validateDialogsSelectorFamily(projectId));
  const luFiles = useRecoilValue(luFilesState(projectId));
  const qnaFiles = useRecoilValue(qnaFilesState(projectId));

  const isLUISKeyNeeded = BotIndexer.shouldUseLuis(dialogs, luFiles);
  const isQnAKeyNeeded = BotIndexer.shouldUseQnA(dialogs, qnaFiles);

  const luisKeyFieldRef = useRef<HTMLDivElement>(null);
  const luisRegionFieldRef = useRef<HTMLDivElement>(null);
  const qnaKeyFieldRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    setLocalSkillLuisName(skillLuisName);
  }, [projectId]);

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

  const handleSkillLUISNameOnChange = (e, value) => {
    setLocalSkillLuisName(value);
  };

  const handleSkillLUISNameOnBlur = () => {
    setSettings(projectId, {
      ...mergedSettings,
      luis: { ...mergedSettings.luis, name: localSkillLuisName },
    });
  };

  const handleSkillQnAKeyOnBlur = (key: string) => {
    if (key) {
      submitQnASubscripionKey(key);
    } else {
      submitQnASubscripionKey(rootqnaKey);
    }
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

  const handleLUISRegionOnBlur = (value) => {
    setSettings(projectId, {
      ...mergedSettings,
      luis: { ...mergedSettings.luis, authoringRegion: value ? value : '' },
    });
  };

  const handleLUISKeyOnBlur = (value) => {
    setSettings(projectId, {
      ...mergedSettings,
      luis: { ...mergedSettings.luis, authoringKey: value ? value : '' },
    });
  };

  return (
    <CollapsableWrapper title={formatMessage('External services')} titleStyle={titleStyle}>
      <div css={externalServiceContainerStyle}>
        <TextField
          aria-labelledby={'LUIS name'}
          data-testid={'skillLUISName'}
          id={'luisName'}
          label={formatMessage('LUIS name')}
          placeholder={'Enter LUIS name'}
          styles={{ root: { marginBottom: 10 } }}
          value={localSkillLuisName}
          onBlur={handleSkillLUISNameOnBlur}
          onChange={handleSkillLUISNameOnChange}
          onRenderLabel={onRenderLabel}
        />
        <div ref={luisKeyFieldRef}>
          <TextFieldWithCustomButton
            ariaLabelledby={'LUIS key'}
            buttonText={formatMessage('Use custom LUIS key')}
            errorMessage={!rootLuisKey ? formatMessage('Root Bot LUIS key is empty') : ''}
            id={'luisKey'}
            label={formatMessage('LUIS key')}
            placeholder={'Enter LUIS key'}
            placeholderOnDisable={"<---- Same as root bot's LUIS key ---->"}
            required={isLUISKeyNeeded}
            value={skillLuisKey}
            onBlur={handleLUISKeyOnBlur}
            onRenderLabel={onRenderLabel}
          />
        </div>
        <div ref={luisRegionFieldRef}>
          <TextFieldWithCustomButton
            ariaLabelledby={'LUIS region'}
            buttonText={formatMessage('Use custom LUIS region')}
            errorMessage={!rootLuisRegion ? formatMessage('Root Bot LUIS region is empty') : ''}
            label={formatMessage('LUIS region')}
            placeholder={'Enter LUIS region'}
            placeholderOnDisable={"<---- Same as root bot's LUIS region ---->"}
            required={isLUISKeyNeeded}
            value={skillLuisRegion}
            onBlur={handleLUISRegionOnBlur}
            onRenderLabel={onRenderLabel}
          />
        </div>
        <div ref={qnaKeyFieldRef}>
          <TextFieldWithCustomButton
            ariaLabelledby={'QnA Maker Subscription key'}
            buttonText={formatMessage('Use custom QnA Maker Subscription key')}
            errorMessage={!rootqnaKey ? formatMessage('Root Bot QnA Maker Subscription key is empty') : ''}
            id={'qnaKey'}
            label={formatMessage('QnA Maker Subscription key')}
            placeholder={'Enter QnA Maker Subscription key'}
            placeholderOnDisable={"<---- Same as root bot's QnA Maker Subscription key ---->"}
            required={isQnAKeyNeeded}
            value={skillqnaKey}
            onBlur={handleSkillQnAKeyOnBlur}
            onRenderLabel={onRenderLabel}
          />
        </div>
      </div>
    </CollapsableWrapper>
  );
};
