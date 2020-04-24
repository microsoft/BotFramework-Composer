// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { RouteComponentProps } from '@reach/router';
import React, { useContext } from 'react';
import formatMessage from 'format-message';

import { ToolBar } from '../../components/ToolBar/index';
import { TestController } from '../../components/TestController';
import { StoreContext } from '../../store';
import { ContentStyle } from '../language-understanding/styles';

import { ContentHeaderStyle, HeaderText } from './styles';
import SkillSettings from './skill-settings';
import SkillList from './skill-list';

const Skills: React.FC<RouteComponentProps> = () => {
  const { state, actions } = useContext(StoreContext);

  const { skills, projectId } = state;
  const toolbarItems = [
    {
      type: 'element',
      element: <TestController />,
      align: 'right',
    },
  ];

  return (
    <div data-testid="skills-page">
      <ToolBar toolbarItems={toolbarItems} />
      <div css={ContentHeaderStyle}>
        <h1 css={HeaderText}>{formatMessage('Skills')}</h1>
      </div>
      <div css={ContentStyle}></div>
      <div role="main">
        <SkillSettings
          projectId={state.projectId}
          botName={state.botName}
          settings={state.settings}
          setSettings={actions.setSettings}
          botId={state.settings.MicrosoftAppId}
          skillHostEndpoint={state.settings.skillHostEndpoint as string | undefined}
        />
      </div>
      <SkillList skills={skills} projectId={projectId} />
    </div>
  );
};

export default Skills;
