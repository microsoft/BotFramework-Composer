// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { Fragment, useCallback } from 'react';
import formatMessage from 'format-message';
import { Link } from 'office-ui-fabric-react/lib/Link';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import { RouteComponentProps } from '@reach/router';
import { navigate } from '@reach/router';
import { useRecoilValue } from 'recoil';
import { Toolbar, IToolbarItem, defaultToolbarButtonStyles, defaultFirstToolbarButtonStyles } from '@bfc/ui-shared';

import { CreationFlowStatus } from '../../constants';
import { dispatcherState, botDisplayNameState, templateProjectsState } from '../../recoilModel';
import {
  recentProjectsState,
  templateIdState,
  currentProjectIdState,
  featureFlagsState,
} from '../../recoilModel/atoms/appState';
import TelemetryClient from '../../telemetry/TelemetryClient';

import * as home from './styles';
import { ItemContainer } from './ItemContainer';
import { RecentBotList } from './RecentBotList';
import { ExampleList } from './ExampleList';
import composerDocumentIcon from '../../images/composerDocumentIcon.svg';
import composerIcon from '../../images/composerIcon.svg';

const feeds = {
  whatsNewLinks: [
    {
      title: 'Composer 1.4',
      description: "Learn about new features in Composer's latest release.",
      url: 'https://www.microsoft.com',
    },
    {
      title: 'Build 2020 updates',
      description: 'Read all of the updates from this years Build conference, including Composer GA and SDK v4.9.',
      url: 'https://techcommunity.microsoft.com/t5/azure-ai/build-2020-conversational-ai-updates/ba-p/1397685',
    },
    {
      title: 'November 2020 update',
      description:
        'November release of the Bot Framework SDK and Composer, including deeper integration with Power Virtual Agents!',
      url: 'https://www.microsoft.com',
    },
    {
      title: 'Conversational AI at Microsoft Ignite',
      description:
        'Updates from Microsoft Ignite. New Composer release, public preview of Orchestrator and updates to Azure Bot Service and Bot Framework SDK.',
      url: 'https://www.microsoft.com',
    },
  ],
  tabs: [
    {
      title: 'Videos',
      viewAllLinkText: 'View all videos',
      viewAllLinkUrl: 'https://www.youtube.com/channel/UC8qPRh20PpuxBvxf0w2WrwQ',
      cards: [
        {
          image: 'https://via.placeholder.com/244x95/09f/fff.png',
          title: 'Introduction to Composer',
          description: 'A five minute intro to Composer',
          url: 'https://www.youtube.com/watch?v=hiIiZnRcCv0',
        },
        {
          image: 'https://via.placeholder.com/244x95/09f/fff.png',
          title: 'Build a weather bot',
          description: 'An end to end tutorial for creating a weather bot',
          url: 'https://www.youtube.com/watch?v=hiIiZnRcCv0',
        },
        {
          image: 'https://via.placeholder.com/244x95/09f/fff.png',
          title: 'Using prompts',
          description: 'Discover how to use prompts to accept input from users',
          url: 'https://www.youtube.com/watch?v=hiIiZnRcCv0',
        },
        {
          image: 'https://via.placeholder.com/244x95/09f/fff.png',
          title: 'Using LG',
          description: 'Explore Language Generation and how to generate dynamic responses',
          url: 'https://www.youtube.com/watch?v=hiIiZnRcCv0',
        },
      ],
    },
    {
      title: 'Articles',
      cards: [
        {
          image: 'https://via.placeholder.com/244x95/09f/fff.png',
          title: 'Introduction to Composer',
          description: 'A five minute intro to Composer',
          url: 'https://www.youtube.com/watch?v=hiIiZnRcCv0',
        },
        {
          image: 'https://via.placeholder.com/244x95/09f/fff.png',
          title: 'Build a weather bot',
          description: 'An end to end tutorial for creating a weather bot',
          url: 'https://www.youtube.com/watch?v=hiIiZnRcCv0',
        },
        {
          image: 'https://via.placeholder.com/244x95/09f/fff.png',
          title: 'Using prompts',
          description: 'Discover how to use prompts to accept input from users',
          url: 'https://www.youtube.com/watch?v=hiIiZnRcCv0',
        },
        {
          image: 'https://via.placeholder.com/244x95/09f/fff.png',
          title: 'Using LG',
          description: 'Explore Language Generation and how to generate dynamic responses',
          url: 'https://www.youtube.com/watch?v=hiIiZnRcCv0',
        },
      ],
    },
  ],
};

const resources = [
  {
    imageCover: composerDocumentIcon,
    title: 'Composer documentation',
    description: 'Find tutorials, step-by-step guides. Discover what you can build with Composer.',
    moreText: 'Read documentation',
    url: 'https://github.com/microsoft/BotFramework-Composer',
  },
];

const tutorials = [
  {
    title: formatMessage('5 Minute Intro'),
    content: formatMessage('Chris Whitten'),
    subContent: formatMessage('Apr 9, 2020'),
    href: 'https://aka.ms/bf-composer-tutorial-chris',
  },
  {
    title: formatMessage('Weather Bot'),
    content: formatMessage('Ben Brown'),
    subContent: formatMessage('Nov 12, 2019'),
    href: 'https://aka.ms/bf-composer-tutorial-ben',
  },
  {
    title: formatMessage('MSFT Ignite AI Show'),
    content: formatMessage('Vishwac Sena'),
    subContent: formatMessage('Jan 28, 2020'),
    href: 'https://aka.ms/bf-composer-tutorial-vishwac',
  },
];

const Home: React.FC<RouteComponentProps> = () => {
  const projectId = useRecoilValue(currentProjectIdState);
  const botName = useRecoilValue(botDisplayNameState(projectId));
  const recentProjects = useRecoilValue(recentProjectsState);
  const templateId = useRecoilValue(templateIdState);
  const { openProject, setCreationFlowStatus, saveTemplateId, setCreationFlowType } = useRecoilValue(dispatcherState);

  const featureFlags = useRecoilValue(featureFlagsState);
  const botTemplates = useRecoilValue(templateProjectsState);

  const onItemChosen = async (item) => {
    if (item?.path) {
      await openProject(item.path, 'default', true, null, (projectId) => {
        TelemetryClient.track('BotProjectOpened', { method: 'list', projectId });
      });
    }
  };

  const onClickTemplate = async (id: string) => {
    saveTemplateId(id);
    setCreationFlowStatus(CreationFlowStatus.NEW_FROM_TEMPLATE);
    TelemetryClient.track('CreateNewBotProject', { method: 'luisCallToAction' });
    navigate(`projects/create/${id}`);
  };

  const onClickNewBot = () => {
    setCreationFlowType('Bot');
    setCreationFlowStatus(CreationFlowStatus.NEW);
    featureFlags?.NEW_CREATION_FLOW?.enabled ? navigate(`v2/projects/create`) : navigate(`projects/create`);
  };

  const toolbarItems: IToolbarItem[] = [
    {
      type: 'action',
      text: formatMessage('New'),
      buttonProps: {
        iconProps: {
          iconName: 'Add',
        },
        onClick: () => {
          onClickNewBot();
          TelemetryClient.track('ToolbarButtonClicked', { name: 'new' });
        },
        styles: defaultFirstToolbarButtonStyles,
      },
      align: 'left',
      dataTestid: 'homePage-Toolbar-New',
      disabled: false,
    },
    {
      type: 'action',
      text: formatMessage('Open'),
      buttonProps: {
        iconProps: {
          iconName: 'OpenFolderHorizontal',
        },
        onClick: () => {
          setCreationFlowStatus(CreationFlowStatus.OPEN);
          navigate(`projects/open`);
          TelemetryClient.track('ToolbarButtonClicked', { name: 'openBot' });
        },
        styles: defaultToolbarButtonStyles,
      },
      align: 'left',
      dataTestid: 'homePage-Toolbar-Open',
      disabled: false,
    },
    {
      type: 'action',
      text: formatMessage('Save as'),
      buttonProps: {
        iconProps: {
          iconName: 'Save',
        },
        onClick: () => {
          setCreationFlowStatus(CreationFlowStatus.SAVEAS);
          navigate(`projects/${projectId}/${templateId}/save`);
          TelemetryClient.track('ToolbarButtonClicked', { name: 'saveAs' });
        },
        styles: defaultToolbarButtonStyles,
      },
      align: 'left',
      disabled: botName ? false : true,
    },
  ];
  return (
    <div css={home.outline}>
      <h1 css={home.title}>{formatMessage(`Bot Framework Composer`)}</h1>
      <div css={home.page}>
        <div css={home.leftPage} role="main">
          <div css={home.leftContainer}>
            <h2 css={home.subtitle}>{formatMessage(`Recent Bots`)}</h2>
            <Toolbar toolbarItems={toolbarItems} />

            {recentProjects.length > 0 && (
              <RecentBotList
                recentProjects={recentProjects}
                onItemChosen={async (item) => {
                  await onItemChosen(item);
                }}
              />
            )}
          </div>
          <div css={[home.leftContainer, home.gap40]}>
            <h2 css={home.subtitle}>{formatMessage('Resources')}&nbsp;</h2>
            <div css={home.rowContainer}>
              {resources.map((item, index) => (
                <ItemContainer
                  key={index}
                  ariaLabel={item.title}
                  content={item.description}
                  href={item.url}
                  imageCover={item.imageCover}
                  moreLinkText={item.moreText}
                  rel="noopener nofollow"
                  styles={home.cardItem}
                  target="_blank"
                  title={item.title}
                />
              ))}
            </div>
          </div>
        </div>
        {!featureFlags?.NEW_CREATION_FLOW?.enabled && (
          <div aria-label={formatMessage(`What's new list`)} css={home.rightPage} role="region">
            <h3 css={home.subtitle}>{formatMessage(`What's new`)}</h3>

            {feeds.whatsNewLinks.map(({ title, description, url }) => {
              return (
                <Fragment>
                  <Link href={url} css={home.bluetitle}>
                    {title}
                  </Link>
                  <p css={home.newsDescription}>{description}</p>
                </Fragment>
              );
            })}
            <Link css={home.bluetitle}>{formatMessage(`More...`)}</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
