/**
    Copyright (c) Microsoft. All rights reserved.
    Licensed under the MIT license.

    Microsoft Bot Framework: http://botframework.com

    Bot Framework Composer Github:
    https://github.com/Microsoft/BotFramwork-Composer

    Copyright (c) Microsoft Corporation
    All rights reserved.

    MIT License:
    Permission is hereby granted, free of charge, to any person obtaining
    a copy of this software and associated documentation files (the
    "Software"), to deal in the Software without restriction, including
    without limitation the rights to use, copy, modify, merge, publish,
    distribute, sublicense, and/or sell copies of the Software, and to
    permit persons to whom the Software is furnished to do so, subject to
    the following conditions:

    The above copyright notice and this permission notice shall be
    included in all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED ""AS IS"", WITHOUT WARRANTY OF ANY KIND,
    EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
    MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
    NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
    LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
    OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
    WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
**/
import React, { useContext, useEffect } from 'react';
import { IconButton } from 'office-ui-fabric-react/lib/Button';
import { Link } from 'office-ui-fabric-react/lib/Link';
import formatMessage from 'format-message';

import { StoreContext } from '../../store';
import { CreationFlowStatus } from '../../constants';
import { ToolBar } from '../../components/ToolBar/index';

import * as home from './styles';
import { ItemContainer } from './itemContainer';
import { RecentBotList } from './recentBotList';
import { ExampleList } from './exampleList';

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
    title: formatMessage('Turtorial #1'),
    content: formatMessage('Lorem Ipsum dolor sit amet, consectetur'),
  },
  {
    title: formatMessage('Turtorial #2'),
    content: formatMessage('Lorem Ipsum dolor sit amet, consectetur'),
  },
];

export const Home = props => {
  const { state, actions } = useContext(StoreContext);
  const { recentProjects, templateProjects } = state;
  const { openBotProject, setCreationFlowStatus, fetchTemplates, saveTemplateId, fetchRecentProjects } = actions;

  const onClickRecentBotProject = async path => {
    await openBotProject(path);
  };

  const onClickNewBotProject = () => {
    setCreationFlowStatus(CreationFlowStatus.NEW_FROM_SCRATCH);
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

  const addButton = <IconButton styles={home.button()} iconProps={{ iconName: 'Add' }} />;
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
          <div css={home.title}>{formatMessage(`Bot Framework Composer`)}</div>
          <div css={home.introduction}>
            {formatMessage(
              'Bot Framework Composer is an integrated development environment(IDE) for building bots and other types of conversational software with the Microsoft Bot Framework technology stack'
            )}
          </div>
          <div css={home.newBotContainer}>
            <div data-testid={'homePage-body-New'}>
              <ItemContainer
                title={addButton}
                content={formatMessage('New')}
                styles={home.newBotItem}
                onClick={onClickNewBotProject}
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
              />
            ) : null}
          </div>
          <div css={home.leftContainer}>
            <div css={home.subtitle}>{formatMessage(`Recent Bots`)}</div>
            <RecentBotList
              recentProjects={recentProjects}
              onSelectionChanged={async item => {
                await onSelectionChanged(item);
              }}
            />
          </div>
          <div css={home.leftContainer}>
            <div css={home.subtitle}>
              {formatMessage(`Video turtorials: `)}
              <Link href={comingSoonLink.to} tabIndex={-1} key={comingSoonLink.text} target={'_blank'}>
                <div css={comingSoonLink.css}>{comingSoonLink.text}</div>
              </Link>
            </div>
            <div css={home.newBotContainer}>
              {turtorials.map((item, index) => (
                <ItemContainer key={index} title={item.title} content={item.content} styles={home.videoItem} />
              ))}
              <div css={home.linkContainer}>
                <div>
                  {formatMessage(
                    `Bot Framework provides the most comprehensive experience for building conversation applications.`
                  )}
                </div>
                {linksButtom.map(link => {
                  return (
                    <Link href={link.to} tabIndex={-1} key={'homePageLeftLinks-' + link.text} target={'_blank'}>
                      <div css={link.css}>{link.text}</div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
        <div css={home.rightPage}>
          <div css={home.bluetitle}>{formatMessage(`Examples`)}</div>
          <ExampleList examples={templateProjects} onClick={onClickTemplate} />
        </div>
      </div>
    </div>
  );
};
