// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useEffect, useState, useMemo } from 'react';
import { useRecoilValue } from 'recoil';
import formatMessage from 'format-message';
import { TeachingBubble } from 'office-ui-fabric-react/lib/TeachingBubble';
import { ScrollablePane } from 'office-ui-fabric-react/lib/ScrollablePane';

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
import { NextSteps } from './types';
import { h3Style } from './styles';

type GetStartedProps = {
  requiresLUIS: boolean;
  requiresQNA: boolean;
  showTeachingBubble: boolean;
  onBotReady: () => void;
  onDismiss: () => void;
};

export const GetStartedNextSteps: React.FC<GetStartedProps> = (props) => {
  const projectId = useRecoilValue(currentProjectIdState);
  const botProjects = useRecoilValue(localBotsDataSelector);
  const botProject = useMemo(() => botProjects.find((b) => b.projectId === projectId), [botProjects, projectId]);
  const [displayManageLuis, setDisplayManageLuis] = useState<boolean>(false);
  const [displayManageQNA, setDisplayManageQNA] = useState<boolean>(false);

  const { setSettings } = useRecoilValue(dispatcherState);
  const rootBotProjectId = useRecoilValue(rootBotProjectIdSelector) || '';
  const settings = useRecoilValue(settingsState(projectId));
  const mergedSettings = mergePropertiesManagedByRootBot(projectId, rootBotProjectId, settings);
  const [requiredNextSteps, setRequiredNextSteps] = useState<NextSteps[]>([]);
  const [recommendedNextSteps, setRecommendedNextSteps] = useState<NextSteps[]>([]);
  const [optionalSteps, setOptionalSteps] = useState<NextSteps[]>([]);

  const [highlightLUIS, setHighlightLUIS] = useState<boolean>(false);
  const [highlightQNA, setHighlightQNA] = useState<boolean>(false);

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
    if (!nextAction?.checked && nextAction?.highlight) {
      nextAction.highlight();
    }
    if (!nextAction) {
      props.onDismiss();
      props.onBotReady();
    }
  };

  const updateLuisSettings = (newLuisSettings) => {
    setSettings(rootBotProjectId, {
      ...mergedSettings,
      luis: { ...mergedSettings.luis, ...newLuisSettings },
    });
  };

  const updateQNASettings = (newQNASettings) => {
    setSettings(rootBotProjectId, {
      ...mergedSettings,
      qna: { ...mergedSettings.qna, ...newQNASettings },
    });
  };

  const linkToPackageManager = `/bot/${rootBotProjectId}/plugin/package-manager/package-manager`;
  const linkToConnections = `/bot/${rootBotProjectId}/botProjectsSettings/#connections`;
  const linkToPublishProfile = `/bot/${rootBotProjectId}/botProjectsSettings/#addNewPublishProfile`;
  const linkToLUISSettings = `/bot/${rootBotProjectId}/botProjectsSettings/#luisKey`;
  const linktoQNASettings = `/bot/${rootBotProjectId}/botProjectsSettings/#qnaKey`;
  const linkToLGEditor = `/bot/${rootBotProjectId}/language-generation`;
  const linkToLUEditor = `/bot/${rootBotProjectId}/language-understanding`;

  useEffect(() => {
    const newNextSteps: NextSteps[] = [];
    const newRecomendedSteps: NextSteps[] = [];

    const hasLUIS =
      botProject?.setting?.luis?.authoringKey && botProject?.setting?.luis?.authoringRegion ? true : false;
    const hasQNA = botProject?.setting?.qna?.subscriptionKey ? true : false;

    const hasPublishingProfile =
      botProject?.setting?.publishTargets && botProject?.setting?.publishTargets?.length > 0 ? true : false;

    if (props.requiresLUIS) {
      newNextSteps.push({
        key: 'luis',
        label: formatMessage('Add a LUIS key'),
        description: formatMessage('Setup Language Understanding so that you can start and test your bot.'),
        learnMore: 'https://www.luis.ai',
        required: true,
        checked: hasLUIS,
        highlight: (step) => {
          setHighlightLUIS(true);
        },
        onClick: (step) => {
          openLink(linkToLUISSettings);
          if (!step?.checked) {
            setDisplayManageLuis(true);
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
        highlight: (step) => {
          setHighlightQNA(true);
        },
        onClick: (step) => {
          openLink(linktoQNASettings);
          if (!step?.checked) {
            setDisplayManageQNA(true);
          }
        },
      });
    }
    setRequiredNextSteps(newNextSteps);

    if (props.showTeachingBubble && newNextSteps.length && newNextSteps[0].highlight) {
      newNextSteps[0].highlight();
    }

    if (!hasPublishingProfile) {
      newRecomendedSteps.push({
        key: 'publishing',
        label: formatMessage('Create a publishing profile'),
        description: formatMessage('Set up hosting and other Azure resources to enable publishing'),
        required: true,
        checked: hasPublishingProfile,
        onClick: (step) => {
          openLink(linkToPublishProfile);
        },
      });
    }
    setRecommendedNextSteps(newRecomendedSteps);

    const optSteps = [
      {
        key: 'packages',
        label: formatMessage('Add packages'),
        description: formatMessage('Visit the Package manager to browse packages to add to your bot.'),
        learnMore: '',
        checked: false,
        onClick: () => {
          openLink(linkToPackageManager);
        },
      },
      {
        key: 'editlg',
        label: formatMessage('Edit what your bot says'),
        description: formatMessage('Customize your bot by editing and adding bot responses.'),
        learnMore: '',
        checked: false,
        onClick: () => {
          openLink(linkToLGEditor);
        },
      },
      {
        key: 'editlu',
        label: formatMessage('Train your language model'),
        description: formatMessage('Ensure your bot can understand your users by frequently training your LUIS model.'),
        learnMore: '',
        checked: false,
        onClick: () => {
          openLink(linkToLUEditor);
        },
      },
    ];

    if (hasPublishingProfile) {
      optSteps.push({
        key: 'connections',
        label: formatMessage('Add connections'),
        description: formatMessage('Connect your bot to Teams, external channels, or enable speech. Learn more'),
        learnMore: '',
        checked: false,
        onClick: () => {
          openLink(linkToConnections);
        },
      });
    }

    setOptionalSteps(optSteps);
  }, [botProject, props.requiresLUIS, props.requiresQNA, props.showTeachingBubble]);

  return (
    <ScrollablePane styles={{ root: { marginTop: 60 } }}>
      <div css={{ paddingTop: 20, paddingLeft: 27, paddingRight: 20 }}>
        <ManageLuis
          hidden={!displayManageLuis}
          setDisplayManageLuis={setDisplayManageLuis}
          onDismiss={hideManageLuis}
          onGetKey={updateLuisSettings}
          onNext={() => {
            hideManageLuis();
            doNextStep('luis');
          }}
        />
        <ManageQNA
          hidden={!displayManageQNA}
          setDisplayManageQna={setDisplayManageQNA}
          onDismiss={hideManageQNA}
          onGetKey={updateQNASettings}
          onNext={() => {
            hideManageQNA();
            doNextStep('qna');
          }}
        />

        {highlightLUIS && (
          <TeachingBubble
            hasCondensedHeadline
            headline={formatMessage('Your new bot is almost ready!')}
            target="#luis"
            onDismiss={() => {
              setHighlightLUIS(false);
            }}
          >
            {formatMessage('Continue setting up your development environment by adding LUIS keys.')}
          </TeachingBubble>
        )}

        {highlightQNA && (
          <TeachingBubble
            hasCondensedHeadline
            headline={formatMessage('Almost there!')}
            target="#qna"
            onDismiss={() => {
              setHighlightQNA(false);
            }}
          >
            {formatMessage('Just add a QnA key and you’ll be ready to talk to your bot.')}
          </TeachingBubble>
        )}

        {requiredNextSteps.length ? (
          <div>
            <h3 style={h3Style}>{formatMessage('Required')}</h3>
            {requiredNextSteps.map((step) => (
              <GetStartedTask key={step.key} step={step} />
            ))}
          </div>
        ) : null}

        {recommendedNextSteps.length ? (
          <div>
            <h3 style={h3Style}>{formatMessage('Recommended')}</h3>
            {recommendedNextSteps.map((step) => (
              <GetStartedTask key={step.key} step={step} />
            ))}
          </div>
        ) : null}

        {optionalSteps.length ? (
          <div>
            <h3 style={h3Style}>{formatMessage('Optional')}</h3>
            {optionalSteps.map((step) => (
              <GetStartedTask key={step.key} step={step} />
            ))}
          </div>
        ) : null}
      </div>
    </ScrollablePane>
  );
};
