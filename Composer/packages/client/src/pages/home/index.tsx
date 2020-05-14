// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useCallback, useContext, useEffect } from 'react';
import formatMessage from 'format-message';
import { Link } from 'office-ui-fabric-react/lib/Link';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import { RouteComponentProps } from '@reach/router';
import { navigate } from '@reach/router';

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

const turtorials = [
  {
    title: formatMessage('5 Minute Intro'),
    content: formatMessage('Chris Whitten'),
    subContent: formatMessage('Apr 9, 2020'),
    href: 'https://www.youtube.com/watch?v=8HUsto8cH30',
  },
  {
    title: formatMessage('Weather Bot'),
    content: formatMessage('Ben Brown'),
    subContent: formatMessage('Nov 12, 2019'),
    href: 'https://www.youtube.com/watch?v=P-kKw2HGP3o',
  },
  {
    title: formatMessage('MSFT Ignite AI Show'),
    content: formatMessage('Vishwac Sena'),
    subContent: formatMessage('Jan 28, 2020'),
    href: 'https://www.youtube.com/watch?v=Aiv95e2-Yn0',
  },
];

const Home: React.FC<RouteComponentProps> = () => {
  const { state, actions } = useContext(StoreContext);
  const { botName, recentProjects, templateProjects } = state;
  const {
    openBotProject,
    setCreationFlowStatus,
    saveTemplateId,
    fetchRecentProjects,
    onboardingAddCoachMarkRef,
  } = actions;

  const onClickRecentBotProject = async path => {
    await openBotProject(path);
  };

  const onItemChosen = async item => {
    if (item && item.path) {
      await onClickRecentBotProject(item.path);
    }
  };

  const onClickTemplate = async (id: string) => {
    await saveTemplateId(id);
    setCreationFlowStatus(CreationFlowStatus.NEW_FROM_TEMPLATE);
    navigate(`projects/create/${id}`);
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
        onClick: () => {
          setCreationFlowStatus(CreationFlowStatus.NEW);
          navigate(`projects/create`);
        },
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
        onClick: () => {
          setCreationFlowStatus(CreationFlowStatus.OPEN);
          navigate(`projects/open`);
        },
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
        onClick: () => {
          setCreationFlowStatus(CreationFlowStatus.SAVEAS);
          navigate(`projects/${state.projectId}/${state.templateId}/save`);
        },
      },
      align: 'left',
      disabled: botName ? false : true,
    },
  ];

  useEffect(() => {
    fetchRecentProjects();
  }, []);

  return (
    <div css={home.outline}>
      <ToolBar toolbarItems={toolbarItems} onboardingAddCoachMarkRef={onboardingAddCoachMarkRef} />
      <div css={home.page}>
        <div role="main" css={home.leftPage}>
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
                  navigate('projects/create');
                }}
              />
            </div>
            {recentProjects.length > 0 ? (
              <ItemContainer
                title={''}
                content={recentProjects[0].name}
                styles={home.latestBotItem}
                onClick={async () => {
                  await onClickRecentBotProject(recentProjects[0].path);
                }}
                forwardedRef={addRef}
              />
            ) : (
              <ItemContainer
                title={''}
                content={'ToDoBotWithLuis'}
                styles={home.latestBotItem}
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
                onItemChosen={async item => {
                  await onItemChosen(item);
                }}
              />
            </div>
          )}
          <div css={home.leftContainer}>
            <h2 css={home.subtitle}>{formatMessage('Video tutorials:')}&nbsp;</h2>
            <div css={home.newBotContainer}>
              {turtorials.map((item, index) => (
                <ItemContainer
                  styles={home.tutorialTile}
                  key={index}
                  title={item.title}
                  content={item.content}
                  subContent={item.subContent}
                  href={item.href}
                  target="_blank"
                  rel="noopener nofollow"
                />
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
                      style={{ width: '150px' }}
                      href={link.to}
                      tabIndex={0}
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

export default Home;
