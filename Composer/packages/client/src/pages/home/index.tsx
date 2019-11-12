// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useCallback, useContext, useEffect } from 'react';
import { Link } from 'office-ui-fabric-react/lib/Link';
import formatMessage from 'format-message';
import { Icon } from 'office-ui-fabric-react';

import { StoreContext } from '../../store';
import { CreationFlowStatus } from '../../constants';
import { ToolBar } from '../../components/ToolBar/index';

import * as home from './styles';
import { ItemContainer } from './ItemContainer';
import { RecentBotList } from './RecentBotList';
import { ExampleList } from './ExampleList';

const linksButtom = [
  {
    to: 'https://aka.ms/BF-Composer-Getting-Started',
    text: formatMessage('Getting Started'),
    css: home.linkInfo,
  },
  {
    to: 'https://aka.ms/BF-Composer-Build-First-Bot',
    text: formatMessage('Build your first bot'),
    css: home.linkInfo,
  },
];

const comingSoonLink = {
  to: '/home',
  text: formatMessage('Coming soon!'),
  css: home.bluetitle,
};

const turtorials = [
  {
    title: formatMessage('Tutorial #1'),
    content: formatMessage('Coming soon...'),
  },
  {
    title: formatMessage('Tutorial #2'),
    content: formatMessage('Coming soon...'),
  },
];

export const Home = props => {
  const { state, actions } = useContext(StoreContext);
  const { botName, recentProjects, templateProjects } = state;
  const {
    openBotProject,
    setCreationFlowStatus,
    fetchTemplates,
    saveTemplateId,
    fetchRecentProjects,
    onboardingAddCoachMarkRef,
  } = actions;

  const onClickRecentBotProject = async path => {
    await openBotProject(path);
  };

  const onSelectionChanged = async item => {
    if (item && item.path) {
      await onClickRecentBotProject(item.path);
    }
  };

  const onClickTemplate = id => {
    saveTemplateId(id);
    setCreationFlowStatus(CreationFlowStatus.NEW_FROM_TEMPLATE);
  };

  const addButton = <Icon styles={home.button} iconName="Add" />;

  const addRef = useCallback(project => onboardingAddCoachMarkRef({ project }), []);

  const toolbarItems = [
    {
      type: 'action',
      text: formatMessage('New'),
      buttonProps: {
        iconProps: {
          iconName: 'CirclePlus',
        },
        onClick: () => setCreationFlowStatus(CreationFlowStatus.NEW),
      },
      align: 'left',
      dataTestid: 'homePage-ToolBar-New',
      disabled: false,
    },
    {
      type: 'action',
      text: formatMessage('Open'),
      buttonProps: {
        iconProps: {
          iconName: 'OpenFolderHorizontal',
        },
        onClick: () => setCreationFlowStatus(CreationFlowStatus.OPEN),
      },
      align: 'left',
      dataTestid: 'homePage-ToolBar-Open',
      disabled: false,
    },
    {
      type: 'action',
      text: formatMessage('Save as'),
      buttonProps: {
        iconProps: {
          iconName: 'Save',
        },
        onClick: () => setCreationFlowStatus(CreationFlowStatus.SAVEAS),
      },
      align: 'left',
      disabled: botName ? false : true,
    },
  ];

  useEffect(() => {
    fetchRecentProjects();
    fetchTemplates();
  }, []);

  return (
    <div css={home.outline}>
      <ToolBar toolbarItems={toolbarItems} />
      <div css={home.page}>
        <div css={home.leftPage}>
          <h1 css={home.title}>{formatMessage(`Bot Framework Composer`)}</h1>
          <div css={home.introduction}>
            {formatMessage(
              'Bot Framework Composer is an integrated development environment (IDE) for building bots and other types of conversational software with the Microsoft Bot Framework technology stack'
            )}
          </div>
          <div css={home.newBotContainer}>
            <div data-testid={'homePage-body-New'}>
              <ItemContainer
                title={addButton}
                content={formatMessage('New')}
                styles={home.newBotItem}
                onClick={() => {
                  setCreationFlowStatus(CreationFlowStatus.NEW);
                }}
              />
            </div>
            {recentProjects.length > 0 ? (
              <ItemContainer
                title={''}
                content={recentProjects[0].name}
                styles={home.lastestBotItem}
                onClick={async () => {
                  await onClickRecentBotProject(recentProjects[0].path);
                }}
                forwardedRef={addRef}
              />
            ) : (
              <ItemContainer
                title={''}
                content={'ToDoBotWithLuis'}
                styles={home.lastestBotItem}
                onClick={() => {
                  onClickTemplate('ToDoBotWithLuisSample');
                }}
                forwardedRef={addRef}
              />
            )}
          </div>
          {recentProjects.length > 0 && (
            <div css={home.leftContainer}>
              <h2 css={home.subtitle}>{formatMessage(`Recent Bots`)}</h2>
              <RecentBotList
                recentProjects={recentProjects}
                onSelectionChanged={async item => {
                  await onSelectionChanged(item);
                }}
              />
            </div>
          )}
          <div css={home.leftContainer}>
            <h2 css={home.subtitle}>
              {formatMessage('Video tutorials:')}&nbsp;
              <Link href={comingSoonLink.to} tabIndex={-1} key={comingSoonLink.text} target={'_blank'}>
                <span css={comingSoonLink.css}>{comingSoonLink.text}</span>
              </Link>
            </h2>
            <div css={home.newBotContainer}>
              {turtorials.map((item, index) => (
                <ItemContainer key={index} title={item.title} content={item.content} disabled />
              ))}
              <div css={home.linkContainer}>
                <div>
                  {formatMessage(
                    'Bot Framework provides the most comprehensive experience for building conversation applications.'
                  )}
                </div>
                {linksButtom.map(link => {
                  return (
                    <Link
                      href={link.to}
                      tabIndex={-1}
                      key={'homePageLeftLinks-' + link.text}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <div css={link.css}>{link.text}</div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
        <div css={home.rightPage}>
          <h3 css={home.bluetitle}>{formatMessage(`Examples`)}</h3>
          <p css={home.examplesDescription}>
            {formatMessage(
              "These examples bring together all of the best practices and supporting components we've identified through building of conversational experiences."
            )}
          </p>
          <ExampleList examples={templateProjects} onClick={onClickTemplate} />
        </div>
      </div>
    </div>
  );
};
