// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import React, { useEffect, useState, useRef, Fragment } from 'react';
import { jsx } from '@emotion/core';
import { BotIndexer } from '@bfc/indexers';
import { useRecoilValue } from 'recoil';
import formatMessage from 'format-message';
import get from 'lodash/get';
import { css } from '@emotion/core';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { Link } from 'office-ui-fabric-react/lib/Link';

import {
  dispatcherState,
  settingsState,
  luFilesSelectorFamily,
  qnaFilesSelectorFamily,
  dialogsSelectorFamily,
  botDisplayNameState,
} from '../../recoilModel';
import settingStorage from '../../utils/dialogSettingStorage';
import { rootBotProjectIdSelector } from '../../recoilModel/selectors/project';
import { FieldWithCustomButton } from '../../components/FieldWithCustomButton';
import { mergePropertiesManagedByRootBot } from '../../recoilModel/dispatchers/utils/project';
import { LUIS_REGIONS } from '../../constants';

import { subtext, title } from './styles';
// -------------------- Styles -------------------- //

const externalServiceContainerStyle = css`
  display: flex;
  flex-direction: column;
`;

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
  const rootQnAKey = groupQnAKey.root;
  const skillQnAKey = groupQnAKey[projectId];

  const dialogs = useRecoilValue(dialogsSelectorFamily(projectId));
  const luFiles = useRecoilValue(luFilesSelectorFamily(projectId));
  const qnaFiles = useRecoilValue(qnaFilesSelectorFamily(projectId));

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
      submitQnASubscripionKey(rootQnAKey);
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
      luis: { ...mergedSettings.luis, authoringRegion: value ?? '' },
    });
  };

  const handleLUISKeyOnBlur = (value) => {
    setSettings(projectId, {
      ...mergedSettings,
      luis: { ...mergedSettings.luis, authoringKey: value ?? '' },
    });
  };

  return (
    <Fragment>
      <div css={title}>{formatMessage('Language Understanding')}</div>
      <div css={subtext}>
        {formatMessage.rich(
          '<a>Language Understanding Intelligent Service (LUIS)</a> is a machine learning-driven recognition service that enables advanced conversational capabilities. If you already have LUIS keys you’d like to use, you can paste them below. To fetch existing keys from Azure or create new keys, you can click “Get LUIS keys”. <a2>Learn more</a2>.',
          {
            a: ({ children }) => (
              <Link key="luis-skill-settings-page" href={'https://www.luis.ai/'} target="_blank">
                {children}
              </Link>
            ),
            a2: ({ children }) => (
              <Link key="luis-skill-settings-page" href={'https://aka.ms/composer-luis-learnmore'} target="_blank">
                {children}
              </Link>
            ),
          }
        )}
      </div>
      <div css={externalServiceContainerStyle}>
        <TextField
          ariaLabel={formatMessage('LUIS application name')}
          data-testid={'skillLUISApplicationName'}
          id={'luisName'}
          label={formatMessage('LUIS application name')}
          placeholder={formatMessage('Enter LUIS application name')}
          styles={{ root: { marginBottom: 10 } }}
          value={localSkillLuisName}
          onBlur={handleSkillLUISNameOnBlur}
          onChange={handleSkillLUISNameOnChange}
        />
        <div ref={luisKeyFieldRef}>
          <FieldWithCustomButton
            ariaLabel={formatMessage('LUIS authoring key')}
            buttonText={formatMessage('Use custom LUIS authoring key')}
            errorMessage={!rootLuisKey ? formatMessage('Root Bot LUIS authoring key is empty') : ''}
            id={'luisAuthoringKey'}
            label={formatMessage('LUIS authoring key')}
            placeholder={formatMessage('Enter LUIS authoring key')}
            placeholderOnDisable={rootLuisKey}
            required={isLUISKeyNeeded}
            value={skillLuisKey}
            onBlur={handleLUISKeyOnBlur}
          />
        </div>
        <div ref={luisRegionFieldRef}>
          <FieldWithCustomButton
            ariaLabel={formatMessage('LUIS region')}
            buttonText={formatMessage('Use custom LUIS region')}
            errorMessage={!rootLuisRegion ? formatMessage('Root Bot LUIS region is empty') : ''}
            label={formatMessage('LUIS region')}
            options={LUIS_REGIONS}
            placeholder={formatMessage('Enter LUIS region')}
            placeholderOnDisable={rootLuisRegion}
            required={isLUISKeyNeeded}
            value={skillLuisRegion}
            onBlur={handleLUISRegionOnBlur}
          />
        </div>
        <div css={title}>{formatMessage('QnA Maker')}</div>
        <div css={subtext}>
          {formatMessage.rich(
            'Integrate with <a>QnA Maker</a> to provide bot content from easy-to-manage knowledge bases. If you already have a QnA key you’d like to use, you can paste it below. To fetch an existing key from Azure or create a new key, you can click “Get QnA key”. <a2>Learn more.</a2>',
            {
              a: ({ children }) => (
                <Link key="qna-skill-settings-page" href={'https://www.qnamaker.ai/'} target="_blank">
                  {children}
                </Link>
              ),
              a2: ({ children }) => (
                <Link
                  key="qna-skill-settings-page"
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
          <FieldWithCustomButton
            ariaLabel={formatMessage('QnA Maker Subscription key')}
            buttonText={formatMessage('Use custom QnA Maker Subscription key')}
            errorMessage={!rootQnAKey ? formatMessage('Root Bot QnA Maker Subscription key is empty') : ''}
            id={'qnaKey'}
            label={formatMessage('QnA Maker Subscription key')}
            placeholder={formatMessage('Enter QnA Maker Subscription key')}
            placeholderOnDisable={rootQnAKey}
            required={isQnAKeyNeeded}
            value={skillQnAKey}
            onBlur={handleSkillQnAKeyOnBlur}
          />
        </div>
      </div>
    </Fragment>
  );
};
