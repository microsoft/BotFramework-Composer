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
import SkillList from './skill-list';

const Skills: React.FC<RouteComponentProps> = () => {
  const { state } = useContext(StoreContext);

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

      <SkillList skills={skills} projectId={projectId}></SkillList>
    </div>
  );
};

export default Skills;
