// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

// TODO: Remove path module

import React, { useEffect } from 'react';
import { useRecoilValue } from 'recoil';
import formatMessage from 'format-message';
import { Toolbar, IToolbarItem } from '@bfc/ui-shared';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
import { Link } from 'office-ui-fabric-react/lib/Link';

import { localBotsDataSelector } from '../../recoilModel/selectors/project';
import { currentProjectIdState, locationState } from '../../recoilModel';
// import TelemetryClient from '../../telemetry/TelemetryClient';
import { navigateTo } from '../../utils/navigation';

import { wrapperStyle, buttonStyles, h2Style, h3Style, ulStyle, linkStyle, liStyle } from './styles';

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
      text: 'Edit LG',
      type: 'action',
      buttonProps: {
        iconProps: { iconName: 'Robot' },
        onClick: () => buttonClick(linkToLGEditor),
        styles: buttonStyles,
      },
      align: 'left',
    },
    {
      text: 'Edit LU',
      type: 'action',
      buttonProps: {
        iconProps: { iconName: 'People' },
        onClick: () => buttonClick(linkToLUEditor),
        styles: buttonStyles,
      },
      align: 'left',
    },
    {
      text: 'Manage connections',
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
    event.preventDefault();
    // TODO: track telemetry!
    navigateTo(event.currentTarget.getAttribute('href'));
  };

  const buttonClick = (link) => {
    // TODO: track telemetry
    navigateTo(link);
  };

  useEffect(() => {}, []);

  return (
    <div style={wrapperStyle}>
      <Toolbar toolbarItems={items.concat(props.toolbarItems)} />
      <Stack horizontal>
        <Stack.Item grow={0} styles={{ root: { width: 250, borderRight: '1px solid #3d3d3d', padding: 20 } }}>
          <h2 style={h2Style}>{botProject?.name}</h2>
          <p>
            File Location: <span style={{ textOverflow: 'ellipses' }}>{location}</span>
          </p>
        </Stack.Item>
        <Stack.Item styles={{ root: { padding: 20 } }}>
          <h3 style={h3Style}>Next steps</h3>
          <Stack horizontal verticalFill tokens={{ childrenGap: 40 }}>
            <Stack.Item>
              Customize
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
              </ul>
            </Stack.Item>
            <Stack.Item>
              Configure
              <ul style={ulStyle}>
                <li style={liStyle}>
                  <Link href={linkToConnections} styles={linkStyle} onClick={linkClick}>
                    {formatMessage('Connect your bot to new services')}
                  </Link>
                </li>
              </ul>
            </Stack.Item>
            <Stack.Item>
              Publish
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
        <Stack.Item styles={{ root: { borderLeft: '1px solid #3d3d3d', padding: 20 } }}>
          <h3 style={h3Style}>Guides and references</h3>
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
    </div>
  );
};
