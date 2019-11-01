// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  ActionButton,
  GroupedList,
  IGroup,
  IGroupHeaderProps,
  IGroupRenderProps,
  IGroupedList,
  IIconProps,
  SearchBox,
} from 'office-ui-fabric-react';
import React, { useCallback, useContext, useMemo, useRef, useState } from 'react';
import { cloneDeep } from 'lodash';
import formatMessage from 'format-message';
import { DialogInfo, ITrigger } from '@bfc/shared';

import { StoreContext } from '../../store';
import { createSelectedPath, getFriendlyName } from '../../utils';

import { addButton, groupListStyle, root, searchBox } from './styles';
import { TreeItem } from './treeItem';

function createGroupItem(dialog: DialogInfo, currentId: string, position: number) {
  return {
    key: dialog.id,
    name: dialog.displayName,
    level: 1,
    startIndex: position,
    count: dialog.triggers.length,
    hasMoreData: true,
    isCollapsed: dialog.id !== currentId,
    data: dialog,
  };
}

function createItem(trigger: ITrigger, index: number) {
  return {
    ...trigger,
    index,
    displayName: trigger.displayName || getFriendlyName({ $type: trigger.type }),
  };
}

function sortDialog(dialogs: DialogInfo[]) {
  const dialogsCopy = cloneDeep(dialogs);
  return dialogsCopy.sort((x, y) => {
    if (x.isRoot) {
      return -1;
    } else if (y.isRoot) {
      return 1;
    } else {
      return 0;
    }
  });
}

function createGroup(dialogs: DialogInfo[], dialogId: string, filter: string): { items: any[]; groups: IGroup[] } {
  let position = 0;
  const result = dialogs
    .filter(dialog => {
      return dialog.displayName.toLowerCase().includes(filter.toLowerCase());
    })
    .reduce(
      (result: { items: any[]; groups: IGroup[] }, dialog) => {
        result.groups.push(createGroupItem(dialog, dialogId, position));
        position += dialog.triggers.length;
        dialog.triggers.forEach((item, index) => {
          result.items.push(createItem(item, index));
        });
        return result;
      },
      { items: [], groups: [] }
    );
  return result;
}

interface IProjectTreeProps {
  dialogs: DialogInfo[];
  dialogId: string;
  selected: string;
  openNewTriggerModal: () => void;
  onSelect: (id: string, selected?: string) => void;
  onDeleteTrigger: (id: string, index: number) => void;
  onDeleteDialog: (id: string) => void;
  onAdd: () => void;
}

const addIconProps: IIconProps = {
  iconName: 'CircleAddition',
  styles: { root: { fontSize: '12px' } },
};

export const ProjectTree: React.FC<IProjectTreeProps> = props => {
  const {
    actions: { onboardingAddCoachMarkRef },
  } = useContext(StoreContext);
  const groupRef: React.RefObject<IGroupedList> = useRef(null);
  const { dialogs, dialogId, selected, openNewTriggerModal, onSelect, onDeleteTrigger, onDeleteDialog, onAdd } = props;
  const [filter, setFilter] = useState('');

  const addMainDialogRef = useCallback(mainDialog => onboardingAddCoachMarkRef({ mainDialog }), []);
  const addNewTriggerRef = useCallback(newTrigger => onboardingAddCoachMarkRef({ newTrigger }), []);

  const sortedDialogs = useMemo(() => {
    return sortDialog(dialogs);
  }, [dialogs]);

  const onRenderHeader = (props: IGroupHeaderProps) => {
    const toggleCollapse = (): void => {
      groupRef.current!.toggleCollapseAll(true);
      props.onToggleCollapse!(props.group!);
      onSelect(props.group!.key);
    };
    return (
      <span ref={props.group && props.group.data.isRoot && addMainDialogRef}>
        <TreeItem
          link={props.group!.data}
          depth={0}
          isActive={!props.group!.isCollapsed}
          isSubItemActive={!!selected}
          onSelect={toggleCollapse}
          onDelete={onDeleteDialog}
        />
      </span>
    );
  };

  function onRenderCell(nestingDepth?: number, item?: any): React.ReactNode {
    return (
      <TreeItem
        link={item}
        depth={nestingDepth}
        isActive={createSelectedPath(item.index) === selected}
        onSelect={() => onSelect(dialogId, createSelectedPath(item.index))}
        onDelete={() => onDeleteTrigger(dialogId, item.index)}
      />
    );
  }

  const onRenderShowAll = () => {
    return (
      <ActionButton css={addButton(1)} iconProps={addIconProps} onClick={openNewTriggerModal}>
        <span ref={addNewTriggerRef}>{formatMessage('New Trigger ..')}</span>
      </ActionButton>
    );
  };

  const onFilter = (_e?: any, newValue?: string): void => {
    if (typeof newValue === 'string') {
      setFilter(newValue);
    }
  };

  return (
    <div className="ProjectTree" css={root} data-testid="ProjectTree">
      <SearchBox
        placeholder={formatMessage('Filter Dialogs')}
        styles={searchBox}
        onChange={onFilter}
        iconProps={{ iconName: 'Filter' }}
      />
      <GroupedList
        {...createGroup(sortedDialogs, dialogId, filter)}
        onRenderCell={onRenderCell}
        componentRef={groupRef}
        groupProps={
          {
            onRenderHeader: onRenderHeader,
            onRenderShowAll: onRenderShowAll,
            showEmptyGroups: true,
            showAllProps: false,
            isAllGroupsCollapsed: true,
          } as Partial<IGroupRenderProps>
        }
        styles={groupListStyle}
      />
      <ActionButton tabIndex={1} iconProps={addIconProps} css={addButton(0)} onClick={onAdd}>
        {formatMessage('New Dialog ..')}
      </ActionButton>
    </div>
  );
};
