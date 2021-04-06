// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import React, { useCallback, useState, useRef } from 'react';
import { NeutralColors } from '@uifabric/fluent-theme';
import { jsx, css } from '@emotion/core';
import { FocusZone, FocusZoneDirection } from 'office-ui-fabric-react/lib/FocusZone';
import formatMessage from 'format-message';
import { DialogInfo, ITrigger, Diagnostic, DiagnosticSeverity, LanguageFileImport, getFriendlyName } from '@bfc/shared';
import debounce from 'lodash/debounce';
import throttle from 'lodash/throttle';
import { useRecoilValue } from 'recoil';
import { extractSchemaProperties, groupTriggersByPropertyReference, NoGroupingTriggerGroupName } from '@bfc/indexers';
import isEqual from 'lodash/isEqual';

import {
  dispatcherState,
  rootBotProjectIdSelector,
  TreeDataPerProject,
  jsonSchemaFilesByProjectIdSelector,
  pageElementState,
  projectTreeSelectorFamily,
} from '../../recoilModel';
import { triggerNotSupported } from '../../utils/dialogValidator';
import { useFeatureFlag } from '../../utils/hooks';
import { LoadingSpinner } from '../LoadingSpinner';
import TelemetryClient from '../../telemetry/TelemetryClient';
import { getBaseName } from '../../utils/fileUtil';

import { TreeItem } from './treeItem';
import { ExpandableNode } from './ExpandableNode';
import { INDENT_PER_LEVEL } from './constants';
import { ProjectTreeHeader, ProjectTreeHeaderMenuItem } from './ProjectTreeHeader';
import { isChildTriggerLinkSelected, doesLinkMatch } from './helpers';
import { ProjectHeader } from './ProjectHeader';
import { ProjectTreeOptions, TreeLink, TreeMenuItem } from './types';

// -------------------- Styles -------------------- //

const root = css`
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  overflow: hidden;
  .ms-List-cell {
    min-height: 36px;
  }
`;

const focusStyle = css`
  height: 100%;
  position: relative;
`;

const tree = css`
  height: calc(100% - 45px);
  overflow-y: auto;
  label: tree;
`;

const headerCSS = (label: string, isActive?: boolean) => css`
  margin-top: -6px;
  width: 100%;
  label: ${label};
  :hover {
    background: ${isActive ? NeutralColors.gray40 : NeutralColors.gray20};
  }
  background: ${isActive ? NeutralColors.gray30 : NeutralColors.white};
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
function getTriggerName(trigger: ITrigger): string {
  return trigger.displayName || getFriendlyName({ $kind: trigger.type });
}

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
  onErrorClick?: (projectId: string, skillId: string, diagnostic: Diagnostic) => void;
  selectedLink?: Partial<TreeLink>;
  options?: ProjectTreeOptions;
  headerAriaLabel?: string;
  headerPlaceholder?: string;
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
  onErrorClick = () => {},
  selectedLink,
  options = {
    showDelete: true,
    showDialogs: true,
    showLgImports: false,
    showLuImports: false,
    showMenu: true,
    showQnAMenu: true,
    showErrors: true,
    showCommonLinks: false,
    showRemote: true,
    showTriggers: true,
  },
  headerAriaLabel = '',
  headerPlaceholder = '',
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
  const setPageElement = (name: string, value) => setPageElementState('dialogs', { ...pageElements, [name]: value });

  const [filter, setFilter] = useState('');

  const [isMenuOpen, setMenuOpen] = useState<boolean>(false);
  const formDialogComposerFeatureEnabled = useFeatureFlag('FORM_DIALOG');

  const notificationMap: { [projectId: string]: { [dialogId: string]: Diagnostic[] } } = {};
  const lgImportsByProjectByDialog: Record<string, Record<string, LanguageFileImport[]>> = {};
  const luImportsByProjectByDialog: Record<string, Record<string, LanguageFileImport[]>> = {};

  const debouncedTelemetry = useRef(debounce(() => TelemetryClient.track('ProjectTreeFilterUsed'), 1000)).current;

  const delayedSetFilter = throttle((newValue) => {
    setFilter(newValue);
    debouncedTelemetry();
  }, 200);

  const addMainDialogRef = useCallback((mainDialog) => onboardingAddCoachMarkRef({ mainDialog }), []);

  const rootProjectId = useRecoilValue(rootBotProjectIdSelector);
  const projectCollection: TreeDataPerProject[] = useRecoilValue(projectTreeSelectorFamily);
  const jsonSchemaFilesByProjectId = useRecoilValue(jsonSchemaFilesByProjectIdSelector);

  // TODO Refactor to make sure tree is not generated until a new trigger/dialog is added. #5462
  const createSubtree = useCallback(() => {
    return projectCollection.map(createBotSubtree);
  }, [projectCollection, selectedLink, leftSplitWidth, filter]);

  if (rootProjectId == null) {
    // this should only happen before a project is loaded in, so it won't last very long
    return <LoadingSpinner />;
  }

  const dialogIsFormDialog = (dialog: DialogInfo) => {
    return formDialogComposerFeatureEnabled && dialog.isFormDialog;
  };

  const formDialogSchemaExists = (projectId: string, dialog: DialogInfo) => {
    return (
      dialogIsFormDialog(dialog) &&
      !!projectCollection?.find((s) => s.projectId === projectId)?.formDialogSchemas.find((fd) => fd.id === dialog.id)
    );
  };

  const handleOnSelect = (link: TreeLink) => {
    // Skip state change when link not changed.
    if (isEqual(link, selectedLink)) return;

    onSelect?.(link);
  };

  const renderDialogHeader = (skillId: string, dialog: DialogInfo, depth: number, isPvaSchema: boolean) => {
    const diagnostics: Diagnostic[] = notificationMap[rootProjectId][dialog.id];
    const dialogLink: TreeLink = {
      dialogId: dialog.id,
      displayName: dialog.displayName,
      isRoot: dialog.isRoot,
      diagnostics,
      projectId: rootProjectId,
      skillId: skillId === rootProjectId ? undefined : skillId,
      isRemote: false,
    };
    const menu: TreeMenuItem[] = [
      {
        label: formatMessage('Add a trigger'),
        icon: 'Add',
        onClick: () => {
          onDialogCreateTrigger(skillId, dialog.id);
          TelemetryClient.track('AddNewTriggerStarted');
        },
      },
      {
        label: '',
        onClick: () => {},
      },
    ];

    const QnAMenuItem = {
      label: formatMessage('Add new knowledge base'),
      icon: 'Add',
      onClick: () => {
        createQnAFromUrlDialogBegin({ projectId: skillId, dialogId: dialog.id });
        TelemetryClient.track('AddNewKnowledgeBaseStarted');
      },
    };

    if (!isPvaSchema) {
      menu.splice(1, 0, QnAMenuItem);
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
        onClick: (link: TreeLink) =>
          navigateToFormDialogSchema({ projectId: link.skillId ?? link.projectId, schemaId: link.dialogId }),
      });
    }

    return {
      summaryElement: (
        <span
          key={dialog.id}
          ref={dialog.isRoot ? addMainDialogRef : null}
          css={headerCSS('dialog-header', doesLinkMatch(dialogLink, selectedLink))}
          data-testid={`DialogHeader-${dialog.displayName}`}
        >
          <TreeItem
            hasChildren
            isActive={doesLinkMatch(dialogLink, selectedLink)}
            isChildSelected={isChildTriggerLinkSelected(dialogLink, selectedLink)}
            isMenuOpen={isMenuOpen}
            itemType={isFormDialog ? 'form dialog' : 'dialog'}
            link={dialogLink}
            menu={options.showMenu ? menu : options.showQnAMenu ? [QnAMenuItem] : []}
            menuOpenCallback={setMenuOpen}
            padLeft={depth * LEVEL_PADDING}
            showErrors={false}
            textWidth={leftSplitWidth - TREE_PADDING}
            onSelect={handleOnSelect}
          />
        </span>
      ),
      dialogLink,
    };
  };

  const renderCommonDialogHeader = (skillId: string, depth: number) => {
    const dialogLink: TreeLink = {
      dialogId: 'common',
      displayName: formatMessage('Common'),
      isRoot: false,
      diagnostics: [],
      projectId: rootProjectId,
      skillId: skillId === rootProjectId ? undefined : skillId,
      isRemote: false,
    };

    return (
      <span key={'common'} ref={null} css={headerCSS('dialog-header')} data-testid={`DialogHeader-Common`}>
        <TreeItem
          hasChildren
          isActive={doesLinkMatch(dialogLink, selectedLink)}
          isMenuOpen={isMenuOpen}
          itemType={'dialog'}
          link={dialogLink}
          menuOpenCallback={setMenuOpen}
          padLeft={depth * LEVEL_PADDING}
          showErrors={false}
          textWidth={leftSplitWidth - TREE_PADDING}
          onSelect={handleOnSelect}
        />
      </span>
    );
  };

  const renderTrigger = (
    item: ITrigger & {
      index: number;
      displayName: string;
      warningContent: string | (() => string);
      errorContent: boolean;
    },
    dialog: DialogInfo,
    projectId: string,
    dialogLink: TreeLink,
    depth: number
  ): React.ReactNode => {
    const link: TreeLink = {
      projectId: rootProjectId,
      skillId: projectId === rootProjectId ? undefined : projectId,
      dialogId: dialog.id,
      trigger: item.index,
      displayName: item.displayName,
      diagnostics: [],
      isRoot: false,
      parentLink: dialogLink,
      isRemote: false,
    };

    return (
      <TreeItem
        key={`${item.id}_${item.index}`}
        dialogName={dialog.displayName}
        extraSpace={INDENT_PER_LEVEL}
        isActive={doesLinkMatch(link, selectedLink)}
        isMenuOpen={isMenuOpen}
        itemType={'trigger'}
        link={link}
        marginLeft={depth * INDENT_PER_LEVEL}
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
        role="treeitem"
        showErrors={options.showErrors}
        textWidth={leftSplitWidth - TREE_PADDING}
        onSelect={handleOnSelect}
      />
    );
  };

  const onFilter = (newValue?: string): void => {
    if (typeof newValue === 'string') {
      delayedSetFilter(newValue);
    }
  };

  const filterMatch = (scope: string): boolean => {
    return scope.toLowerCase().includes(filter.toLowerCase());
  };

  const renderTriggerList = (
    triggers: ITrigger[],
    dialog: DialogInfo,
    projectId: string,
    dialogLink: TreeLink,
    depth: number
  ) => {
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
          dialogLink,
          depth
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
      isRemote: false,
    };
    return (
      <span css={headerCSS('trigger-group-header')}>
        <TreeItem
          hasChildren
          isMenuOpen={isMenuOpen}
          isSubItemActive={false}
          itemType={'trigger group'}
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
      isRemote: false,
    };

    return (
      <ExpandableNode
        key={key}
        depth={startDepth}
        summary={renderTriggerGroupHeader(groupDisplayName, dialog, projectId)}
        onToggle={(newState) => setPageElement(key, newState)}
      >
        <div role="group">{renderTriggerList(triggers, dialog, projectId, link, 1)}</div>
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
      : renderTriggerList(dialog.triggers, dialog, projectId, dialogLink, 1);
  };

  // flatten lg imports url is same to dialog, to match correct link need render it as dialog
  const renderLgImportAsDialog = (item: LanguageFileImport, projectId: string): React.ReactNode => {
    const link: TreeLink = {
      projectId: rootProjectId,
      skillId: projectId === rootProjectId ? undefined : projectId,
      dialogId: getBaseName(item.id),
      displayName: item.displayName ?? item.id,
      diagnostics: [],
      isRoot: false,
      isRemote: false,
    };

    return (
      <TreeItem
        key={`lg_${item.id}`}
        extraSpace={INDENT_PER_LEVEL}
        isActive={doesLinkMatch(link, selectedLink)}
        isMenuOpen={isMenuOpen}
        itemType={'dialog'}
        link={link}
        menu={[]}
        menuOpenCallback={setMenuOpen}
        showErrors={options.showErrors}
        textWidth={leftSplitWidth - TREE_PADDING}
        onSelect={handleOnSelect}
      />
    );
  };

  const renderLgImport = (item: LanguageFileImport, projectId: string, dialogId: string): React.ReactNode => {
    const link: TreeLink = {
      projectId: rootProjectId,
      skillId: projectId === rootProjectId ? undefined : projectId,
      lgFileId: item.id,
      dialogId,
      displayName: item.displayName ?? item.id,
      diagnostics: [],
      isRoot: false,
      isRemote: false,
    };

    return (
      <TreeItem
        key={`lg_${item.id}`}
        extraSpace={INDENT_PER_LEVEL}
        isActive={doesLinkMatch(link, selectedLink)}
        isMenuOpen={isMenuOpen}
        itemType={'dialog'}
        link={link}
        menu={[]}
        menuOpenCallback={setMenuOpen}
        showErrors={options.showErrors}
        textWidth={leftSplitWidth - TREE_PADDING}
        onSelect={handleOnSelect}
      />
    );
  };

  const renderLgImports = (dialog: DialogInfo, projectId: string) => {
    return lgImportsByProjectByDialog[projectId][dialog.id]
      .filter((lgImport) => filterMatch(dialog.displayName) || filterMatch(lgImport.displayName))
      .map((lgImport) => {
        return renderLgImport(lgImport, projectId, dialog.id);
      });
  };

  const renderLuImportAsDialog = (item: LanguageFileImport, projectId: string): React.ReactNode => {
    const link: TreeLink = {
      projectId: rootProjectId,
      skillId: projectId === rootProjectId ? undefined : projectId,
      dialogId: getBaseName(item.id),
      displayName: item.displayName ?? item.id,
      diagnostics: [],
      isRoot: false,
      isRemote: false,
    };

    return (
      <TreeItem
        key={`lu_${item.id}`}
        extraSpace={INDENT_PER_LEVEL}
        isActive={doesLinkMatch(link, selectedLink)}
        isMenuOpen={isMenuOpen}
        itemType={'dialog'}
        link={link}
        menu={[]}
        menuOpenCallback={setMenuOpen}
        showErrors={options.showErrors}
        textWidth={leftSplitWidth - TREE_PADDING}
        onSelect={handleOnSelect}
      />
    );
  };

  const renderLuImport = (item: LanguageFileImport, projectId: string, dialogId: string): React.ReactNode => {
    const link: TreeLink = {
      projectId: rootProjectId,
      skillId: projectId === rootProjectId ? undefined : projectId,
      luFileId: item.id,
      displayName: item.displayName ?? item.id,
      dialogId,
      diagnostics: [],
      isRoot: false,
      isRemote: false,
    };

    return (
      <TreeItem
        key={`lu_${item.id}`}
        extraSpace={INDENT_PER_LEVEL}
        isActive={doesLinkMatch(link, selectedLink)}
        isMenuOpen={isMenuOpen}
        itemType={'dialog'}
        link={link}
        menu={[]}
        menuOpenCallback={setMenuOpen}
        showErrors={options.showErrors}
        textWidth={leftSplitWidth - TREE_PADDING}
        onSelect={handleOnSelect}
      />
    );
  };

  const renderLuImports = (dialog: DialogInfo, projectId: string) => {
    return luImportsByProjectByDialog[projectId][dialog.id]
      .filter((luImport) => filterMatch(dialog.displayName) || filterMatch(luImport.displayName))
      .map((luImport) => {
        return renderLuImport(luImport, projectId, dialog.id);
      });
  };

  const createDetailsTree = (bot: TreeDataPerProject, startDepth: number) => {
    const { projectId, lgImportsList, luImportsList } = bot;
    const dialogs = bot.sortedDialogs;

    const filteredDialogs =
      filter == null || filter.length === 0
        ? dialogs
        : dialogs.filter(
            (dialog) =>
              filterMatch(dialog.displayName) || dialog.triggers.some((trigger) => filterMatch(getTriggerName(trigger)))
          );
    const commonLink = options.showCommonLinks ? [renderCommonDialogHeader(projectId, 1)] : [];

    const importedLgLinks = options.showLgImports
      ? lgImportsList.map((file) => renderLgImportAsDialog(file, projectId))
      : [];
    const importedLuLinks = options.showLuImports
      ? luImportsList.map((file) => renderLuImportAsDialog(file, projectId))
      : [];

    return [
      ...commonLink,
      ...importedLgLinks,
      ...importedLuLinks,
      ...filteredDialogs.map((dialog: DialogInfo) => {
        const { summaryElement, dialogLink } = renderDialogHeader(projectId, dialog, 0, bot.isPvaSchema);
        const key = 'dialog-' + dialog.id;

        let lgImports, luImports;
        if (options.showLgImports) {
          lgImports = renderLgImports(dialog, projectId);
        }

        if (options.showLuImports) {
          luImports = renderLuImports(dialog, projectId);
        }

        if (options.showTriggers) {
          return (
            <ExpandableNode
              key={key}
              defaultState={getPageElement(key)}
              depth={startDepth}
              isActive={doesLinkMatch(dialogLink, selectedLink)}
              summary={summaryElement}
              onToggle={(newState) => setPageElement(key, newState)}
            >
              <div>{renderDialogTriggers(dialog, projectId, startDepth + 1, dialogLink)}</div>
            </ExpandableNode>
          );
        } else if (options.showLgImports && lgImports.length > 0 && dialog.isFormDialog) {
          return (
            <ExpandableNode
              key={key}
              defaultState={getPageElement(key)}
              depth={startDepth}
              isActive={doesLinkMatch(dialogLink, selectedLink)}
              summary={summaryElement}
              onToggle={(newState) => setPageElement(key, newState)}
            >
              <div>{lgImports}</div>
            </ExpandableNode>
          );
        } else if (options.showLuImports && luImports.length > 0 && dialog.isFormDialog) {
          return (
            <ExpandableNode
              key={key}
              defaultState={getPageElement(key)}
              depth={startDepth}
              isActive={doesLinkMatch(dialogLink, selectedLink)}
              summary={summaryElement}
              onToggle={(newState) => setPageElement(key, newState)}
            >
              <div>{luImports}</div>
            </ExpandableNode>
          );
        } else {
          return renderDialogHeader(projectId, dialog, 1, bot.isPvaSchema).summaryElement;
        }
      }),
    ];
  };

  const createBotSubtree = (bot: TreeDataPerProject) => {
    notificationMap[bot.projectId] = {};

    for (const dialog of bot.sortedDialogs) {
      const dialogId = dialog.id;
      notificationMap[bot.projectId][dialogId] = dialog.diagnostics;

      if (!lgImportsByProjectByDialog[bot.projectId]) {
        lgImportsByProjectByDialog[bot.projectId] = {};
      }

      lgImportsByProjectByDialog[bot.projectId][dialogId] = bot.lgImports[dialog.id];

      if (!luImportsByProjectByDialog[bot.projectId]) {
        luImportsByProjectByDialog[bot.projectId] = {};
      }
      luImportsByProjectByDialog[bot.projectId][dialogId] = bot.luImports[dialog.id];
    }

    const key = 'bot-' + bot.projectId;
    const projectHeader = (
      <ProjectHeader
        key={`${key}-header`}
        botError={bot.botError}
        handleOnSelect={handleOnSelect}
        isMenuOpen={isMenuOpen}
        isRemote={bot.isRemote}
        isRootBot={bot.isRootBot}
        name={bot.name}
        options={options}
        projectId={bot.projectId}
        selectedLink={selectedLink}
        setMenuOpen={setMenuOpen}
        textWidth={leftSplitWidth - TREE_PADDING}
        onBotCreateDialog={onBotCreateDialog}
        onBotDeleteDialog={onBotDeleteDialog}
        onBotEditManifest={onBotEditManifest}
        onBotExportZip={onBotExportZip}
        onBotRemoveSkill={onBotRemoveSkill}
        onBotStart={onBotStart}
        onBotStop={onBotStop}
        onErrorClick={onErrorClick}
      />
    );
    if (options.showDialogs && !bot.isRemote && !bot.botError) {
      return (
        <ExpandableNode
          key={key}
          defaultState={getPageElement(key)}
          summary={projectHeader}
          onToggle={(newState) => setPageElement(key, newState)}
        >
          <div>{createDetailsTree(bot, 1)}</div>
        </ExpandableNode>
      );
    } else if (options.showRemote) {
      return projectHeader;
    } else {
      return null;
    }
  };

  const projectTree = createSubtree();

  return (
    <div
      ref={treeRef}
      aria-label={formatMessage('Navigation pane')}
      className="ProjectTree"
      css={root}
      data-testid="ProjectTree"
    >
      <ProjectTreeHeader
        ariaLabel={headerAriaLabel}
        menu={headerMenu}
        placeholder={headerPlaceholder}
        onFilter={onFilter}
      />
      <FocusZone isCircularNavigation css={focusStyle} direction={FocusZoneDirection.vertical}>
        <div
          aria-label={formatMessage(
            `{
            dialogNum, plural,
                =0 {No bots have}
                =1 {One bot has}
              other {# bots have}
            } been found.
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
