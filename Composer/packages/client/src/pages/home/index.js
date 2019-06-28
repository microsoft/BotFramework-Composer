/** @jsx jsx */
import { jsx } from '@emotion/core';
import { IconButton, Link } from 'office-ui-fabric-react/lib';

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

const bots = [
  {
    iconName: 'Add',
    actionName: 'New',
  },
  {
    iconName: 'Code',
    actionName: 'ToDo - LUIS',
  },
  {
    iconName: 'AllApps',
    actionName: 'Add - ToDo',
  },
  {
    iconName: 'AddFriend',
    actionName: 'More ToDo',
  },
  {
    iconName: 'Car',
    actionName: 'Less - ToDo',
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
              return (
                <div css={botContent} key={'homePageBot-' + index}>
                  <div css={action}>
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
