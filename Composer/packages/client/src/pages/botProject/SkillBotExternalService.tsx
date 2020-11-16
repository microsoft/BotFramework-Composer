// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import React from 'react';
import { jsx } from '@emotion/core';
import { useRecoilValue } from 'recoil';
import formatMessage from 'format-message';
import get from 'lodash/get';
import { css } from '@emotion/core';
import { FontSizes, FontWeights } from 'office-ui-fabric-react/lib/Styling';

import { isLUISMandatory, isQnAKeyMandatory } from '../../utils/dialogValidator';
import {
  dispatcherState,
  settingsState,
  luFilesState,
  qnaFilesState,
  validateDialogsSelectorFamily,
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

// -------------------- ExternalService -------------------- //

type SkillBotExternalServiceProps = {
  projectId: string;
};

export const SkillBotExternalService: React.FC<SkillBotExternalServiceProps> = (props) => {
  const { projectId } = props;
  const { setSettings, setQnASettings } = useRecoilValue(dispatcherState);
  const rootBotProjectId = useRecoilValue(rootBotProjectIdSelector) || '';
  const settings = useRecoilValue(settingsState(projectId));
  const mergedSettings = mergePropertiesManagedByRootBot(projectId, rootBotProjectId, settings);
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
  const isLUISKeyNeeded = isLUISMandatory(dialogs, luFiles);
  const isQnAKeyNeeded = isQnAKeyMandatory(dialogs, qnaFiles);

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
        <TextFieldWithCustomButton
          ariaLabelledby={'LUIS key'}
          buttonText={formatMessage('Use custom LUIS key')}
          errorMessage={!rootLuisKey ? formatMessage('Root Bot LUIS key is empty') : ''}
          label={formatMessage('LUIS key')}
          placeholder={'Enter LUIS key'}
          placeholderOnDisable={"<---- Same as root bot's LUIS key ---->"}
          required={isLUISKeyNeeded}
          value={skillLuisKey}
          onBlur={handleLUISKeyOnBlur}
        />
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
        />
        <TextFieldWithCustomButton
          ariaLabelledby={'QnA Maker Subscription key'}
          buttonText={formatMessage('Use custom QnA Maker Subscription key')}
          errorMessage={!rootqnaKey ? formatMessage('Root Bot QnA Maker Subscription key is empty') : ''}
          label={formatMessage('QnA Maker Subscription key')}
          placeholder={'Enter QnA Maker Subscription key'}
          placeholderOnDisable={"<---- Same as root bot's QnA Maker Subscription key ---->"}
          required={isQnAKeyNeeded}
          value={skillqnaKey}
          onBlur={handleSkillQnAKeyOnBlur}
        />
      </div>
    </CollapsableWrapper>
  );
};
