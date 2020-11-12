// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import React, { useState, useEffect } from 'react';
import { jsx } from '@emotion/core';
import { QnAFile, DialogInfo, LuFile } from '@bfc/shared';
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
} from '../../recoilModel';
import settingStorage from '../../utils/dialogSettingStorage';
import { rootBotProjectIdSelector } from '../../recoilModel/selectors/project';
import { CollapsableWrapper } from '../../components/CollapsableWrapper';
import { TextFieldWithCustomButton } from '../../components/TextFieldWithCustomButton';
import { isLUISnQnARecognizerType } from '../../utils/dialogValidator';
import { getBaseName } from '../../utils/fileUtil';
import { botProjectSpaceSelector } from '../../recoilModel/selectors/project';

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

type ExternalServiceProps = {
  projectId: string;
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

const isLUISMandatory = (dialogs: DialogInfo[], luFiles: LuFile[]) => {
  return dialogs.some((dialog) => {
    const isDefault = isLUISnQnARecognizerType(dialog);
    const luFile = luFiles.find((luFile) => getBaseName(luFile.id) === dialog.id);
    return !!(isDefault && luFile?.content);
  });
};

const isQnAKeyMandatory = (dialogs: DialogInfo[], qnaFiles: QnAFile[]) => {
  return dialogs.some((dialog) => {
    const isDefault = isLUISnQnARecognizerType(dialog);
    const qnaFile = qnaFiles.find((qnaFile) => getBaseName(qnaFile.id) === dialog.id);
    return !!(isDefault && qnaFile?.content);
  });
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

export const ExternalService: React.FC<ExternalServiceProps> = (props) => {
  const { projectId } = props;
  const { setSettings, setQnASettings } = useRecoilValue(dispatcherState);
  const settings = useRecoilValue(settingsState(projectId));
  const dialogs = useRecoilValue(validateDialogsSelectorFamily(projectId));
  const luFiles = useRecoilValue(luFilesState(projectId));
  const qnaFiles = useRecoilValue(qnaFilesState(projectId));
  const rootBotProjectId = useRecoilValue(rootBotProjectIdSelector) || '';
  const botProjectsMetaData = useRecoilValue(botProjectSpaceSelector);
  const botProject = botProjectsMetaData.find((b) => b.projectId === projectId);
  const isRootBot = !!botProject?.isRootBot;
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
  const isLUISKeyNeeded = isLUISMandatory(dialogs, luFiles);
  const isQnAKeyNeeded = isQnAKeyMandatory(dialogs, qnaFiles);

  const [luisKeyErrorMsg, setLuisKeyErrorMsg] = useState<string>('');
  const [qnaKeyErrorMsg, setQnAKeyErrorMsg] = useState<string>('');

  const [localRootLuisKey, setLocalRootLuisKey] = useState<string>(rootLuisKey ?? '');
  const [localRootQnAKey, setLocalRootQnAKey] = useState<string>(rootqnaKey ?? '');

  useEffect(() => {
    setLuisKeyErrorMsg('');
    setQnAKeyErrorMsg('');
  }, [projectId]);

  const handleRootLUISKeyOnChange = (e, value) => {
    setSettings(projectId, {
      ...settings,
      luis: { ...settings.luis, authoringKey: value ? value : '' },
    });
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

  const handleRootLuisKeyOnBlur = () => {
    if (!localRootLuisKey) {
      setLuisKeyErrorMsg(
        formatMessage('LUIS Key is required with the current recognizer setting to start your bot locally, and publish')
      );
    }
  };

  const handleRootQnAKeyOnBlur = () => {
    if (!localRootQnAKey) {
      setQnAKeyErrorMsg(formatMessage('QnA Maker subscription Key is required to start your bot locally, and publish'));
    }
    submitQnASubscripionKey(localRootQnAKey);
  };

  const handleSkillQnAKeyOnBlur = (value) => {
    if (value) {
      submitQnASubscripionKey(value);
    } else {
      setSettings(projectId, {
        ...settings,
        qna: { ...settings.qna, subscriptionKey: '' },
      });
      setQnASettings(projectId, rootqnaKey);
    }
  };

  const submitQnASubscripionKey = (value) => {
    setSettings(projectId, {
      ...settings,
      qna: { ...settings.qna, subscriptionKey: value ? value : '' },
    });
    setQnASettings(projectId, value);
  };

  return (
    <CollapsableWrapper title={formatMessage('External services')} titleStyle={titleStyle}>
      <div css={externalServiceContainerStyle}>
        {isRootBot ? (
          <TextField
            aria-labelledby={'LUIS key'}
            data-testId={'rootLUISKey'}
            errorMessage={isLUISKeyNeeded ? errorElement(luisKeyErrorMsg) : ''}
            label={formatMessage('LUIS key')}
            placeholder={'Enter LUIS key'}
            required={isLUISKeyNeeded}
            styles={customError}
            value={localRootLuisKey}
            onBlur={handleRootLuisKeyOnBlur}
            onChange={handleRootLUISKeyOnChange}
            onRenderLabel={onRenderLabel}
          />
        ) : (
          <TextFieldWithCustomButton
            required
            ariaLabelledby={'LUIS key'}
            buttonText={formatMessage('Use custom LUIS key')}
            label={formatMessage('LUIS key')}
            placeholder={'Enter LUIS key'}
            placeholderOnDisable={"<---- Same as root bot's LUIS key ---->"}
            value={skillLuisKey}
            onChange={async (e, value) => {
              await setSettings(projectId, {
                ...settings,
                luis: { ...settings.luis, authoringKey: value ? value : '' },
              });
            }}
          />
        )}

        {isRootBot ? (
          <TextField
            aria-labelledby={'LUIS region'}
            label={formatMessage('LUIS region')}
            data-testid={'rootLUISRegion'}
            placeholder={'Enter LUIS region'}
            styles={{ root: { marginTop: 10 } }}
            value={rootLuisRegion}
            onChange={async (e, value) => {
              await setSettings(projectId, {
                ...settings,
                luis: { ...settings.luis, authoringRegion: value ? value : '' },
              });
            }}
            onRenderLabel={onRenderLabel}
          />
        ) : (
          <TextFieldWithCustomButton
            required
            ariaLabelledby={'LUIS region'}
            buttonText={formatMessage('Use custom LUIS region')}
            label={formatMessage('LUIS region')}
            placeholder={'Enter LUIS region'}
            placeholderOnDisable={"<---- Same as root bot's LUIS region ---->"}
            value={skillLuisRegion}
            onChange={async (e, value) => {
              await setSettings(projectId, {
                ...settings,
                luis: { ...settings.luis, authoringRegion: value ? value : '' },
              });
            }}
          />
        )}
        {isRootBot ? (
          <TextField
            aria-labelledby={'QnA Maker Subscription key'}
            data-testId={'QnASubscriptionKey'}
            errorMessage={isQnAKeyNeeded ? errorElement(qnaKeyErrorMsg) : ''}
            label={formatMessage('QnA Maker Subscription key')}
            placeholder={'Enter QnA Maker Subscription key'}
            required={isQnAKeyNeeded}
            styles={mergeStyleSets({ root: { marginTop: 10 } }, customError)}
            value={localRootQnAKey}
            onBlur={handleRootQnAKeyOnBlur}
            onChange={handleRootQnAKeyOnChange}
            onRenderLabel={onRenderLabel}
          />
        ) : (
          <TextFieldWithCustomButton
            required
            ariaLabelledby={'QnA Maker Subscription key'}
            buttonText={formatMessage('Use custom QnA Maker Subscription key')}
            label={formatMessage('QnA Maker Subscription key')}
            placeholder={'Enter QnA Maker Subscription key'}
            placeholderOnDisable={"<---- Same as root bot's QnA Maker Subscription key ---->"}
            value={skillqnaKey}
            onBlur={handleSkillQnAKeyOnBlur}
          />
        )}
      </div>
    </CollapsableWrapper>
  );
};
