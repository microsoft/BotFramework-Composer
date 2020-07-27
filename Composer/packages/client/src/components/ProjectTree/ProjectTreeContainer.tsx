// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useRecoilValue } from 'recoil';
import React, { Fragment } from 'react';
/** @jsx jsx */
import { jsx, css } from '@emotion/core';

import { botProjectsState } from '../../recoilModel';

import { IndividualProjectTree } from './IndividualProjectTree';
interface IProjectTreeProps {
  dialogId: string;
  selected: string;
  onSelect: (id: string, selected?: string) => void;
  onDeleteTrigger: (id: string, index: number) => void;
  onDeleteDialog: (id: string) => void;
  filter: string;
}

const root = css`
  width: 100%;
  height: 100%;
  border-right: 1px solid #c4c4c4;
  box-sizing: border-box;
  overflow-y: auto;
  overflow-x: hidden;
  .ms-List-cell {
    min-height: 36px;
  }
`;

export const ProjectTreeContainer: React.FC<IProjectTreeProps> = (props: IProjectTreeProps) => {
  const botProjects = useRecoilValue(botProjectsState);
  const mapper = [botProjects[1]];
  return (
    <Fragment>
      {botProjects.map((projectId) => (
        <IndividualProjectTree
          key={projectId}
          dialogId={props.dialogId}
          filter={props.filter}
          projectId={projectId}
          selected={props.selected}
          onDeleteDialog={props.onDeleteDialog}
          onDeleteTrigger={props.onDeleteTrigger}
          onSelect={props.onSelect}
        />
      ))}
    </Fragment>
  );
};
