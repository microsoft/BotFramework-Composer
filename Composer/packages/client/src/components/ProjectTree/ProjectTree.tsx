// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import React, { useCallback, useState } from 'react';
import { jsx, css } from '@emotion/core';
import { SearchBox } from 'office-ui-fabric-react/lib/SearchBox';
import { FocusZone, FocusZoneDirection } from 'office-ui-fabric-react/lib/FocusZone';
import cloneDeep from 'lodash/cloneDeep';
import formatMessage from 'format-message';
import { DialogInfo, ITrigger } from '@bfc/shared';
import debounce from 'lodash/debounce';
import { useRecoilValue } from 'recoil';
import { ISearchBoxStyles } from 'office-ui-fabric-react/lib/SearchBox';

import { dispatcherState, currentProjectIdState } from '../../recoilModel';
import { botProjectSpaceSelector } from '../../recoilModel/selectors';
import { getFriendlyName } from '../../utils/dialogUtil';
import { containUnsupportedTriggers, triggerNotSupported } from '../../utils/dialogValidator';

import { TreeItem } from './treeItem';
import { ExpandableNode } from './ExpandableNode';

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
  box-sizing: border-box;
  overflow-y: auto;
  overflow-x: hidden;
  .ms-List-cell {
    min-height: 16px;
  }
  label: root;
`;

// -------------------- ProjectTree -------------------- //

const icons = {
  TRIGGER: 'LightningBolt',
  DIALOG: 'Org',
  BOT: 'CubeShape',
  EXTERNAL_SKILL: '',
  FORM_DIALOG: '',
  FORM_FIELD: '',
  FORM_ACTION: '',
  FILTER: 'FILTER',
};

export type TreeLink = {
  displayName: string;
  isRoot: boolean;
  warningContent?: string;
  errorContent?: string;
  projectId: string;
  skillId?: string;
  dialogName?: string;
  trigger?: number;
};

function isLinkEqual(link1: TreeLink | undefined, link2: TreeLink | undefined) {
  if (link1 === link2) return true;
  if (link1 == null) return false;
  if (link2 == null) return false;
  if (link1.projectId !== link2.projectId) return false;
  if (link1.skillId !== link2.skillId) return false;
  if (link1.dialogName !== link2.dialogName) return false;
  if (link1.trigger !== link2.trigger) return false;
  return true;
}

export type TreeMenuItem = {
  icon?: string;
  label: string; // leave this blank to place a separator
  action?: (link: TreeLink) => void;
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

const TYPE_TO_ICON_MAP = {
  'Microsoft.OnUnknownIntent': '',
};

type BotInProject = {
  dialogs: DialogInfo[];
  projectId: string;
  name: string;
  isRemote: boolean;
};

type IProjectTreeProps = {
  onSelect?: (link: TreeLink) => void;
  showTriggers?: boolean;
  showDialogs?: boolean;
  regionName: string;
  navLinks?: TreeLink[];
};

export const ProjectTree: React.FC<IProjectTreeProps> = ({ showTriggers = true, showDialogs = true }) => {
  const { onboardingAddCoachMarkRef, navTo } = useRecoilValue(dispatcherState);

  const [filter, setFilter] = useState('');
  const [selectedLink, setSelectedLink] = useState<TreeLink | undefined>();
  const delayedSetFilter = debounce((newValue) => setFilter(newValue), 1000);
  const addMainDialogRef = useCallback((mainDialog) => onboardingAddCoachMarkRef({ mainDialog }), []);
  const projectCollection = useRecoilValue<BotInProject[]>(botProjectSpaceSelector).map((bot) => ({
    ...bot,
    hasWarnings: false,
  }));
  const currentProjectId = useRecoilValue(currentProjectIdState);

  const botHasWarnings = (bot: BotInProject) => {
    return bot.dialogs.some((dialog) => dialog.triggers.some((tr) => triggerNotSupported(dialog, tr)));
  };

  const botHasErrors = (bot: BotInProject) => {
    // TODO: this is just a stub for now
    return false;
  };

  const handleOnSelect = (link: TreeLink) => {
    if (link.dialogName != null) {
      setSelectedLink(link);
      navTo(link.projectId, link.skillId, link.dialogName);
    }
  };

  const renderBotHeader = (bot: BotInProject) => {
    const link: TreeLink = {
      displayName: bot.name,
      projectId: currentProjectId,
      skillId: bot.projectId,
      isRoot: true,
      warningContent: botHasWarnings(bot) ? formatMessage('This bot has warnings') : undefined,
      errorContent: botHasErrors(bot) ? formatMessage('This bot has errors') : undefined,
    };

    return (
      <span
        key={bot.name}
        css={css`
          margin-top: -6px;
          width: 100%;
          label: bot-header;
        `}
        role="grid"
      >
        <TreeItem
          showProps
          icon={bot.isRemote ? icons.EXTERNAL_SKILL : icons.BOT}
          isSubItemActive={isLinkEqual(link, selectedLink)}
          link={link}
          menu={[{ label: formatMessage('Create/edit skill manifest'), action: () => {} }]}
          shiftOut={bot.isRemote ? 28 : 0}
        />
      </span>
    );
  };

  const renderDialogHeader = (botId: string, dialog: DialogInfo, warningContent: string) => {
    const link: TreeLink = {
      dialogName: dialog.id,
      displayName: dialog.displayName,
      isRoot: dialog.isRoot,
      projectId: currentProjectId,
      skillId: botId,
      warningContent,
    };
    return (
      <span
        key={dialog.id}
        ref={dialog.isRoot ? addMainDialogRef : null}
        css={css`
          margin-top: -6px;
          width: 100%;
          label: dialog-header;
        `}
        role="grid"
      >
        <TreeItem
          showProps
          icon={icons.DIALOG}
          isSubItemActive={isLinkEqual(link, selectedLink)}
          link={link}
          menu={[
            { icon: '', label: formatMessage('Add a trigger'), action: () => {} },
            { label: '' },
            { label: 'Remove this dialog', action: (link) => {} },
          ]}
          shiftOut={showTriggers ? 0 : 28}
          onSelect={handleOnSelect}
        />
      </span>
    );
  };

  function renderTrigger(projectId: string, item: any, dialog: DialogInfo): React.ReactNode {
    // NOTE: put the form-dialog detection here when it's ready
    const link: TreeLink = {
      displayName: item.displayName,
      warningContent: item.warningContent,
      errorContent: item.errorContent,
      trigger: item.index,
      dialogName: dialog.id,
      isRoot: false,
      projectId: currentProjectId,
      skillId: projectId,
    };

    return (
      <TreeItem
        key={`${item.id}_${item.index}`}
        dialogName={dialog.displayName}
        icon={TYPE_TO_ICON_MAP[item.type] || icons.TRIGGER}
        isActive={isLinkEqual(link, selectedLink)}
        link={link}
        menu={[{ label: formatMessage('Remove this trigger'), action: (link) => {} }]}
        shiftOut={48}
        onSelect={handleOnSelect}
      />
    );
  }

  const onFilter = (_e?: any, newValue?: string): void => {
    if (typeof newValue === 'string') {
      delayedSetFilter(newValue);
    }
  };

  function filterMatch(scope: string) {
    return scope.toLowerCase().includes(filter.toLowerCase());
  }

  function createDetailsTree(bot: BotInProject, startDepth: number) {
    const { projectId } = bot;
    const dialogs = sortDialog(bot.dialogs);

    const filteredDialogs =
      filter == null || filter.length === 0
        ? dialogs
        : dialogs.filter(
            (dialog) =>
              filterMatch(dialog.displayName) || dialog.triggers.some((trigger) => filterMatch(getTriggerName(trigger)))
          );

    if (showTriggers) {
      return filteredDialogs.map((dialog: DialogInfo) => {
        const triggerList = dialog.triggers
          .filter((tr) => filterMatch(dialog.displayName) || filterMatch(getTriggerName(tr)))
          .map((tr, index) => {
            const warningContent = triggerNotSupported(dialog, tr);
            return renderTrigger(projectId, { ...tr, index, displayName: getTriggerName(tr), warningContent }, dialog);
          });
        return (
          <ExpandableNode
            key={dialog.id}
            ref={dialog.isRoot ? addMainDialogRef : undefined}
            depth={startDepth}
            summary={renderDialogHeader(projectId, dialog, containUnsupportedTriggers(dialog))}
          >
            <div>{triggerList}</div>
          </ExpandableNode>
        );
      });
    } else {
      return filteredDialogs.map((dialog: DialogInfo) =>
        renderDialogHeader(projectId, dialog, containUnsupportedTriggers(dialog))
      );
    }
  }

  function createBotSubtree(bot: BotInProject & { hasWarnings: boolean }) {
    if (showDialogs && !bot.isRemote) {
      return (
        <ExpandableNode key={bot.projectId} summary={renderBotHeader(bot)}>
          <div>{createDetailsTree(bot, 1)}</div>
        </ExpandableNode>
      );
    } else {
      return renderBotHeader(bot);
    }
  }

  const projectTree =
    projectCollection.length === 1
      ? createDetailsTree(projectCollection[0], 0)
      : projectCollection.map(createBotSubtree);

  return (
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
          iconProps={{ iconName: icons.FILTER }}
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
  );
};
