/** @jsx jsx */
import { jsx } from '@emotion/core';
import { IconButton, Link } from 'office-ui-fabric-react/lib';
import { useContext, useEffect, useMemo } from 'react';

import { Store } from '../../store/index';

import * as home from './styles';

const linksLeft = [
  {
    to: '/home',
    text: 'See how it works',
    css: home.linkInfo,
  },
  {
    to: '/home',
    text: 'View interactive tutorial',
    css: home.linkInfo,
  },
];

const linksRight = [
  {
    to: '/home',
    text: 'Create, test and deploy your bot',
    css: home.linkInfo,
  },
  {
    to: '/home',
    text: 'Create a PowerApps environment',
    css: home.linkInfo,
  },
  {
    to: '/home',
    text: 'See more options',
    css: home.moreOptions,
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
  const botNumLimit = 5;
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
        iconName: 'Robot',
        actionName: pathTokens[pathTokens.length - 2],
        path: rp.path,
        storageId: rp.storageId,
      };
    });
    _bots.splice(0, 0, {
      iconName: 'Robot',
      actionName: 'New',
    });
    return _bots;
  }, [state.recentProjects]);
  return (
    <div css={home.outline}>
      <div css={home.content}>
        <div css={home.title}>&quot;Are you real?&quot;</div>
        <div css={home.introduction}>
          <div css={home.introTitle}>
            <div css={home.introTitleLeft}> Creating real conversations for real people. </div>
            <div css={home.introTitleRight}> Product Video </div>
          </div>
          <div css={home.linkContainer}>
            <div css={home.linkLeft}>
              {linksLeft.map((link, index) => {
                return (
                  <Link href={link.to} tabIndex={-1} key={'homePageLeftLinks-' + index}>
                    <div css={link.css}>{link.text}</div>
                  </Link>
                );
              })}
            </div>
            <div css={home.linkRight}>
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
        <div css={home.botArea}>
          <div css={home.botTitle}>Start from scratch, or pick up where you left off... </div>
          <div css={home.botContainer}>
            {bots.map((bot, index) => {
              if (index > botNumLimit) return null;
              return (
                <div css={home.botContent} key={'homePageBot-' + index}>
                  <div
                    css={home.action}
                    onClick={() => {
                      onClickRecentBotProject(bot.storageId, bot.path);
                    }}
                  >
                    <IconButton styles={home.button()} iconProps={{ iconName: bot.iconName }} />
                  </div>
                  <div css={home.actionName}> {bot.actionName} </div>
                </div>
              );
            })}
          </div>
        </div>
        <div css={home.templateArea}>
          <div css={home.templateTitle}> Or start with a conversation template </div>
          <div css={home.templateContainer}>
            {templates.map((template, index) => {
              return (
                <div css={home.templateContent} key={'homePageTemplate-' + index}>
                  <div css={home.templateText}>{template.text}</div>
                </div>
              );
            })}
          </div>
        </div>

        <Link href="/home" css={home.footer}>
          Learn More
        </Link>
      </div>
    </div>
  );
};
