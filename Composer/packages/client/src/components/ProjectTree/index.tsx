import React, { useRef, useMemo, useState } from 'react';
import { cloneDeep } from 'lodash';
import {
  GroupedList,
  IGroup,
  IGroupHeaderProps,
  IGroupRenderProps,
  IGroupedList,
  ActionButton,
  IIconProps,
  SearchBox,
} from 'office-ui-fabric-react';
import formatMessage from 'format-message';

import { DialogInfo, ITrigger } from '../../store/types';
import { getFriendlyName, createSelectedPath } from '../../utils';

import { groupListStyle, addButton, root } from './styles';
import { TreeItem } from './treeItem';

export function createGroupItem(dialog: DialogInfo, currentId: string, position: number) {
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

export function createItem(trigger: ITrigger, index: number) {
  return {
    ...trigger,
    index,
    displayName: trigger.displayName || getFriendlyName({ $type: trigger.type }),
  };
}

export function sortDialog(dialogs: DialogInfo[]) {
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

export function createGroup(
  dialogs: DialogInfo[],
  dialogId: string,
  filter: string
): { items: any[]; groups: IGroup[] } {
  let position = 0;
  const result = dialogs
    .filter(dialog => {
      return dialog.displayName.toLowerCase().indexOf(filter.toLowerCase()) > -1;
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
  const groupRef: React.RefObject<IGroupedList> = useRef(null);
  const { dialogs, dialogId, selected, openNewTriggerModal, onSelect, onDeleteTrigger, onDeleteDialog, onAdd } = props;
  const [filter, setFilter] = useState('');

  const sortedDialogs = useMemo(() => {
    return sortDialog(dialogs);
  }, [dialogs]);

  const onRenderHeader = (props: IGroupHeaderProps) => {
    const toggleCollapse = (): void => {
      if (groupRef.current && props.group) {
        groupRef.current.toggleCollapseAll(true);
        props.onToggleCollapse!(props.group);
        if (dialogId !== props.group.key) {
          onSelect(props.group.key);
        }
      }
    };
    return (
      <TreeItem
        link={props.group!.data}
        depth={0}
        isActive={!props.group!.isCollapsed}
        onSelect={toggleCollapse}
        onDelete={onDeleteDialog}
      />
    );
  };

  function onRenderCell(nestingDepth?: number, item?: any): React.ReactNode {
    return (
      <TreeItem
        link={item}
        depth={nestingDepth}
        isActive={createSelectedPath(item!.index) === selected}
        onSelect={() => onSelect(dialogId, createSelectedPath(item.index))}
        onDelete={() => onDeleteTrigger(dialogId, item.index)}
      />
    );
  }

  const onRenderShowAll = () => {
    return (
      <ActionButton css={addButton(1)} iconProps={addIconProps} onClick={openNewTriggerModal}>
        {formatMessage('New Trigger ..')}
      </ActionButton>
    );
  };

  const onFilter = (newValue: string): void => {
    setFilter(newValue);
  };

  return (
    <div css={root} data-testid="ProjectTree">
      <SearchBox placeholder={formatMessage('Filter Dialogs')} onChange={onFilter} iconProps={{ iconName: 'Filter' }} />
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
