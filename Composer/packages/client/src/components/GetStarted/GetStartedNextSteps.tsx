// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { Fragment, useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';
import formatMessage from 'format-message';
import { Link } from 'office-ui-fabric-react/lib/Link';

import TelemetryClient from '../../telemetry/TelemetryClient';
import { localBotsDataSelector } from '../../recoilModel/selectors/project';
import { currentProjectIdState } from '../../recoilModel';
import { ManageLuis } from '../ManageLuis/ManageLuis';
import { ManageQNA } from '../ManageQNA/ManageQNA';
import { dispatcherState, settingsState } from '../../recoilModel';
import { mergePropertiesManagedByRootBot } from '../../recoilModel/dispatchers/utils/project';
import { rootBotProjectIdSelector } from '../../recoilModel/selectors/project';
import { navigateTo } from '../../utils/navigation';

import { GetStartedTask } from './GetStartedTask';
import { h3Style, ulStyle, liStyle } from './styles';

type GetStartedProps = {
  requiresLUIS: boolean;
  requiresQNA: boolean;
};

export type NextSteps = {
  checked: boolean;
  key: string;
  description: string;
  learnMore: string;
  required?: boolean;
  label: string;
  onClick: (step?: NextSteps) => void;
};

export const GetStartedNextSteps: React.FC<GetStartedProps> = (props) => {
  const projectId = useRecoilValue(currentProjectIdState);
  const botProjects = useRecoilValue(localBotsDataSelector);
  const botProject = botProjects.find((b) => b.projectId === projectId);
  const [displayManageLuis, setDisplayManageLuis] = useState<boolean>(false);
  const [displayManageQNA, setDisplayManageQNA] = useState<boolean>(false);

  const { setSettings } = useRecoilValue(dispatcherState);
  const rootBotProjectId = useRecoilValue(rootBotProjectIdSelector) || '';
  const settings = useRecoilValue(settingsState(projectId));
  const mergedSettings = mergePropertiesManagedByRootBot(projectId, rootBotProjectId, settings);
  const [requiredNextSteps, setNextSteps] = useState<NextSteps[]>([]);
  const [optionalSteps, setOptionalSteps] = useState<NextSteps[]>([]);

  const hideManageLuis = () => {
    setDisplayManageLuis(false);
  };
  const hideManageQNA = () => {
    setDisplayManageQNA(false);
  };

  const openLink = (link) => {
    TelemetryClient.track('GettingStartedLinkClicked', { method: 'link', url: link });
    navigateTo(link);
  };

  const doNextStep = (currentStep) => {
    const nextAction = requiredNextSteps.filter((f) => !f.checked && f.key != currentStep)?.[0];
    if (nextAction) {
      nextAction.onClick();
    }
  };

  const updateLuisSettings = (newLuisSettings) => {
    setSettings(projectId, {
      ...mergedSettings,
      luis: { ...mergedSettings.luis, ...newLuisSettings },
    });

    // once update, launch the next step if any
    doNextStep('luis');
  };

  const updateQNASettings = (newQNASettings) => {
    setSettings(projectId, {
      ...mergedSettings,
      qna: { ...mergedSettings.qna, ...newQNASettings },
    });

    // once update, launch the next step if any
    doNextStep('qna');
  };

  const linkToPackageManager = `/bot/${projectId}/plugin/package-manager/package-manager`;
  const linkToConnections = `/bot/${projectId}/botProjectsSettings/#connections`;
  const linkToLUISSettings = `/bot/${projectId}/botProjectsSettings/#luisKey`;
  const linktoQNASettings = `/bot/${projectId}/botProjectsSettings/#qnaKey`;
  const linkToLGEditor = `/bot/${projectId}/language-generation`;
  const linkToLUEditor = `/bot/${projectId}/language-understanding`;

  useEffect(() => {
    const newNextSteps: NextSteps[] = [];

    let hasLUIS = false;
    let hasQNA = false;
    if (botProject?.setting?.luis?.authoringKey && botProject?.setting?.luis?.authoringRegion) {
      hasLUIS = true;
    }
    if (botProject?.setting?.qna?.subscriptionKey) {
      hasQNA = true;
    }

    if (props.requiresLUIS) {
      newNextSteps.push({
        key: 'luis',
        label: formatMessage('Add a LUIS key'),
        description: formatMessage('Setup Language Understanding so that you can start and test your bot.'),
        learnMore: '',
        required: true,
        checked: hasLUIS,
        onClick: (step) => {
          if (!step?.checked) {
            setDisplayManageLuis(true);
          } else {
            openLink(linkToLUISSettings);
          }
        },
      });
    }
    if (props.requiresQNA) {
      newNextSteps.push({
        key: 'qna',
        label: formatMessage('Add a QnA Maker key'),
        description: formatMessage('Your template requires QnA Maker to access content for your bot.'),
        learnMore: '',
        required: true,
        checked: hasQNA,
        onClick: (step) => {
          if (!step?.checked) {
            setDisplayManageQNA(true);
          } else {
            openLink(linktoQNASettings);
          }
        },
      });
    }
    setNextSteps(newNextSteps);

    setOptionalSteps([
      {
        key: 'packages',
        label: formatMessage('Add packages'),
        description: formatMessage('Visit the Package manager to browse packages to add to your bot.'),
        learnMore: '',
        checked: true,
        onClick: () => {
          openLink(linkToPackageManager);
        },
      },
      {
        key: 'editlg',
        label: formatMessage('Edit what your bot says'),
        description: formatMessage('Customize your bot by editing and adding bot responses.'),
        learnMore: '',
        checked: true,
        onClick: () => {
          openLink(linkToLGEditor);
        },
      },
      {
        key: 'editlu',
        label: formatMessage('Train your language model'),
        description: formatMessage('Ensure your bot can understand your users by frequently training your LUIS model.'),
        learnMore: '',
        checked: true,
        onClick: () => {
          openLink(linkToLUEditor);
        },
      },
      {
        key: 'connections',
        label: formatMessage('Add connections'),
        description: formatMessage('Connect your bot to Teams, external channels, or enable speech. Learn more'),
        learnMore: '',
        checked: true,
        onClick: () => {
          openLink(linkToConnections);
        },
      },
    ]);
  }, [botProject]);

  return (
    <div css={{ paddingLeft: 27, paddingRight: 20 }}>
      <ManageLuis hidden={!displayManageLuis} onDismiss={hideManageLuis} onGetKey={updateLuisSettings} />
      <ManageQNA hidden={!displayManageQNA} onDismiss={hideManageQNA} onGetKey={updateQNASettings} />

      <p>{formatMessage('These are next steps so you always know what to do next to get your bot going.')}</p>
      {requiredNextSteps && (
        <div>
          <h3 style={h3Style}>{formatMessage('Required')}</h3>
          {requiredNextSteps.map((step) => (
            <GetStartedTask key={step.key} step={step} />
          ))}
        </div>
      )}

      {optionalSteps && (
        <div>
          <h3 style={h3Style}>{formatMessage('Optional')}</h3>
          {optionalSteps.map((step) => (
            <GetStartedTask key={step.key} step={step} />
          ))}
        </div>
      )}
    </div>
  );
};
