// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { Fragment, useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';
import formatMessage from 'format-message';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
import { Link } from 'office-ui-fabric-react/lib/Link';
import { Panel } from 'office-ui-fabric-react/lib/Panel';
import { ActionButton } from 'office-ui-fabric-react/lib/Button';

import TelemetryClient from '../../telemetry/TelemetryClient';
import { localBotsDataSelector } from '../../recoilModel/selectors/project';
import { currentProjectIdState, locationState } from '../../recoilModel';
import { ManageLuis } from '../ManageLuis/ManageLuis';
import { ManageQNA } from '../ManageQNA/ManageQNA';
import { dispatcherState, settingsState } from '../../recoilModel';
import { mergePropertiesManagedByRootBot } from '../../recoilModel/dispatchers/utils/project';
import { rootBotProjectIdSelector } from '../../recoilModel/selectors/project';

import { h3Style, ulStyle, liStyle } from './styles';

type GetStartedProps = {
  isOpen: boolean;
  requiresLUIS: boolean;
  requiresQNA: boolean;
  onDismiss: () => void;
};

type NextSteps = {
  checked: boolean;
  key: string;
  label: string;
  checkedLabel: string;
  onClick: () => void;
};

export const GetStarted: React.FC<GetStartedProps> = (props) => {
  const projectId = useRecoilValue(currentProjectIdState);
  const location = useRecoilValue(locationState(projectId));
  const botProjects = useRecoilValue(localBotsDataSelector);
  const botProject = botProjects.find((b) => b.projectId === projectId);
  const [displayManageLuis, setDisplayManageLuis] = useState<boolean>(false);
  const [displayManageQNA, setDisplayManageQNA] = useState<boolean>(false);

  const { setSettings } = useRecoilValue(dispatcherState);
  const rootBotProjectId = useRecoilValue(rootBotProjectIdSelector) || '';
  const settings = useRecoilValue(settingsState(projectId));
  const mergedSettings = mergePropertiesManagedByRootBot(projectId, rootBotProjectId, settings);
  const [nextSteps, setNextSteps] = useState<NextSteps[]>([]);
  const hideManageLuis = () => {
    setDisplayManageLuis(false);
  };
  const hideManageQNA = () => {
    setDisplayManageQNA(false);
  };

  const doNextStep = (currentStep) => {
    const nextAction = nextSteps.filter((f) => !f.checked && f.key != currentStep)?.[0];
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
        label: formatMessage('Set up Language Understanding service'),
        checkedLabel: formatMessage('Language Understanding configured!'),
        checked: hasLUIS,
        onClick: () => {
          setDisplayManageLuis(true);
        },
      });
    }
    if (props.requiresQNA) {
      newNextSteps.push({
        key: 'qna',
        label: formatMessage('Set up QNA Maker service'),
        checkedLabel: formatMessage('QNA Maker configured!'),
        checked: hasQNA,
        onClick: () => {
          setDisplayManageQNA(true);
        },
      });
    }
    setNextSteps(newNextSteps);
  }, [botProject]);

  const linkToPackageManager = `/bot/${projectId}/plugin/package-manager/package-manager`;
  const linkToConnections = `/bot/${projectId}/botProjectsSettings/#connections`;
  const linkToProvision = `/bot/${projectId}/botProjectsSettings/#addNewPublishProfile`;
  const linkToPublish = `/bot/${projectId}/publish`;
  const linkToLGEditor = `/bot/${projectId}/language-generation`;
  const linkToLUEditor = `/bot/${projectId}/language-understanding`;
  const linkToAdaptiveExpressions =
    'https://docs.microsoft.com/en-us/azure/bot-service/bot-builder-concept-adaptive-expressions?view=azure-bot-service-4.0&tabs=arithmetic';
  const linkToGetStarted = 'https://docs.microsoft.com/en-us/composer/introduction';
  const linkToCreateFirstBot = 'https://docs.microsoft.com/en-us/composer/quickstart-create-bot';
  const linkToTutorials = 'https://docs.microsoft.com/en-us/composer/tutorial/tutorial-introduction';
  const linkToLGFileFormat =
    'https://docs.microsoft.com/en-us/azure/bot-service/file-format/bot-builder-lg-file-format?view=azure-bot-service-4.0';
  const linkToLUFileFormat =
    'https://docs.microsoft.com/en-us/azure/bot-service/file-format/bot-builder-lu-file-format?view=azure-bot-service-4.0';
  const linkToPreBuiltExpressions =
    'https://docs.microsoft.com/en-us/azure/bot-service/adaptive-expressions/adaptive-expressions-prebuilt-functions?view=azure-bot-service-4.0';

  const linkClick = (event) => {
    props.onDismiss();
    TelemetryClient.track('GettingStartedLinkClicked', { method: 'link', url: event.target.href });
  };

  return (
    <Fragment>
      <ManageLuis hidden={!displayManageLuis} onDismiss={hideManageLuis} onGetKey={updateLuisSettings} />
      <ManageQNA hidden={!displayManageQNA} onDismiss={hideManageQNA} onGetKey={updateQNASettings} />
      <Panel
        headerText={botProject?.name}
        isBlocking={false}
        isOpen={props.isOpen}
        styles={{
          root: {
            marginTop: '50px',
          },
          scrollableContent: {
            width: '100%',
            height: '100%',
          },
          content: {
            width: '100%',
            height: '100%',
          },
        }}
        onDismiss={props.onDismiss}
      >
        <Stack>
          <Stack.Item grow={0}>
            <p>
              {formatMessage('File Location:')}
              <span
                style={{
                  display: 'inline-block',
                  overflowWrap: 'break-word',
                  maxWidth: '100%',
                  fontSize: 12,
                }}
              >
                {location}
              </span>
            </p>
          </Stack.Item>
          <Stack.Item>
            <h3 style={h3Style}>{formatMessage('Next steps')}</h3>

            {nextSteps.map((step) => (
              <ActionButton
                key={step.key}
                iconProps={{ iconName: step.checked ? 'checkmark' : 'robot' }}
                onClick={step.onClick}
              >
                {step.checked ? step.checkedLabel : step.label}
              </ActionButton>
            ))}

            <h3>{formatMessage('Customize')}</h3>
            <ul style={ulStyle}>
              <li style={liStyle}>
                <Link href={linkToPackageManager} onClick={linkClick}>
                  {formatMessage('Add and remove packages')}
                </Link>
              </li>
              <li style={liStyle}>
                <Link href={linkToLGEditor} onClick={linkClick}>
                  {formatMessage('Edit what your bot says')}
                </Link>
              </li>
              <li style={liStyle}>
                <Link href={linkToLUEditor} onClick={linkClick}>
                  {formatMessage('Train your language model')}
                </Link>
              </li>
              <li style={liStyle}>
                <Link href={linkToConnections} onClick={linkClick}>
                  {formatMessage('Connect your bot to new services')}
                </Link>
              </li>
            </ul>
            {formatMessage('Publish')}
            <ul style={ulStyle}>
              <li style={liStyle}>
                <Link href={linkToProvision} onClick={linkClick}>
                  {formatMessage('Create a cloud hosting environment')}
                </Link>
              </li>
              <li style={liStyle}>
                <Link href={linkToPublish} onClick={linkClick}>
                  {formatMessage('Publish updates to the cloud')}
                </Link>
              </li>
            </ul>
            <h3 style={h3Style}>{formatMessage('Guides and references')}</h3>
            <ul style={ulStyle}>
              <li style={liStyle}>
                <Link href={linkToGetStarted} target="_blank" onClick={linkClick}>
                  {formatMessage('Get started with Bot Framework Composer')}
                </Link>
              </li>
              <li style={liStyle}>
                <Link href={linkToCreateFirstBot} target="_blank" onClick={linkClick}>
                  {formatMessage('Create your first bot')}
                </Link>
              </li>
              <li style={liStyle}>
                <Link href={linkToTutorials} target="_blank" onClick={linkClick}>
                  {formatMessage('Composer tutorials')}
                </Link>
              </li>
              <li style={liStyle}>
                <Link href={linkToAdaptiveExpressions} target="_blank" onClick={linkClick}>
                  {formatMessage('Learn about Adaptive expressions')}
                </Link>
              </li>
              <li style={liStyle}>
                <Link href={linkToPreBuiltExpressions} target="_blank" onClick={linkClick}>
                  {formatMessage('Find pre-built Adaptive expressions')}
                </Link>
              </li>
              <li style={liStyle}>
                <Link href={linkToLUFileFormat} target="_blank" onClick={linkClick}>
                  {formatMessage('LU file format and syntax')}
                </Link>
              </li>
              <li style={liStyle}>
                <Link href={linkToLGFileFormat} target="_blank" onClick={linkClick}>
                  {formatMessage('LG file format and syntax')}
                </Link>
              </li>
            </ul>
          </Stack.Item>
        </Stack>
      </Panel>
    </Fragment>
  );
};
