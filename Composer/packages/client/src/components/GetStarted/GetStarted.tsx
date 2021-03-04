// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
import { useRecoilValue } from 'recoil';
import formatMessage from 'format-message';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
import { Link } from 'office-ui-fabric-react/lib/Link';
import { Panel } from 'office-ui-fabric-react/lib/Panel';

import { localBotsDataSelector } from '../../recoilModel/selectors/project';
import { currentProjectIdState, locationState } from '../../recoilModel';
import TelemetryClient from '../../telemetry/TelemetryClient';

import { h3Style, ulStyle, liStyle } from './styles';

type GetStartedProps = {
  isOpen: boolean;
  onDismiss: () => void;
};

export const GetStarted: React.FC<GetStartedProps> = (props) => {
  const projectId = useRecoilValue(currentProjectIdState);
  const location = useRecoilValue(locationState(projectId));
  const botProjects = useRecoilValue(localBotsDataSelector);
  const botProject = botProjects.find((b) => b.projectId === projectId);

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
    <Panel headerText={botProject?.name} isOpen={props.isOpen} onDismiss={props.onDismiss}>
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
          {formatMessage('Customize')}
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
  );
};
