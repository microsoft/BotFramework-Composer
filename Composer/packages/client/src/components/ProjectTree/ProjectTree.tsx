// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import React, { useCallback, useState, useEffect, useRef } from 'react';
import { jsx, css } from '@emotion/core';
import { SearchBox } from 'office-ui-fabric-react/lib/SearchBox';
import { FocusZone, FocusZoneDirection } from 'office-ui-fabric-react/lib/FocusZone';
import cloneDeep from 'lodash/cloneDeep';
import formatMessage from 'format-message';
import { DialogInfo, ITrigger, Diagnostic, DiagnosticSeverity } from '@bfc/shared';
import throttle from 'lodash/throttle';
import { useRecoilValue } from 'recoil';
import { ISearchBoxStyles } from 'office-ui-fabric-react/lib/SearchBox';
import { extractSchemaProperties, groupTriggersByPropertyReference, NoGroupingTriggerGroupName } from '@bfc/indexers';
import isEqual from 'lodash/isEqual';

import {
  dispatcherState,
  rootBotProjectIdSelector,
  botProjectSpaceSelector,
  jsonSchemaFilesByProjectIdSelector,
  pageElementState,
} from '../../recoilModel';
import { getFriendlyName } from '../../utils/dialogUtil';
import { triggerNotSupported } from '../../utils/dialogValidator';
import { navigateTo } from '../../utils/navigation';
import { BotStatus } from '../../constants';
import { useFeatureFlag } from '../../utils/hooks';
import { LoadingSpinner } from '../LoadingSpinner';

import { TreeItem } from './treeItem';
import { ExpandableNode } from './ExpandableNode';
import { INDENT_PER_LEVEL } from './constants';
import { ProjectTreeHeader, ProjectTreeHeaderMenuItem } from './ProjectTreeHeader';

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
  label: tree;
`;

// -------------------- Helper functions -------------------- //

const getTriggerIndex = (trigger: ITrigger, dialog: DialogInfo): number => {
  return dialog.triggers.indexOf(trigger);
};

// sort trigger groups so that NoGroupingTriggerGroupName is last
const sortTriggerGroups = (x: string, y: string): number => {
  if (x === NoGroupingTriggerGroupName && y !== NoGroupingTriggerGroupName) {
    return 1;
  } else if (y === NoGroupingTriggerGroupName && x !== NoGroupingTriggerGroupName) {
    return -1;
  }

  return x.localeCompare(y);
};

// -------------------- ProjectTree -------------------- //

export type TreeLink = {
  displayName: string;
  isRoot: boolean;
  bot?: BotInProject;
  diagnostics: Diagnostic[];
  projectId: string;
  skillId?: string;
  dialogId?: string;
  trigger?: number;
  parentLink?: TreeLink;
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
  error: { [key: string]: any };
  buildEssentials: { [key: string]: any };
  isPvaSchema: boolean;
};

type Props = {
  navLinks?: TreeLink[];
  headerMenu?: ProjectTreeHeaderMenuItem[];
  onSelect?: (link: TreeLink) => void;
  onBotDeleteDialog?: (projectId: string, dialogId: string) => void;
  onBotCreateDialog?: (projectId: string) => void;
  onBotStart?: (projectId: string) => void;
  onBotStop?: (projectId: string) => void;
  onBotEditManifest?: (projectId: string) => void;
  onBotExportZip?: (projectId: string) => void;
  onBotRemoveSkill?: (skillId: string) => void;
  onDialogCreateTrigger?: (projectId: string, dialogId: string) => void;
  onDialogDeleteTrigger?: (projectId: string, dialogId: string, index: number) => void;
  defaultSelected?: Partial<TreeLink>;
  options?: {
    showTriggers?: boolean;
    showDialogs?: boolean;
    showDelete?: boolean;
    showRemote?: boolean;
    showMenu?: boolean;
    showQnAMenu?: boolean;
    showErrors?: boolean;
  };
};

const TREE_PADDING = 100; // the horizontal space taken up by stuff in the tree other than text or indentation
const LEVEL_PADDING = 44; // the size of a reveal-triangle and the space around it

export const ProjectTree: React.FC<Props> = ({
  headerMenu = [],
  onBotDeleteDialog = () => {},
  onDialogDeleteTrigger = () => {},
  onSelect,
  onBotCreateDialog = () => {},
  onBotStart = () => {},
  onBotStop = () => {},
  onBotEditManifest = () => {},
  onBotExportZip = () => {},
  onBotRemoveSkill = () => {},
  onDialogCreateTrigger = () => {},
  defaultSelected,
  options = {
    showDelete: true,
    showDialogs: true,
    showTriggers: true,
    showRemote: true,
    showMenu: true,
    showQnAMenu: true,
    showErrors: true,
  },
}) => {
  const {
    onboardingAddCoachMarkRef,
    navigateToFormDialogSchema,
    setPageElementState,
    createQnAFromUrlDialogBegin,
  } = useRecoilValue(dispatcherState);
  const treeRef = useRef<HTMLDivElement>(null);

  const pageElements = useRecoilValue(pageElementState).dialogs;
  const leftSplitWidth = pageElements?.leftSplitWidth ?? treeRef?.current?.clientWidth ?? 0;
  const getPageElement = (name: string) => pageElements?.[name];
  const setPageElement = (name: string, value: any) =>
    setPageElementState('dialogs', { ...pageElements, [name]: value });

  const [filter, setFilter] = useState('');
  const [isMenuOpen, setMenuOpen] = useState<boolean>(false);
  const formDialogComposerFeatureEnabled = useFeatureFlag('FORM_DIALOG');
  const [selectedLink, setSelectedLink] = useState<Partial<TreeLink> | undefined>(defaultSelected);
  const delayedSetFilter = throttle((newValue) => setFilter(newValue), 200);
  const addMainDialogRef = useCallback((mainDialog) => onboardingAddCoachMarkRef({ mainDialog }), []);
  const projectCollection = useRecoilValue<BotInProject[]>(botProjectSpaceSelector).map((bot) => ({
    ...bot,
    hasWarnings: false,
  }));

  useEffect(() => {
    setSelectedLink(defaultSelected);
  }, [defaultSelected]);

  const rootProjectId = useRecoilValue(rootBotProjectIdSelector);
  const botProjectSpace = useRecoilValue(botProjectSpaceSelector);

  const jsonSchemaFilesByProjectId = useRecoilValue(jsonSchemaFilesByProjectIdSelector);

  if (rootProjectId == null) {
    // this should only happen before a project is loaded in, so it won't last very long
    return <LoadingSpinner />;
  }

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
    return formDialogComposerFeatureEnabled && dialog.content?.schema !== undefined;
  };

  const formDialogSchemaExists = (projectId: string, dialog: DialogInfo) => {
    return (
      dialogIsFormDialog(dialog) &&
      !!botProjectSpace?.find((s) => s.projectId === projectId)?.formDialogSchemas.find((fd) => fd.id === dialog.id)
    );
  };

  const doesLinkMatch = (linkInTree?: Partial<TreeLink>, selectedLink?: Partial<TreeLink>) => {
    if (linkInTree == null || selectedLink == null) return false;
    return (
      linkInTree.skillId === selectedLink.skillId &&
      linkInTree.dialogId === selectedLink.dialogId &&
      linkInTree.trigger === selectedLink.trigger
    );
  };

  const handleOnSelect = (link: TreeLink) => {
    // Skip state change when link not changed.
    if (isEqual(link, selectedLink)) return;

    setSelectedLink(link);
    onSelect?.(link);
  };

  const renderBotHeader = (bot: BotInProject) => {
    const link: TreeLink = {
      displayName: bot.name,
      projectId: rootProjectId,
      skillId: rootProjectId === bot.projectId ? undefined : bot.projectId,
      isRoot: true,
      bot,
      diagnostics: bot.diagnostics,
    };
    const isRunning = bot.buildEssentials.status === BotStatus.connected;

    const menu = options.showMenu
      ? [
          {
            label: formatMessage('Add a dialog'),
            icon: 'Add',
            onClick: () => {
              onBotCreateDialog(bot.projectId);
            },
          },
          {
            label: isRunning ? formatMessage('Stop bot') : formatMessage('Start bot'),
            icon: isRunning ? 'CircleStopSolid' : 'TriangleSolidRight12',
            onClick: () => {
              isRunning ? onBotStop(bot.projectId) : onBotStart(bot.projectId);
            },
          },
          {
            label: '',
            onClick: () => {},
          },
          {
            label: formatMessage('Export this bot as .zip'),
            onClick: () => {
              onBotExportZip(bot.projectId);
            },
          },
          {
            label: formatMessage('Settings'),
            onClick: () => {
              navigateTo('/settings');
            },
          },
        ]
      : [];

    if (!bot.isRootBot && options.showMenu) {
      menu.splice(
        3,
        0,
        {
          label: formatMessage('Create/edit skill manifest'),
          onClick: () => {
            onBotEditManifest(bot.projectId);
          },
        },
        {
          label: formatMessage('Remove this skill from project'),
          onClick: () => {
            onBotRemoveSkill(bot.projectId);
          },
        }
      );
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
          hasChildren={!bot.isRemote}
          icon={bot.isRemote ? icons.EXTERNAL_SKILL : icons.BOT}
          isActive={doesLinkMatch(link, selectedLink)}
          isMenuOpen={isMenuOpen}
          link={link}
          menu={menu}
          menuOpenCallback={setMenuOpen}
          showErrors={options.showErrors}
          textWidth={leftSplitWidth - TREE_PADDING}
          onSelect={handleOnSelect}
        />
      </span>
    );
  };

  const renderDialogHeader = (skillId: string, dialog: DialogInfo, depth: number, isPvaSchema: boolean) => {
    const diagnostics: Diagnostic[] = notificationMap[skillId][dialog.id];
    const dialogLink: TreeLink = {
      dialogId: dialog.id,
      displayName: dialog.displayName,
      isRoot: dialog.isRoot,
      diagnostics,
      projectId: rootProjectId,
      skillId: skillId === rootProjectId ? undefined : skillId,
    };
    const menu: any[] = options.showMenu
      ? [
          {
            label: formatMessage('Add a trigger'),
            icon: 'Add',
            onClick: () => {
              onDialogCreateTrigger(skillId, dialog.id);
            },
          },
          {
            label: '',
            onClick: () => {},
          },
        ]
      : [];

    if (!isPvaSchema) {
      menu.splice(1, 0, {
        label: formatMessage('Add new knowledge base'),
        icon: 'Add',
        onClick: () => {
          createQnAFromUrlDialogBegin({ projectId: skillId, dialogId: dialog.id });
        },
      });
    }

    const isFormDialog = dialogIsFormDialog(dialog);
    const showEditSchema = formDialogSchemaExists(skillId, dialog);

    if (!dialog.isRoot && options.showDelete) {
      menu.push({
        label: formatMessage('Remove this dialog'),
        onClick: () => {
          onBotDeleteDialog?.(skillId, dialog.id);
        },
      });
    }

    if (showEditSchema) {
      menu.push({
        label: formatMessage('Edit schema'),
        icon: 'Edit',
        onClick: (link) => navigateToFormDialogSchema({ projectId: link.skillId, schemaId: link.dialogName }),
      });
    }

    return {
      summaryElement: (
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
            hasChildren
            icon={isFormDialog ? icons.FORM_DIALOG : icons.DIALOG}
            isActive={doesLinkMatch(dialogLink, selectedLink)}
            isMenuOpen={isMenuOpen}
            link={dialogLink}
            menu={menu}
            menuOpenCallback={setMenuOpen}
            padLeft={depth * LEVEL_PADDING}
            showErrors={options.showErrors}
            textWidth={leftSplitWidth - TREE_PADDING}
            onSelect={handleOnSelect}
          />
        </span>
      ),
      dialogLink,
    };
  };

  const renderTrigger = (item: any, dialog: DialogInfo, projectId: string, dialogLink: TreeLink): React.ReactNode => {
    const skillId = projectId === rootProjectId ? undefined : projectId;
    const diagnostics = notificationMap[skillId ?? projectId][dialog.id];
    const link: TreeLink = {
      projectId: rootProjectId,
      skillId,
      dialogId: dialog.id,
      trigger: item.index,
      displayName: item.displayName,
      diagnostics,
      isRoot: false,
      parentLink: dialogLink,
    };

    return (
      <TreeItem
        key={`${item.id}_${item.index}`}
        dialogName={dialog.displayName}
        extraSpace={INDENT_PER_LEVEL}
        icon={icons.TRIGGER}
        isActive={doesLinkMatch(link, selectedLink)}
        isMenuOpen={isMenuOpen}
        link={link}
        menu={
          options.showDelete
            ? [
                {
                  label: formatMessage('Remove this trigger'),
                  icon: 'Delete',
                  onClick: (link) => {
                    onDialogDeleteTrigger?.(projectId, link.dialogId ?? '', link.trigger ?? 0);
                  },
                },
              ]
            : []
        }
        menuOpenCallback={setMenuOpen}
        showErrors={options.showErrors}
        textWidth={leftSplitWidth - TREE_PADDING}
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

  const renderTriggerList = (triggers: ITrigger[], dialog: DialogInfo, projectId: string, dialogLink: TreeLink) => {
    return triggers
      .filter((tr) => filterMatch(dialog.displayName) || filterMatch(getTriggerName(tr)))
      .map((tr) => {
        const index = getTriggerIndex(tr, dialog);
        const warningContent = triggerNotSupported(dialog, tr);
        const errorContent = notificationMap[projectId][dialog.id].some(
          (diag) => diag.severity === DiagnosticSeverity.Error && diag.path?.match(RegExp(`triggers\\[${index}\\]`))
        );
        return renderTrigger(
          { ...tr, index, displayName: getTriggerName(tr), warningContent, errorContent },
          dialog,
          projectId,
          dialogLink
        );
      });
  };

  const renderTriggerGroupHeader = (displayName: string, dialog: DialogInfo, projectId: string) => {
    const link: TreeLink = {
      dialogId: dialog.id,
      displayName,
      isRoot: false,
      diagnostics: [],
      projectId,
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
        <TreeItem
          isMenuOpen={isMenuOpen}
          isSubItemActive={false}
          link={link}
          menuOpenCallback={setMenuOpen}
          showErrors={options.showErrors}
          textWidth={leftSplitWidth - TREE_PADDING}
        />
      </span>
    );
  };

  // renders a named expandable node with the triggers as items underneath
  const renderTriggerGroup = (
    projectId: string,
    dialog: DialogInfo,
    groupName: string,
    triggers: ITrigger[],
    startDepth: number
  ) => {
    const groupDisplayName =
      groupName === NoGroupingTriggerGroupName ? formatMessage('form-wide operations') : groupName;
    const key = `${projectId}.${dialog.id}.group-${groupName}`;
    const link: TreeLink = {
      dialogId: dialog.id,
      displayName: groupName,
      isRoot: false,
      projectId,
      diagnostics: [],
    };

    return (
      <ExpandableNode
        key={key}
        depth={startDepth}
        summary={renderTriggerGroupHeader(groupDisplayName, dialog, projectId)}
        onToggle={(newState) => setPageElement(key, newState)}
      >
        <div>{renderTriggerList(triggers, dialog, projectId, link)}</div>
      </ExpandableNode>
    );
  };

  // renders triggers grouped by the schema property they are associated with.
  const renderDialogTriggersByProperty = (dialog: DialogInfo, projectId: string, startDepth: number) => {
    const jsonSchemaFiles = jsonSchemaFilesByProjectId[projectId];
    const dialogSchemaProperties = extractSchemaProperties(dialog, jsonSchemaFiles);
    const groupedTriggers = groupTriggersByPropertyReference(dialog, { validProperties: dialogSchemaProperties });

    const triggerGroups = Object.keys(groupedTriggers);

    return triggerGroups.sort(sortTriggerGroups).map((triggerGroup) => {
      return renderTriggerGroup(projectId, dialog, triggerGroup, groupedTriggers[triggerGroup], startDepth);
    });
  };

  const renderDialogTriggers = (dialog: DialogInfo, projectId: string, startDepth: number, dialogLink: TreeLink) => {
    return dialogIsFormDialog(dialog)
      ? renderDialogTriggersByProperty(dialog, projectId, startDepth + 1)
      : renderTriggerList(dialog.triggers, dialog, projectId, dialogLink);
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

    if (options.showTriggers) {
      return filteredDialogs.map((dialog: DialogInfo) => {
        const { summaryElement, dialogLink } = renderDialogHeader(projectId, dialog, 0, bot.isPvaSchema);
        const key = 'dialog-' + dialog.id;
        return (
          <ExpandableNode
            key={key}
            defaultState={getPageElement(key)}
            depth={startDepth}
            detailsRef={dialog.isRoot ? addMainDialogRef : undefined}
            summary={summaryElement}
            onToggle={(newState) => setPageElement(key, newState)}
          >
            <div>{renderDialogTriggers(dialog, projectId, startDepth + 1, dialogLink)}</div>
          </ExpandableNode>
        );
      });
    } else {
      return filteredDialogs.map(
        (dialog: DialogInfo) => renderDialogHeader(projectId, dialog, 1, bot.isPvaSchema).summaryElement
      );
    }
  };

  const createBotSubtree = (bot: BotInProject & { hasWarnings: boolean }) => {
    const key = 'bot-' + bot.projectId;
    if (options.showDialogs && !bot.isRemote) {
      return (
        <ExpandableNode
          key={key}
          defaultState={getPageElement(key)}
          summary={renderBotHeader(bot)}
          onToggle={(newState) => setPageElement(key, newState)}
        >
          <div>{createDetailsTree(bot, 1)}</div>
        </ExpandableNode>
      );
    } else if (options.showRemote) {
      return renderBotHeader(bot);
    } else {
      return null;
    }
  };

  const projectTree = projectCollection.map(createBotSubtree);

  return (
    <div
      ref={treeRef}
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
        <ProjectTreeHeader menu={headerMenu} />
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
        <div css={tree}>{projectTree}</div>
      </FocusZone>
    </div>
  );
};
