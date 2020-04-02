// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { RouteComponentProps } from '@reach/router';
import React, { useContext } from 'react';
import formatMessage from 'format-message';
import get from 'lodash/get';

import { ToolBar } from '../../components/ToolBar/index';
import { TestController } from '../../TestController';
import { StoreContext } from '../../store';

import { ContentHeaderStyle, HeaderText } from './styles';
import SkillList from './SkillList';

const Skills: React.FC<RouteComponentProps> = () => {
  const { state } = useContext(StoreContext);

  const { settings, projectId } = state;
  const skills = get(settings, 'skill', []);
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
