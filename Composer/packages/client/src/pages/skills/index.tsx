// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { RouteComponentProps } from '@reach/router';
import React from 'react';
import formatMessage from 'format-message';

import { ToolBar } from '../../components/ToolBar/index';
import { TestController } from '../../TestController';

import { Root, ContentHeaderStyle, HeaderText } from './styles';
import SkillList from './SkillList';

const Skills: React.FC<RouteComponentProps> = () => {
  const toolbarItems = [
    {
      type: 'element',
      element: <TestController />,
      align: 'right',
    },
  ];

  return (
    <div css={Root} data-testid="skills-page">
      <ToolBar toolbarItems={toolbarItems} />
      <div css={ContentHeaderStyle}>
        <h1 css={HeaderText}>{formatMessage('Skills')}</h1>
      </div>

      <SkillList items={[]}></SkillList>
    </div>
  );
};

export default Skills;
