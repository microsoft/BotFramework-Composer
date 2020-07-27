// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useRecoilValue } from 'recoil';
import React, { Fragment } from 'react';

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

export const ProjectTreeContainer: React.FC<IProjectTreeProps> = (props: IProjectTreeProps) => {
  const botProjects = useRecoilValue(botProjectsState);

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
