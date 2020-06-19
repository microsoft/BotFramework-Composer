// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useCallback, useContext, useMemo, useRef, useState } from 'react';
import {
  GroupedList,
  IGroup,
  IGroupHeaderProps,
  IGroupRenderProps,
  IGroupedList,
} from 'office-ui-fabric-react/lib/GroupedList';
import { SearchBox } from 'office-ui-fabric-react/lib/SearchBox';
import { FocusZone, FocusZoneDirection } from 'office-ui-fabric-react/lib/FocusZone';
import cloneDeep from 'lodash/cloneDeep';
import formatMessage from 'format-message';
import { DialogInfo, ITrigger } from '@bfc/shared';
import { Resizable, ResizeCallback } from 're-resizable';
import debounce from 'lodash/debounce';

import { StoreContext } from '../../store';
import { createSelectedPath, getFriendlyName } from '../../utils';

import { groupListStyle, root, searchBox } from './styles';
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
    displayName: trigger.displayName || getFriendlyName({ $kind: trigger.type }),
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

function createItemsAndGroups(
  dialogs: DialogInfo[],
  dialogId: string,
  filter: string
): { items: any[]; groups: IGroup[] } {
  let position = 0;
  const result = dialogs
    .filter((dialog) => {
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
  onSelect: (id: string, selected?: string) => void;
  onDeleteTrigger: (id: string, index: number) => void;
  onDeleteDialog: (id: string) => void;
}

export const ProjectTree: React.FC<IProjectTreeProps> = (props) => {
  const {
    actions: { onboardingAddCoachMarkRef, updateUserSettings },
    state: {
      userSettings: { dialogNavWidth: currentWidth },
    },
  } = useContext(StoreContext);
  const groupRef: React.RefObject<IGroupedList> = useRef(null);
  const { dialogs, dialogId, selected, onSelect, onDeleteTrigger, onDeleteDialog } = props;
  const [filter, setFilter] = useState('');
  const delayedSetFilter = debounce((newValue) => setFilter(newValue), 1000);
  const addMainDialogRef = useCallback((mainDialog) => onboardingAddCoachMarkRef({ mainDialog }), []);

  const sortedDialogs = useMemo(() => {
    return sortDialog(dialogs);
  }, [dialogs]);

  const onRenderHeader = (props: IGroupHeaderProps) => {
    const toggleCollapse = (): void => {
      groupRef.current?.toggleCollapseAll(true);
      props.onToggleCollapse?.(props.group!);
      onSelect(props.group!.key);
    };
    return (
      <span ref={props.group?.data.isRoot && addMainDialogRef} role="grid">
        <TreeItem
          depth={0}
          isActive={!props.group!.isCollapsed}
          isSubItemActive={!!selected}
          link={props.group!.data}
          onDelete={onDeleteDialog}
          onSelect={toggleCollapse}
        />
      </span>
    );
  };

  function onRenderCell(nestingDepth?: number, item?: any): React.ReactNode {
    return (
      <TreeItem
        depth={nestingDepth}
        isActive={createSelectedPath(item.index) === selected}
        link={item}
        onDelete={() => onDeleteTrigger(dialogId, item.index)}
        onSelect={() => onSelect(dialogId, createSelectedPath(item.index))}
      />
    );
  }

  const onRenderShowAll = () => {
    return null;
  };

  const onFilter = (_e?: any, newValue?: string): void => {
    if (typeof newValue === 'string') {
      delayedSetFilter(newValue);
    }
  };

  const handleResize: ResizeCallback = (_e, _dir, _ref, d) => {
    updateUserSettings({ dialogNavWidth: currentWidth + d.width });
  };

  const itemsAndGroups: { items: any[]; groups: IGroup[] } = createItemsAndGroups(sortedDialogs, dialogId, filter);

  return (
    <Resizable
      enable={{
        right: true,
      }}
      maxWidth={500}
      minWidth={180}
      size={{ width: currentWidth, height: 'auto' }}
      onResizeStop={handleResize}
    >
      <div
        aria-label={formatMessage('Navigation pane')}
        className="ProjectTree"
        css={root}
        data-testid="ProjectTree"
        role="region"
      >
        <FocusZone isCircularNavigation direction={FocusZoneDirection.vertical}>
          <SearchBox
            underlined
            ariaLabel={formatMessage('Type dialog name')}
            iconProps={{ iconName: 'Filter' }}
            placeholder={formatMessage('Filter Dialog')}
            styles={searchBox}
            onChange={onFilter}
          />
          <div
            aria-label={formatMessage(
              `{
            dialogNum, plural,
                =0 {No dialogs}
                =1 {One dialog}
              other {# dialogs}
            } have been found.
            {
              dialogNum, select,
                  0 {}
                other {Press down arrow key to navigate the search results}
            }`,
              { dialogNum: itemsAndGroups.groups.length }
            )}
            aria-live={'polite'}
          />
          <GroupedList
            {...itemsAndGroups}
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
            onRenderCell={onRenderCell}
          />
        </FocusZone>
      </div>
    </Resizable>
  );
};
