// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import React, { useCallback, useState, Fragment } from 'react';
import { jsx, css } from '@emotion/core';
import { SearchBox } from 'office-ui-fabric-react/lib/SearchBox';
import { FocusZone, FocusZoneDirection } from 'office-ui-fabric-react/lib/FocusZone';
import cloneDeep from 'lodash/cloneDeep';
import formatMessage from 'format-message';
import { DialogInfo, ITrigger } from '@bfc/shared';
import { Resizable, ResizeCallback } from 're-resizable';
import debounce from 'lodash/debounce';
import { useRecoilValue } from 'recoil';
import { ISearchBoxStyles } from 'office-ui-fabric-react/lib/SearchBox';

import { dispatcherState, userSettingsState } from '../../recoilModel';
import { botProjectSpaceTreeSelector } from '../../recoilModel/selectors';
import { createSelectedPath, getFriendlyName } from '../../utils/dialogUtil';
import { containUnsupportedTriggers, triggerNotSupported } from '../../utils/dialogValidator';

import { TreeItem } from './treeItem';

// -------------------- Styles -------------------- //

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

const summaryStyle = css`
  display: flex;
  padding-left: 12px;
  padding-top: 12px;
`;

// -------------------- ProjectTree -------------------- //

export type TreeLink = {
  displayName: string;
  isRoot: boolean;
  warningContent?: string;
  projectId: string;
  dialogName?: string;
  trigger?: number;
};

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
  dialogId: string;
  selected: string;
  onSelect: (link: TreeLink) => void;
  onDelete: (link: TreeLink) => void;
}

const TYPE_TO_ICON_MAP = {
  'Microsoft.OnUnknownIntent': '',
};

type BotInProject = {
  dialogs: DialogInfo[];
  projectId: string;
  name: string;
};

export const ProjectTree: React.FC<IProjectTreeProps> = (props) => {
  const { onboardingAddCoachMarkRef, updateUserSettings } = useRecoilValue(dispatcherState);
  const { dialogNavWidth: currentWidth } = useRecoilValue(userSettingsState);

  const { selected, onSelect, onDelete } = props;
  const [filter, setFilter] = useState('');
  const delayedSetFilter = debounce((newValue) => setFilter(newValue), 1000);
  const addMainDialogRef = useCallback((mainDialog) => onboardingAddCoachMarkRef({ mainDialog }), []);
  const projectCollection = useRecoilValue<BotInProject[]>(botProjectSpaceTreeSelector);

  const renderBotHeader = (bot: BotInProject, hasWarnings: boolean) => {
    const link: TreeLink = {
      displayName: bot.name,
      projectId: bot.projectId,
      isRoot: true,
      warningContent: hasWarnings ? formatMessage('This bot has warnings') : undefined,
    };

    return (
      <span
        css={css`
          margin-top: -6px;
          width: 100%;
        `}
        role="grid"
      >
        <TreeItem showProps depth={0} icon={'ChatBot'} isSubItemActive={!!selected} link={link} onSelect={onSelect} />
      </span>
    );
  };

  const renderDialogHeader = (projectId: string, dialog: DialogInfo, warningContent: string) => {
    const link: TreeLink = {
      dialogName: dialog.id,
      displayName: dialog.displayName,
      isRoot: dialog.isRoot,
      projectId: projectId,
      warningContent,
    };
    return (
      <span
        ref={dialog.isRoot ? addMainDialogRef : null}
        css={css`
          margin-top: -6px;
          width: 100%;
        `}
        role="grid"
      >
        <TreeItem
          showProps
          depth={1}
          icon={'CannedChat'}
          isSubItemActive={!!selected}
          link={link}
          onDelete={onDelete}
          onSelect={onSelect}
        />
      </span>
    );
  };

  function renderTrigger(projectId: string, item: any, dialog: DialogInfo): React.ReactNode {
    const link: TreeLink = {
      displayName: item.displayName,
      warningContent: item.warningContent,
      trigger: item.index,
      dialogName: dialog.id,
      isRoot: false,
      projectId: projectId,
    };

    return (
      <TreeItem
        key={`${item.id}_${item.index}`}
        depth={2}
        dialogName={dialog.displayName}
        extraSpace={32}
        icon={TYPE_TO_ICON_MAP[item.type] || 'Flow'}
        isActive={dialog.id === props.dialogId && createSelectedPath(item.index) === selected}
        link={link}
        onDelete={onDelete}
        onSelect={onSelect}
      />
    );
  }

  const onFilter = (_e?: any, newValue?: string): void => {
    if (typeof newValue === 'string') {
      delayedSetFilter(newValue);
    }
  };

  const handleResize: ResizeCallback = (_e, _dir, _ref, d) => {
    updateUserSettings({ dialogNavWidth: currentWidth + d.width });
  };

  function filterMatch(scope: string) {
    return scope.toLowerCase().includes(filter.toLowerCase());
  }

  function createDetailsTree(bot: BotInProject) {
    const { projectId } = bot;
    const dialogs = sortDialog(bot.dialogs);

    const filteredDialogs =
      filter == null || filter.length === 0
        ? dialogs
        : dialogs.filter(
            (dialog) =>
              filterMatch(dialog.displayName) || dialog.triggers.some((trigger) => filterMatch(getTriggerName(trigger)))
          );

    return filteredDialogs.map((dialog: DialogInfo) => {
      const triggerList = dialog.triggers
        .filter((tr) => filterMatch(dialog.displayName) || filterMatch(getTriggerName(tr)))
        .map((tr, index) =>
          renderTrigger(
            projectId,
            { ...tr, index, displayName: getTriggerName(tr), warningContent: triggerNotSupported(dialog, tr) },
            dialog
          )
        );
      return (
        <details key={dialog.id} ref={dialog.isRoot ? addMainDialogRef : undefined}>
          <summary css={summaryStyle}>
            {renderDialogHeader(projectId, dialog, containUnsupportedTriggers(dialog))}
          </summary>
          {triggerList}
        </details>
      );
    });
  }

  function createBotSubtree(bot: BotInProject) {
    return (
      <details key={bot.projectId}>
        <summary css={summaryStyle}>{renderBotHeader(bot, false)}</summary>
        {createDetailsTree(bot)}
      </details>
    );
  }

  const projectTree =
    projectCollection.length === 1 ? createDetailsTree(projectCollection[0]) : projectCollection.map(createBotSubtree);

  return (
    <Fragment>
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
                =0 {No bots}
                =1 {One bot}
              other {# bots}
            } have been found.
            {
              dialogNum, select,
                  0 {}
                other {Press down arrow key to navigate the search results}
            }`,
                { dialogNum: projectCollection.length }
              )}
              aria-live={'polite'}
            />
            {projectTree}
          </FocusZone>
        </div>
      </Resizable>
    </Fragment>
  );
};
