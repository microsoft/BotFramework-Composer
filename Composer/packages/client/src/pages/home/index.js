/** @jsx jsx */
import { jsx } from '@emotion/core';
import { IconButton, Link } from 'office-ui-fabric-react/lib';
import { useContext, useEffect, useMemo } from 'react';

import { Store } from '../../store/index';

import {
  outline,
  title,
  introduction,
  introTitle,
  introTitleLeft,
  introTitleRight,
  linkInfo,
  linkContainer,
  linkLeft,
  linkRight,
  moreOptions,
  botArea,
  botTitle,
  botContainer,
  botContent,
  action,
  actionName,
  button,
  templateArea,
  templateTitle,
  templateContainer,
  templateContent,
  templateText,
  footer,
  content,
} from './styles';

const linksLeft = [
  {
    to: '/home',
    text: 'See how it works',
    css: linkInfo,
  },
  {
    to: '/home',
    text: 'View interactive tutorial',
    css: linkInfo,
  },
];

const linksRight = [
  {
    to: '/home',
    text: 'Create, test and deploy your bot',
    css: linkInfo,
  },
  {
    to: '/home',
    text: 'Create a PowerApps environment',
    css: linkInfo,
  },
  {
    to: '/home',
    text: 'See more options',
    css: moreOptions,
  },
];

const templates = [
  {
    text: 'Get Started with a Basic Conversation',
  },
  {
    text: 'Customer Care Solutions',
  },
  {
    text: 'Retail and Sales Conversations',
  },
  {
    text: 'Personal Assistant Experiences',
  },
];

export const Home = () => {
  const { state, actions } = useContext(Store);
  const { openBotProject } = actions;

  const onClickRecentBotProject = async (storageId, path) => {
    await openBotProject(storageId, path);
    actions.fetchRecentProjects();
  };

  useEffect(() => {
    actions.fetchRecentProjects();
  }, []);

  const bots = useMemo(() => {
    const recentProjects = state.recentProjects || [];
    const _bots = recentProjects.map(rp => {
      const pathTokens = rp.path.split('/');
      return {
        iconName: 'Add',
        actionName: pathTokens[pathTokens.length - 2],
        path: rp.path,
        storageId: rp.storageId,
      };
    });
    _bots.splice(0, 0, {
      iconName: 'Add',
      actionName: 'New',
    });
    return _bots;
  }, [state.recentProjects]);
  return (
    <div css={outline}>
      <div css={content}>
        <div css={title}>&quot;Are you real?&quot;</div>
        <div css={introduction}>
          <div css={introTitle}>
            <div css={introTitleLeft}> Creating real conversations for real people. </div>
            <div css={introTitleRight}> Product Video </div>
          </div>
          <div css={linkContainer}>
            <div css={linkLeft}>
              {linksLeft.map((link, index) => {
                return (
                  <Link href={link.to} tabIndex={-1} key={'homePageLeftLinks-' + index}>
                    <div css={link.css}>{link.text}</div>
                  </Link>
                );
              })}
            </div>
            <div css={linkRight}>
              {linksRight.map((link, index) => {
                return (
                  <Link href={link.to} tabIndex={-1} key={'homePageRightLinks-' + index}>
                    <div css={link.css}>{link.text}</div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
        <div css={botArea}>
          <div css={botTitle}>Start from scratch, or pick up where you left off... </div>
          <div css={botContainer}>
            {bots.map((bot, index) => {
              if (index > 4) return null;
              return (
                <div css={botContent} key={'homePageBot-' + index}>
                  <div
                    css={action}
                    onClick={() => {
                      onClickRecentBotProject(bot.storageId, bot.path);
                    }}
                  >
                    <IconButton styles={button()} iconProps={{ iconName: bot.iconName }} />
                  </div>
                  <div css={actionName}> {bot.actionName} </div>
                </div>
              );
            })}
          </div>
        </div>
        <div css={templateArea}>
          <div css={templateTitle}> Or start with a conversation template </div>
          <div css={templateContainer}>
            {templates.map((template, index) => {
              return (
                <div css={templateContent} key={'homePageTemplate-' + index}>
                  <div css={templateText}>{template.text}</div>
                </div>
              );
            })}
          </div>
        </div>

        <Link href="/home" css={footer}>
          Learn More
        </Link>
      </div>
    </div>
  );
};
