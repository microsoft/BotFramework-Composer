// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useEffect, useState, useMemo } from 'react';
import { useRecoilValue } from 'recoil';
import formatMessage from 'format-message';
import { TeachingBubble } from 'office-ui-fabric-react/lib/TeachingBubble';
import { ScrollablePane } from 'office-ui-fabric-react/lib/ScrollablePane';
import { DisplayMarkdownDialog } from '@bfc/ui-shared';

import TelemetryClient from '../../telemetry/TelemetryClient';
import { localBotsDataSelector } from '../../recoilModel/selectors/project';
import { currentProjectIdState } from '../../recoilModel';
import { ManageLuis } from '../ManageLuis/ManageLuis';
import { ManageQNA } from '../ManageQNA/ManageQNA';
import { dispatcherState, settingsState } from '../../recoilModel';
import { mergePropertiesManagedByRootBot } from '../../recoilModel/dispatchers/utils/project';
import { rootBotProjectIdSelector } from '../../recoilModel/selectors/project';
import { navigateTo } from '../../utils/navigation';
import { usePVACheck } from '../../hooks/usePVACheck';
import { projectReadmeState } from '../../recoilModel/atoms';

import { GetStartedTask } from './GetStartedTask';
import { NextStep } from './types';
import { h3Style, topH3Style } from './styles';

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
  const readme = useRecoilValue(projectReadmeState(projectId));
  const [readmeHidden, setReadmeHidden] = useState<boolean>(true);

  const { setSettings, setQnASettings } = useRecoilValue(dispatcherState);
  const rootBotProjectId = useRecoilValue(rootBotProjectIdSelector) || '';
  const settings = useRecoilValue(settingsState(projectId));
  const mergedSettings = mergePropertiesManagedByRootBot(projectId, rootBotProjectId, settings);
  const [requiredNextSteps, setRequiredNextSteps] = useState<NextStep[]>([]);
  const [recommendedNextSteps, setRecommendedNextSteps] = useState<NextStep[]>([]);
  const [optionalSteps, setOptionalSteps] = useState<NextStep[]>([]);

  const [highlightLUIS, setHighlightLUIS] = useState<boolean>(false);
  const [highlightQNA, setHighlightQNA] = useState<boolean>(false);
  const isPVABot = usePVACheck(projectId);

  const hideManageLuis = () => {
    setDisplayManageLuis(false);
  };
  const hideManageQNA = () => {
    setDisplayManageQNA(false);
  };

  const openLink = (link) => {
    TelemetryClient.track('GettingStartedLinkClicked', { method: 'link', url: link });
    if (link.startsWith('http')) {
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      window.open(link, '_blank');
    } else {
      navigateTo(link);
    }
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
      luis: { ...mergedSettings.luis, authoringKey: newLuisSettings.key, authoringRegion: newLuisSettings.region },
    });
  };

  const updateQNASettings = (newQNASettings) => {
    setSettings(rootBotProjectId, {
      ...mergedSettings,
      qna: { ...mergedSettings.qna, subscriptionKey: newQNASettings.key },
    });
    setQnASettings(rootBotProjectId, newQNASettings.key);
  };

  const linkToPackageManager = `/bot/${rootBotProjectId}/plugin/package-manager/package-manager`;
  const linkToConnections = `/bot/${rootBotProjectId}/botProjectsSettings/#connections`;
  const linkToPublishProfile = `/bot/${rootBotProjectId}/publish/all#addNewPublishProfile`;
  const linkToPublish = `/bot/${rootBotProjectId}/publish/all`;
  const linkToCompletePublishProfile = `/bot/${rootBotProjectId}/publish/all#completePublishProfile`;
  const linkToLUISSettings = `/bot/${rootBotProjectId}/botProjectsSettings/#luisKey`;
  const linktoQNASettings = `/bot/${rootBotProjectId}/botProjectsSettings/#qnaKey`;
  const linkToLGEditor = `/bot/${rootBotProjectId}/language-generation`;
  const linkToLUEditor = `/bot/${rootBotProjectId}/language-understanding`;
  const linkToAppInsights = 'http://aka.ms/botinsights';
  const linkToDevOps = 'https://aka.ms/bfcomposercicd';
  const linkToReadme = `/bot/${rootBotProjectId}/botProjectsSettings`;

  useEffect(() => {
    const newNextSteps: NextStep[] = [];
    const newRecomendedSteps: NextStep[] = [];

    const hasLUIS =
      botProject?.setting?.luis?.authoringKey && botProject?.setting?.luis?.authoringRegion ? true : false;
    const hasQNA = botProject?.setting?.qna?.subscriptionKey ? true : false;

    const hasPublishingProfile =
      botProject?.setting?.publishTargets && botProject?.setting?.publishTargets?.length > 0 ? true : false;

    const hasPartialPublishingProfile =
      botProject?.setting?.publishTargets &&
      botProject?.setting?.publishTargets?.length == 1 &&
      JSON.parse(botProject.setting.publishTargets[0].configuration).hostname == ''
        ? true
        : false;

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
          TelemetryClient.track('GettingStartedActionClicked', { taskName: 'luis', priority: 'required' });
          openLink(linkToLUISSettings);
          if (!step?.checked) {
            setDisplayManageLuis(true);
          }
        },
        hideFeatureStep: isPVABot,
      });
    }
    if (props.requiresQNA) {
      newNextSteps.push({
        key: 'qna',
        label: formatMessage('Add a QnA Maker key'),
        description: formatMessage('Your template requires QnA Maker to access content for your bot.'),
        learnMore: 'https://aka.ms/composer-addqnamaker-learnmore',
        required: true,
        checked: hasQNA,
        highlight: (step) => {
          setHighlightQNA(true);
        },
        onClick: (step) => {
          TelemetryClient.track('GettingStartedActionClicked', { taskName: 'qna', priority: 'required' });
          openLink(linktoQNASettings);
          if (!step?.checked) {
            setDisplayManageQNA(true);
          }
        },
        hideFeatureStep: isPVABot,
      });
    }
    setRequiredNextSteps(newNextSteps);

    if (props.showTeachingBubble && newNextSteps.length && newNextSteps[0].highlight) {
      newNextSteps[0].highlight();
    }

    if (readme) {
      newRecomendedSteps.push({
        key: 'readme',
        label: formatMessage('Review your template readme'),
        description: formatMessage('Find additional template-specific guidance for setting up your bot.'),
        checked: false,
        learnMore: 'https://aka.ms/composer-template-overview',
        onClick: (step) => {
          TelemetryClient.track('GettingStartedActionClicked', { taskName: 'readme', priority: 'recommended' });
          openLink(linkToReadme);
          setReadmeHidden(false);
        },
        hideFeatureStep: false,
      });
    }
    if (!hasPublishingProfile) {
      newRecomendedSteps.push({
        key: 'publishing',
        label: formatMessage('Create a publishing profile'),
        description: formatMessage('Set up hosting and other Azure resources to enable publishing'),
        checked: hasPublishingProfile,
        learnMore: 'https://aka.ms/composer-getstarted-publishingprofile',
        onClick: () => {
          TelemetryClient.track('GettingStartedActionClicked', { taskName: 'publishing', priority: 'recommended' });
          openLink(linkToPublishProfile);
        },
        hideFeatureStep: false,
      });
    }
    if (hasPartialPublishingProfile) {
      newRecomendedSteps.push({
        key: 'partialProfile',
        label: formatMessage('Complete your publishing profile'),
        description: formatMessage(
          'Finish setting up your environment and provisioning resources so that you can publish your bot.'
        ),
        checked: hasPublishingProfile && !hasPartialPublishingProfile,
        learnMore: 'https://aka.ms/composer-getstarted-publishingprofile',
        onClick: () => {
          TelemetryClient.track('GettingStartedActionClicked', { taskName: 'partialProfile', priority: 'recommended' });
          openLink(linkToCompletePublishProfile);
        },
        hideFeatureStep: false,
      });
    }

    newRecomendedSteps.push({
      key: 'editlg',
      label: formatMessage('Edit what your bot says'),
      description: formatMessage('Customize your bot by editing and adding bot responses.'),
      learnMore: 'https://aka.ms/composer-getstarted-editbotsays',
      checked: false,
      onClick: () => {
        TelemetryClient.track('GettingStartedActionClicked', { taskName: 'editlg', priority: 'recommended' });
        openLink(linkToLGEditor);
      },
      hideFeatureStep: false,
    });
    newRecomendedSteps.push({
      key: 'editlu',
      label: formatMessage('Train your language model'),
      description: formatMessage('Ensure your bot can understand your users by frequently training your LUIS model.'),
      learnMore: 'https://aka.ms/composer-luis-learnmore',
      checked: false,
      onClick: () => {
        TelemetryClient.track('GettingStartedActionClicked', { taskName: 'editlu', priority: 'recommended' });
        openLink(linkToLUEditor);
      },
      hideFeatureStep: isPVABot,
    });

    setRecommendedNextSteps(newRecomendedSteps);

    const optSteps: NextStep[] = [
      {
        key: 'packages',
        label: formatMessage('Add packages'),
        description: formatMessage('Visit the Package manager to browse packages to add to your bot.'),
        learnMore: 'https://aka.ms/composer-getstarted-addpackages',
        checked: false,
        onClick: () => {
          TelemetryClient.track('GettingStartedActionClicked', { taskName: 'packages', priority: 'optional' });
          openLink(linkToPackageManager);
        },
        hideFeatureStep: isPVABot,
      },
      {
        key: 'insights',
        label: formatMessage('Enable Insights'),
        description: formatMessage(
          'Collect service-level and conversation-level data to help gauge the performance and efficacy of your bot.'
        ),
        learnMore: 'https://aka.ms/composer-getstarted-enableinsights',
        checked: false,
        onClick: () => {
          TelemetryClient.track('GettingStartedActionClicked', { taskName: 'insights', priority: 'optional' });
          openLink(linkToAppInsights);
        },
        hideFeatureStep: false,
      },
      {
        key: 'devops',
        label: formatMessage('Publish to Dev Ops'),
        description: formatMessage('Learn how to publish to a Dev Ops pipeline using CI / CD.'),
        learnMore: 'https://aka.ms/bfcomposercicd',
        checked: false,
        onClick: () => {
          TelemetryClient.track('GettingStartedActionClicked', { taskName: 'devops', priority: 'optional' });
          openLink(linkToDevOps);
        },
        hideFeatureStep: isPVABot,
      },
    ];

    if (hasPublishingProfile) {
      if (!hasPartialPublishingProfile) {
        optSteps.push({
          key: 'publish',
          label: formatMessage('Publish your bot'),
          description: formatMessage('Once you publish your bot to Azure you will be ready to add connections.'),
          learnMore: 'https://aka.ms/composer-getstarted-publishbot',
          checked: false,
          onClick: () => {
            TelemetryClient.track('GettingStartedActionClicked', { taskName: 'publish', priority: 'optional' });
            openLink(linkToPublish);
          },
          hideFeatureStep: isPVABot,
        });
      }

      optSteps.push({
        key: 'connections',
        label: formatMessage('Add connections'),
        description: formatMessage('Connect your bot to Teams, external channels, or enable speech.'),
        learnMore: 'https://aka.ms/composer-connections-learnmore',
        checked: false,
        onClick: () => {
          TelemetryClient.track('GettingStartedActionClicked', { taskName: 'connections', priority: 'optional' });
          openLink(linkToConnections);
        },
        hideFeatureStep: isPVABot,
      });
    }

    setOptionalSteps(optSteps);
  }, [botProject, props.requiresLUIS, props.requiresQNA, props.showTeachingBubble]);

  const getStartedTaskElement = (step: NextStep) => {
    if (!step.hideFeatureStep) {
      return <GetStartedTask key={step.key} step={step} />;
    }
    return null;
  };

  return (
    <ScrollablePane styles={{ root: { marginTop: 60 } }}>
      <div css={{ paddingTop: 20, paddingLeft: 27, paddingRight: 20 }}>
        <ManageLuis
          hidden={!displayManageLuis}
          onDismiss={hideManageLuis}
          onGetKey={updateLuisSettings}
          onNext={() => {
            hideManageLuis();
            doNextStep('luis');
          }}
          onToggleVisibility={setDisplayManageLuis}
        />
        <ManageQNA
          hidden={!displayManageQNA}
          onDismiss={hideManageQNA}
          onGetKey={updateQNASettings}
          onNext={() => {
            hideManageQNA();
            doNextStep('qna');
          }}
          onToggleVisibility={setDisplayManageQNA}
        />
        <DisplayMarkdownDialog
          content={readme}
          hidden={readmeHidden}
          title={formatMessage('Project Readme')}
          onDismiss={() => {
            setReadmeHidden(true);
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
            <h3 css={topH3Style}>{formatMessage('Required')}</h3>
            {requiredNextSteps.map((step) => getStartedTaskElement(step))}
          </div>
        ) : null}

        {recommendedNextSteps.length ? (
          <div>
            <h3 css={h3Style}>{formatMessage('Recommended')}</h3>
            {recommendedNextSteps.map((step) => getStartedTaskElement(step))}
          </div>
        ) : null}

        {optionalSteps.length ? (
          <div>
            <h3 css={h3Style}>{formatMessage('Optional')}</h3>
            {optionalSteps.map((step) => getStartedTaskElement(step))}
          </div>
        ) : null}
      </div>
    </ScrollablePane>
  );
};
