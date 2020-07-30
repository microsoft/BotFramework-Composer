// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import React, { useCallback, useMemo, useState } from 'react';
import { jsx, css } from '@emotion/core';
import { IGroupHeaderProps } from 'office-ui-fabric-react/lib/GroupedList';
import { SearchBox } from 'office-ui-fabric-react/lib/SearchBox';
import { FocusZone, FocusZoneDirection } from 'office-ui-fabric-react/lib/FocusZone';
import cloneDeep from 'lodash/cloneDeep';
import formatMessage from 'format-message';
import { DialogInfo, ITrigger } from '@bfc/shared';
import { Resizable, ResizeCallback } from 're-resizable';
import debounce from 'lodash/debounce';
import { useRecoilValue } from 'recoil';
import { IGroupedListStyles } from 'office-ui-fabric-react/lib/GroupedList';
import { ISearchBoxStyles } from 'office-ui-fabric-react/lib/SearchBox';

import { dispatcherState, userSettingsState } from '../../recoilModel';
import { createSelectedPath, getFriendlyName } from '../../utils/dialogUtil';

import { TreeItem } from './treeItem';

// -------------------- Styles -------------------- //

const groupListStyle: Partial<IGroupedListStyles> = {
  root: {
    width: '100%',
    boxSizing: 'border-box',
  },
};

const searchBox: ISearchBoxStyles = {
  root: {
    borderBottom: '1px solid #edebe9',
    height: '45px',
    borderRadius: '0px',
  },
};

const root = css`
  width: 100%;
  height: 100%;
  border-right: 1px solid #c4c4c4;
  box-sizing: border-box;
  overflow-y: auto;
  overflow-x: hidden;
  .ms-List-cell {
    min-height: 24px;
  }
`;

// -------------------- ProjectTree -------------------- //

function createGroupItem(dialog: DialogInfo, position: number) {
  return {
    key: dialog.id,
    name: dialog.displayName,
    level: 1,
    startIndex: position,
    count: dialog.triggers.length,
    hasMoreData: true,
    isCollapsed: false,
    data: dialog,
  };
}

function getTriggerName(trigger: ITrigger) {
  return trigger.displayName || getFriendlyName({ $kind: trigger.type });
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

interface IProjectTreeProps {
  dialogs: DialogInfo[];
  dialogId: string;
  selected: string;
  onSelect: (id: string, selected?: string) => void;
  onDeleteTrigger: (id: string, index: number) => void;
  onDeleteDialog: (id: string) => void;
}

const TYPE_TO_ICON_MAP = {
  'Microsoft.OnUnknownIntent': '',
};

export const ProjectTree: React.FC<IProjectTreeProps> = (props) => {
  const { onboardingAddCoachMarkRef, updateUserSettings } = useRecoilValue(dispatcherState);
  const { dialogNavWidth: currentWidth } = useRecoilValue(userSettingsState);

  const { dialogs, dialogId, selected, onSelect, onDeleteTrigger, onDeleteDialog } = props;
  const [filter, setFilter] = useState('');
  const delayedSetFilter = debounce((newValue) => setFilter(newValue), 1000);
  const addMainDialogRef = useCallback((mainDialog) => onboardingAddCoachMarkRef({ mainDialog }), []);

  const sortedDialogs = useMemo(() => {
    return sortDialog(dialogs);
  }, [dialogs]);

  const onRenderHeader = (props: IGroupHeaderProps) => {
    const toggleCollapse = () => {
      if (props.group != null) {
        props.onToggleCollapse?.(props.group);
        onSelect(props.group.key);
      }
    };
    const level = props.group?.level;
    return (
      <span ref={props.group?.data.isRoot && addMainDialogRef} role="grid">
        <TreeItem
          depth={level ?? 0}
          icon={level === 1 ? 'CannedChat' : undefined}
          isSubItemActive={!!selected}
          link={props.group?.data}
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
        icon={TYPE_TO_ICON_MAP[item.type] || 'Flow'}
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

  function createDetailsTree(dialogs: DialogInfo[], filter: string) {
    const filteredDialogs =
      filter == null || filter.length === 0
        ? dialogs
        : dialogs.filter((dialog) => {
            dialog.displayName.includes(filter) ||
              dialog.triggers.some((trigger) => trigger.displayName.includes(filter));
          });

    return dialogs.map((dialog) => {
      const triggerList = dialog.triggers.map((tr) => <li key={tr.id}>{getTriggerName(tr)}</li>);
      return (
        <details key={dialog.id}>
          <summary>{dialog.displayName}</summary>
          <div>
            <ul>{triggerList}</ul>
          </div>
        </details>
      );
    });
  }

  const detailsTree = createDetailsTree(sortedDialogs, filter);

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
              { dialogNum: dialogs.length }
            )}
            aria-live={'polite'}
          />
          {detailsTree}
        </FocusZone>
      </div>
    </Resizable>
  );
};
