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
      <div role="main">
        <SkillSettings
          botId={state.settings.MicrosoftAppId}
          botName={state.botName}
          projectId={state.projectId}
          setSettings={actions.setSettings}
          settings={state.settings}
          skillHostEndpoint={state.settings.skillHostEndpoint as string | undefined}
        />
      </div>
      <SkillList projectId={projectId} skills={skills} />
    </div>
  );
};

export default Skills;
