// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useEffect } from 'react';
import { useRecoilValue } from 'recoil';
import formatMessage from 'format-message';
import { Toolbar, IToolbarItem } from '@bfc/ui-shared';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
import { Link } from 'office-ui-fabric-react/lib/Link';

import { localBotsDataSelector } from '../../recoilModel/selectors/project';
import { currentProjectIdState, locationState } from '../../recoilModel';
import TelemetryClient from '../../telemetry/TelemetryClient';
import { navigateTo } from '../../utils/navigation';

import { wrapperStyle, buttonStyles, h2Style, h3Style, ulStyle, ulStyleGuides, linkStyle, liStyle } from './styles';

type GetStartedProps = {
  toolbarItems?: IToolbarItem[];
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
  const linkToDelete = `/bot/${projectId}/botProjectsSettings/#deleteBot`;
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

  const items: IToolbarItem[] = [
    {
      text: formatMessage('Delete bot'),
      type: 'action',
      buttonProps: {
        iconProps: { iconName: 'Trash' },
        onClick: () => buttonClick(linkToDelete),
        styles: buttonStyles,
      },
      align: 'left',
    },
    {
      text: formatMessage('Add a package'),
      type: 'action',
      buttonProps: {
        iconProps: { iconName: 'Package' },
        onClick: () => buttonClick(linkToPackageManager),
        styles: buttonStyles,
      },
      align: 'left',
    },
    {
      text: formatMessage('Edit LG'),
      type: 'action',
      buttonProps: {
        iconProps: { iconName: 'Robot' },
        onClick: () => buttonClick(linkToLGEditor),
        styles: buttonStyles,
      },
      align: 'left',
    },
    {
      text: formatMessage('Edit LU'),
      type: 'action',
      buttonProps: {
        iconProps: { iconName: 'People' },
        onClick: () => buttonClick(linkToLUEditor),
        styles: buttonStyles,
      },
      align: 'left',
    },
    {
      text: formatMessage('Manage connections'),
      type: 'action',
      buttonProps: {
        iconProps: { iconName: 'PlugConnected' },
        onClick: () => buttonClick(linkToConnections),
        styles: buttonStyles,
      },
      align: 'left',
    },
  ];

  const linkClick = (event) => {
    TelemetryClient.track('GettingStartedLinkClicked', { method: 'link', url: event.target.href });
  };

  const buttonClick = (link) => {
    TelemetryClient.track('GettingStartedLinkClicked', { method: 'button', url: link });
    navigateTo(link);
  };

  useEffect(() => {}, []);

  return (
    <div style={wrapperStyle}>
      <Toolbar
        css={{ paddingLeft: 25, borderBottom: '1px solid #3d3d3d' }}
        toolbarItems={props.toolbarItems ? items.concat(props.toolbarItems) : items}
      />
      <Stack horizontal>
        <Stack.Item grow={0} styles={{ root: { width: 250, borderRight: '1px solid #3d3d3d', padding: 38 } }}>
          <h2 style={h2Style}>{botProject?.name}</h2>
          <p>
            {formatMessage('File Location:')} <span style={{ textOverflow: 'ellipses', fontSize: 12 }}>{location}</span>
          </p>
        </Stack.Item>
        <Stack.Item styles={{ root: { padding: 38 } }}>
          <h3 style={h3Style}>{formatMessage('Next steps')}</h3>
          <Stack horizontal verticalFill tokens={{ childrenGap: 40 }}>
            <Stack.Item>
              {formatMessage('Customize')}
              <ul style={ulStyle}>
                <li style={liStyle}>
                  <Link href={linkToPackageManager} styles={linkStyle} onClick={linkClick}>
                    {formatMessage('Add and remove packages')}
                  </Link>
                </li>
                <li style={liStyle}>
                  <Link href={linkToLGEditor} styles={linkStyle} onClick={linkClick}>
                    {formatMessage('Edit what your bot says')}
                  </Link>
                </li>
                <li style={liStyle}>
                  <Link href={linkToLUEditor} styles={linkStyle} onClick={linkClick}>
                    {formatMessage('Train your language model')}
                  </Link>
                </li>
                <li style={liStyle}>
                  <Link href={linkToConnections} styles={linkStyle} onClick={linkClick}>
                    {formatMessage('Connect your bot to new services')}
                  </Link>
                </li>
              </ul>
            </Stack.Item>
            <Stack.Item>
              {formatMessage('Publish')}
              <ul style={ulStyle}>
                <li style={liStyle}>
                  <Link href={linkToProvision} styles={linkStyle} onClick={linkClick}>
                    {formatMessage('Create a cloud hosting environment')}
                  </Link>
                </li>
                <li style={liStyle}>
                  <Link href={linkToPublish} styles={linkStyle} onClick={linkClick}>
                    {formatMessage('Publish updates to the cloud')}
                  </Link>
                </li>
              </ul>
            </Stack.Item>
          </Stack>
        </Stack.Item>
        <Stack.Item styles={{ root: { borderLeft: '1px solid #3d3d3d', padding: 38 } }}>
          <h3 style={h3Style}>{formatMessage('Guides and references')}</h3>
          <ul style={ulStyleGuides}>
            <li style={liStyle}>
              <Link href={linkToGetStarted} styles={linkStyle} target="_blank" onClick={linkClick}>
                {formatMessage('Get started with Bot Framework Composer')}
              </Link>
            </li>
            <li style={liStyle}>
              <Link href={linkToCreateFirstBot} styles={linkStyle} target="_blank" onClick={linkClick}>
                {formatMessage('Create your first bot')}
              </Link>
            </li>
            <li style={liStyle}>
              <Link href={linkToTutorials} styles={linkStyle} target="_blank" onClick={linkClick}>
                {formatMessage('Composer tutorials')}
              </Link>
            </li>
            <li style={liStyle}>
              <Link href={linkToLGFileFormat} styles={linkStyle} target="_blank" onClick={linkClick}>
                {formatMessage('LG file format and syntax')}
              </Link>
            </li>
            <li style={liStyle}>
              <Link href={linkToAdaptiveExpressions} styles={linkStyle} target="_blank" onClick={linkClick}>
                {formatMessage('Learn about Adaptive expressions')}
              </Link>
            </li>
            <li style={liStyle}>
              <Link href={linkToPreBuiltExpressions} styles={linkStyle} target="_blank" onClick={linkClick}>
                {formatMessage('Find pre-built Adaptive expressions')}
              </Link>
            </li>
            <li style={liStyle}>
              <Link href={linkToLUFileFormat} styles={linkStyle} target="_blank" onClick={linkClick}>
                {formatMessage('LU file format and syntax')}
              </Link>
            </li>
          </ul>
        </Stack.Item>
      </Stack>
    </div>
  );
};
