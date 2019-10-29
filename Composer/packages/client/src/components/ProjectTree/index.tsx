/**
    Copyright (c) Microsoft. All rights reserved.
    Licensed under the MIT license.

    Microsoft Bot Framework: http://botframework.com

    Bot Framework Composer Github:
    https://github.com/Microsoft/BotFramwork-Composer

    Copyright (c) Microsoft Corporation
    All rights reserved.

    MIT License:
    Permission is hereby granted, free of charge, to any person obtaining
    a copy of this software and associated documentation files (the
    "Software"), to deal in the Software without restriction, including
    without limitation the rights to use, copy, modify, merge, publish,
    distribute, sublicense, and/or sell copies of the Software, and to
    permit persons to whom the Software is furnished to do so, subject to
    the following conditions:

    The above copyright notice and this permission notice shall be
    included in all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED ""AS IS"", WITHOUT WARRANTY OF ANY KIND,
    EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
    MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
    NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
    LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
    OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
    WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
**/
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
import React, { useMemo, useRef, useState } from 'react';
import { cloneDeep } from 'lodash';
import formatMessage from 'format-message';
import { DialogInfo, ITrigger } from 'shared';

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
  const groupRef: React.RefObject<IGroupedList> = useRef(null);
  const { dialogs, dialogId, selected, openNewTriggerModal, onSelect, onDeleteTrigger, onDeleteDialog, onAdd } = props;
  const [filter, setFilter] = useState('');

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
      <TreeItem
        link={props.group!.data}
        depth={0}
        isActive={!props.group!.isCollapsed}
        isSubItemActive={!!selected}
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
        isActive={createSelectedPath(item.index) === selected}
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
