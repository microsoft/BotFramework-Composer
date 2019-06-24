/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Link } from '@reach/router';
import { IconButton } from 'office-ui-fabric-react/lib/Button';

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
  myBotContainer,
  myBotTitle,
  myBots,
  myBot,
  action,
  actionName,
  button,
} from './styles';
export const Home = () => {
  return (
    <div css={outline}>
      <div css={title}>Are you real? </div>
      <div css={introduction}>
        <div css={introTitle}>
          <div css={introTitleLeft}> Creating real conversations for real people. </div>
          <div css={introTitleRight}> Product Video </div>
        </div>
        <div css={linkContainer}>
          <div css={linkLeft}>
            <Link to={'/home'} tabIndex={-1}>
              <div css={linkInfo}>See how it works</div>
            </Link>
            <Link to={'/home'} tabIndex={-1}>
              <div css={linkInfo}>View interactive tutorial</div>
            </Link>
          </div>
          <div css={linkRight}>
            <Link to={'/home'} tabIndex={-1}>
              <div css={linkInfo}>Create, test and deploy your bot</div>
            </Link>
            <Link to={'/home'} tabIndex={-1}>
              <div css={linkInfo}>Create a PowerApps environment</div>
            </Link>
            <Link to={'/home'} tabIndex={-1}>
              <div css={moreOptions}>see more options</div>
            </Link>
          </div>
        </div>
      </div>
      <div css={myBotContainer}>
        <div css={myBotTitle}>Start from scratch, or pick up where you left off... </div>
        <div css={myBots}>
          <div css={myBot}>
            <div css={action}>
              <IconButton styles={button()} iconProps={{ iconName: 'Add' }} />
            </div>
            <div css={actionName}> New </div>
          </div>
          <div css={myBot}>
            <div css={action}>
              <IconButton styles={button()} iconProps={{ iconName: 'Code' }} />
            </div>
            <div css={actionName}> ToDo - LUIS </div>
          </div>
          <div css={myBot}>
            <div css={action}>
              <IconButton styles={button()} iconProps={{ iconName: 'AllApps' }} />
            </div>
            <div css={actionName}> Add - To Do </div>
          </div>
          <div css={myBot}>
            <div css={action}>
              <IconButton styles={button()} iconProps={{ iconName: 'AddFriend' }} />
            </div>
            <div css={actionName}> More ToDo </div>
          </div>
          <div css={myBot}>
            <div css={action}>
              <IconButton styles={button()} iconProps={{ iconName: 'Car' }} />
            </div>
            <div css={actionName}> Less ToDo </div>
          </div>
        </div>
      </div>
    </div>
  );
};
