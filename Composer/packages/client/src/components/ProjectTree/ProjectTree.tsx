// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import React, { useCallback, useState } from 'react';
import { jsx, css } from '@emotion/core';
import { SearchBox } from 'office-ui-fabric-react/lib/SearchBox';
import { FocusZone, FocusZoneDirection } from 'office-ui-fabric-react/lib/FocusZone';
import cloneDeep from 'lodash/cloneDeep';
import formatMessage from 'format-message';
import { DialogInfo, ITrigger, Diagnostic, DiagnosticSeverity } from '@bfc/shared';
import debounce from 'lodash/debounce';
import { useRecoilValue } from 'recoil';
import { ISearchBoxStyles } from 'office-ui-fabric-react/lib/SearchBox';
import isEqual from 'lodash/isEqual';
import { extractSchemaProperties, groupTriggersByPropertyReference } from '@bfc/indexers';

import {
  dispatcherState,
  currentProjectIdState,
  botProjectSpaceSelector,
  jsonSchemaFilesByProjectIdSelector,
} from '../../recoilModel';
import { getFriendlyName } from '../../utils/dialogUtil';
import { triggerNotSupported } from '../../utils/dialogValidator';

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
    min-height: 36px;
  }
`;

const icons = {
  TRIGGER: 'LightningBolt',
  DIALOG: 'Org',
  BOT: 'CubeShape',
  EXTERNAL_SKILL: 'Globe',
  FORM_DIALOG: 'Table',
  FORM_FIELD: 'Variable2', // x in parentheses
  FORM_TRIGGER: 'TriggerAuto', // lightning bolt with gear
  FILTER: 'Filter',
};

const tree = css`
  height: 100%;
  overflow-x: hidden;
  overflow-y: auto;
  height: 100%;
  label: tree;
`;

const SUMMARY_ARROW_SPACE = 28; // the rough pixel size of the dropdown arrow to the left of a Details/Summary element

// -------------------- ProjectTree -------------------- //

export type TreeLink = {
  displayName: string;
  isRoot: boolean;
  isBroken?: boolean;
  diagnostics: Diagnostic[];
  projectId: string;
  skillId: string | null;
  dialogName?: string;
  trigger?: number;
};

export type TreeMenuItem = {
  icon?: string;
  label: string; // leave this blank to place a separator
  onClick?: (link: TreeLink) => void;
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

type BotInProject = {
  dialogs: DialogInfo[];
  projectId: string;
  name: string;
  isRemote: boolean;
  isRootBot: boolean;
  diagnostics: Diagnostic[];
  error?: any;
};

type Props = {
  onSelect?: (link: TreeLink) => void;
  onSelectAllLink?: () => void;
  showTriggers?: boolean;
  showDialogs?: boolean;
  navLinks?: TreeLink[];
  onDeleteTrigger: (id: string, index: number) => void;
  onDeleteDialog: (id: string) => void;
};

export const ProjectTree: React.FC<Props> = ({
  onSelectAllLink: onAllSelected = undefined,
  showTriggers = true,
  showDialogs = true,
  onDeleteDialog,
  onDeleteTrigger,
  onSelect,
}) => {
  const { onboardingAddCoachMarkRef, selectTo, navTo, navigateToFormDialogSchema } = useRecoilValue(dispatcherState);

  const [filter, setFilter] = useState('');
  const [selectedLink, setSelectedLink] = useState<TreeLink | undefined>();
  const delayedSetFilter = debounce((newValue) => setFilter(newValue), 1000);
  const addMainDialogRef = useCallback((mainDialog) => onboardingAddCoachMarkRef({ mainDialog }), []);
  const projectCollection = useRecoilValue<BotInProject[]>(botProjectSpaceSelector).map((bot) => ({
    ...bot,
    hasWarnings: false,
  }));
  const currentProjectId = useRecoilValue(currentProjectIdState);
  const botProjectSpace = useRecoilValue(botProjectSpaceSelector);

  const jsonSchemaFilesByProjectId = useRecoilValue(jsonSchemaFilesByProjectIdSelector);

  const notificationMap: { [projectId: string]: { [dialogId: string]: Diagnostic[] } } = {};

  for (const bot of projectCollection) {
    notificationMap[bot.projectId] = {};

    const matchingBot = botProjectSpace?.filter((project) => project.projectId === bot.projectId)[0];
    if (matchingBot == null) continue;

    for (const dialog of matchingBot.dialogs) {
      const dialogId = dialog.id;
      notificationMap[bot.projectId][dialogId] = dialog.diagnostics;
    }
  }

  const dialogIsFormDialog = (dialog: DialogInfo) => {
    return process.env.COMPOSER_ENABLE_FORMS && dialog.content?.schema !== undefined;
  };

  const formDialogSchemaExists = (projectId: string, dialog: DialogInfo) => {
    return (
      dialogIsFormDialog(dialog) &&
      !!botProjectSpace?.find((s) => s.projectId === projectId)?.formDialogSchemas.find((fd) => fd.id === dialog.id)
    );
  };

  const handleOnSelect = (link: TreeLink) => {
    setSelectedLink(link);
    onSelect?.(link); // if we've defined a custom onSelect, use it
    if (link.dialogName != null) {
      if (link.trigger != null) {
        selectTo(link.projectId, link.skillId, link.dialogName, `triggers[${link.trigger}]`);
      } else {
        navTo(link.projectId, link.skillId, link.dialogName);
      }
    }
  };

  const renderBotHeader = (bot: BotInProject) => {
    const link: TreeLink = {
      displayName: bot.name,
      projectId: currentProjectId,
      skillId: bot.projectId,
      isRoot: true,
      isBroken: !!bot.error,
      diagnostics: bot.diagnostics,
    };
    const menu = [
      {
        label: formatMessage('Add a dialog'),
        icon: 'Add',
        onClick: () => {},
      },
      {
        label: formatMessage('Start bot'),
        icon: 'TriangleSolidRight12',
        onClick: () => {},
      },
      {
        label: '',
        onClick: () => {},
      },
      {
        label: formatMessage('Create/edit skill manifest'),
        onClick: () => {},
      },
      {
        label: formatMessage('Export this bot as .zip'),
        onClick: () => {},
      },
      {
        label: formatMessage('Settings'),
        onClick: () => {},
      },
    ];

    if (!bot.isRootBot) {
      menu.splice(3, 0, {
        label: formatMessage('Remove this skill from project'),
        onClick: () => {},
      });
    }

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
          forceIndent={bot.isRemote ? SUMMARY_ARROW_SPACE : 0}
          icon={bot.isRemote ? icons.EXTERNAL_SKILL : icons.BOT}
          isSubItemActive={isEqual(link, selectedLink)}
          link={link}
          menu={menu}
          onSelect={handleOnSelect}
        />
      </span>
    );
  };

  const renderDialogHeader = (skillId: string, dialog: DialogInfo) => {
    const diagnostics: Diagnostic[] = notificationMap[currentProjectId][dialog.id];
    const link: TreeLink = {
      dialogName: dialog.id,
      displayName: dialog.displayName,
      isRoot: dialog.isRoot,
      projectId: currentProjectId,
      skillId: null,
      diagnostics,
    };
    const menu: any[] = [
      {
        label: formatMessage('Add a trigger'),
        icon: 'Add',
        onClick: () => {},
      },
      {
        label: '',
        onClick: () => {},
      },
      {
        label: formatMessage('Remove this dialog'),
        onClick: (link) => {
          onDeleteDialog(link.dialogName ?? '');
        },
      },
    ];

    const isFormDialog = dialogIsFormDialog(dialog);
    const showEditSchema = formDialogSchemaExists(skillId, dialog);

    if (showEditSchema) {
      menu.push({
        label: formatMessage('Edit schema'),
        icon: 'Edit',
        onClick: (link) => navigateToFormDialogSchema({ projectId: link.skillId, schemaId: link.dialogName }),
      });
    }
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
          forceIndent={showTriggers ? 0 : SUMMARY_ARROW_SPACE}
          icon={isFormDialog ? icons.FORM_DIALOG : icons.DIALOG}
          isSubItemActive={isEqual(link, selectedLink)}
          link={link}
          menu={menu}
          onSelect={handleOnSelect}
        />
      </span>
    );
  };

  const renderTrigger = (item: any, dialog: DialogInfo, projectId: string): React.ReactNode => {
    // NOTE: put the form-dialog detection here when it's ready
    const link: TreeLink = {
      displayName: item.displayName,
      diagnostics: [],
      trigger: item.index,
      dialogName: dialog.id,
      isRoot: false,
      projectId,
      skillId: null,
    };

    return (
      <TreeItem
        key={`${item.id}_${item.index}`}
        dialogName={dialog.displayName}
        forceIndent={48}
        icon={icons.TRIGGER}
        isActive={isEqual(link, selectedLink)}
        link={link}
        menu={[
          {
            label: formatMessage('Remove this trigger'),
            onClick: (link) => {
              onDeleteTrigger(link.dialogName ?? '', link.trigger ?? 0);
            },
          },
        ]}
        onSelect={handleOnSelect}
      />
    );
  };

  const onFilter = (_e?: any, newValue?: string): void => {
    if (typeof newValue === 'string') {
      delayedSetFilter(newValue);
    }
  };

  const filterMatch = (scope: string): boolean => {
    return scope.toLowerCase().includes(filter.toLowerCase());
  };

  const renderTriggerList = (triggers: ITrigger[], dialog: DialogInfo, projectId: string) => {
    return triggers
      .filter((tr) => filterMatch(dialog.displayName) || filterMatch(getTriggerName(tr)))
      .map((tr, index) => {
        const warningContent = triggerNotSupported(dialog, tr);
        const errorContent = notificationMap[projectId][dialog.id].some(
          (diag) => diag.severity === DiagnosticSeverity.Error && diag.path?.match(RegExp(`triggers\\[${index}\\]`))
        );
        return renderTrigger(
          { ...tr, index, displayName: getTriggerName(tr), warningContent, errorContent },
          dialog,
          projectId
        );
      });
  };

  const renderTriggerGroupHeader = (groupName: string, dialog: DialogInfo, projectId: string) => {
    const link: TreeLink = {
      dialogName: dialog.id,
      displayName: groupName,
      isRoot: false,
      diagnostics: [],
      projectId: projectId,
      skillId: null,
    };
    return (
      <span
        css={css`
          margin-top: -6px;
          width: 100%;
          label: trigger-group-header;
        `}
        role="grid"
      >
        <TreeItem showProps forceIndent={0} isSubItemActive={false} link={link} />
      </span>
    );
  };

  // renders a named expandible node with the triggers as items underneath
  const renderTriggerGroup = (
    projectId: string,
    dialog: DialogInfo,
    groupName: string,
    triggers: ITrigger[],
    startDepth: number
  ) => {
    const key = `${projectId}.${dialog.id}.group-${groupName}`;

    return (
      <ExpandableNode key={key} depth={startDepth} summary={renderTriggerGroupHeader(groupName, dialog, projectId)}>
        <div>{renderTriggerList(triggers, dialog, projectId)}</div>
      </ExpandableNode>
    );
  };

  // renders triggers grouped by the schema property they are associated with.
  const renderDialogTriggersByProperty = (dialog: DialogInfo, projectId: string, startDepth: number) => {
    const jsonSchemaFiles = jsonSchemaFilesByProjectId[projectId];
    const dialogSchemaProperties = extractSchemaProperties(dialog, jsonSchemaFiles);
    const groupedTriggers = groupTriggersByPropertyReference(dialog, { validProperties: dialogSchemaProperties });

    const triggerGroups = Object.keys(groupedTriggers);

    return triggerGroups.map((triggerGroup) => {
      return renderTriggerGroup(projectId, dialog, triggerGroup, groupedTriggers[triggerGroup], startDepth);
    });
  };

  const renderDialogTriggers = (dialog: DialogInfo, projectId: string, startDepth: number) => {
    return dialogIsFormDialog(dialog)
      ? renderDialogTriggersByProperty(dialog, projectId, startDepth)
      : renderTriggerList(dialog.triggers, dialog, projectId);
  };

  const createDetailsTree = (bot: BotInProject, startDepth: number) => {
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
        return (
          <ExpandableNode
            key={dialog.id}
            depth={startDepth}
            detailsRef={dialog.isRoot ? addMainDialogRef : undefined}
            summary={renderDialogHeader(projectId, dialog)}
          >
            <div>{renderDialogTriggers(dialog, projectId, startDepth + 1)}</div>
          </ExpandableNode>
        );
      });
    } else {
      return filteredDialogs.map((dialog: DialogInfo) => renderDialogHeader(projectId, dialog));
    }
  };

  const createBotSubtree = (bot: BotInProject & { hasWarnings: boolean }) => {
    if (showDialogs && !bot.isRemote) {
      return (
        <ExpandableNode key={bot.projectId} summary={renderBotHeader(bot)}>
          <div>{createDetailsTree(bot, 1)}</div>
        </ExpandableNode>
      );
    } else {
      return renderBotHeader(bot);
    }
  };

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
        <div css={tree}>
          {onAllSelected != null ? (
            <TreeItem
              forceIndent={SUMMARY_ARROW_SPACE}
              link={{
                displayName: formatMessage('All'),
                skillId: null,
                projectId: currentProjectId,
                isRoot: true,
                diagnostics: [],
              }}
              onSelect={onAllSelected}
            />
          ) : null}
          {projectTree}
        </div>
      </FocusZone>
    </div>
  );
};
