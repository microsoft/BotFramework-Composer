// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useCallback, useMemo, useRef, useState, Fragment } from 'react';
import { useRecoilValue } from 'recoil';
import { GroupedList, IGroup, IGroupHeaderProps, IGroupRenderProps } from 'office-ui-fabric-react/lib/GroupedList';
import cloneDeep from 'lodash/cloneDeep';
import { DialogInfo, ITrigger } from '@bfc/shared/src/types/indexers';
import { IGroupedList } from 'office-ui-fabric-react/lib/GroupedList';
import { IGroupedListStyles } from 'office-ui-fabric-react/lib/GroupedList';

import { dialogsNewState, projectIdState, dispatcherState } from '../../recoilModel';
import { createSelectedPath, getFriendlyName } from '../../utils/dialogUtil';

import { TreeItem } from './treeItem';

interface IIndividualProjectTreeProps {
  projectId: string;
  dialogId: string;
  selected: string;
  onSelect: (id: string, selected?: string) => void;
  onDeleteTrigger: (id: string, index: number) => void;
  onDeleteDialog: (id: string) => void;
  filter: string;
}

export const IndividualProjectTree: React.FC<IIndividualProjectTreeProps> = ({
  projectId,
  dialogId,
  selected,
  onSelect,
  onDeleteTrigger,
  onDeleteDialog,
  filter,
}: IIndividualProjectTreeProps) => {
  const dialogs = useRecoilValue(dialogsNewState(projectId));

  // const sortedDialogs = useMemo(() => {
  //   return sortDialog(dialogs);
  // }, [dialogs]);

  const itemsAndGroups: { items: any[]; groups: IGroup[] } = {
    items: [],
    groups: [],
  };

  return (
    <Fragment>
      {dialogs.map((dialogInfo) => (
        <span key={dialogInfo.id}> jsdfsdsadsdfsdfsdfsdff</span>
      ))}
    </Fragment>
  );
};
