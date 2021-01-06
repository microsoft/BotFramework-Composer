// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useCallback, useState, useEffect, useRef } from 'react';
/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { SearchBox } from 'office-ui-fabric-react/lib/SearchBox';
import { FocusZone, FocusZoneDirection } from 'office-ui-fabric-react/lib/FocusZone';
import cloneDeep from 'lodash/cloneDeep';
import formatMessage from 'format-message';
import { DialogInfo, ITrigger, Diagnostic, DiagnosticSeverity, LanguageFileImport } from '@bfc/shared';
import debounce from 'lodash/debounce';
import throttle from 'lodash/throttle';
import { ISearchBoxStyles } from 'office-ui-fabric-react/lib/SearchBox';
import { useRecoilValue } from 'recoil';

import TelemetryClient from '../../telemetry/TelemetryClient';
import { projectTreeSelector, rootBotProjectIdSelector } from '../../recoilModel';
import { LoadingSpinner } from '../LoadingSpinner';

import TreeDialogs from './TreeDialogs';
import { ProjectTreeHeader, ProjectTreeHeaderMenuItem } from './ProjectTreeHeader';

// -------------------- ProjectTree -------------------- //

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
  lgImports: Record<string, LanguageFileImport[]>;
  luImports: Record<string, LanguageFileImport[]>;
};

export type TreeLink = {
  displayName: string;
  isRoot: boolean;
  bot?: BotInProject;
  diagnostics: Diagnostic[];
  projectId: string;
  skillId?: string;
  dialogId?: string;
  trigger?: number;
  lgFileId?: string;
  luFileId?: string;
  parentLink?: TreeLink;
  onErrorClick?: (projectId: string, skillId: string, diagnostic: Diagnostic) => void;
};

export type ProjectTreeOptions = {
  showDelete?: boolean;
  showDialogs?: boolean;
  showLgImports?: boolean;
  showLuImports?: boolean;
  showMenu?: boolean;
  showQnAMenu?: boolean;
  showErrors?: boolean;
  showCommonLinks?: boolean;
  showRemote?: boolean;
  showTriggers?: boolean;
};

type ProjectTreeProps = {
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
  defaultSelected?: Partial<TreeLink>;
  options?: ProjectTreeOptions;
};

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
  LG: 'Robot',
  LU: 'People',
};

const tree = css`
  height: 100%;
  label: tree;
`;

const headerCSS = (label: string) => css`
  margin-top: -6px;
  width: 100%;
  label: ${label};
`;

export const ProjectTree: React.FC<ProjectTreeProps> = ({
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
  defaultSelected,
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
}) => {
  const treeRef = useRef<HTMLDivElement>(null);
  const [filter, setFilter] = useState('');
  const projectCollection = useRecoilValue(projectTreeSelector);
  const rootProjectId = useRecoilValue(rootBotProjectIdSelector);

  const debouncedTelemetry = useRef(debounce(() => TelemetryClient.track('ProjectTreeFilterUsed'), 1000)).current;

  const delayedSetFilter = throttle((newValue) => {
    setFilter(newValue);
    debouncedTelemetry();
  }, 200);

  const onFilter = (_e?: any, newValue?: string): void => {
    if (typeof newValue === 'string') {
      delayedSetFilter(newValue);
    }
  };

  if (rootProjectId == null) {
    return <LoadingSpinner />;
  }

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
        <div css={tree}>
          {projectCollection.map((projectData) => {
            return <TreeDialogs key={projectData.projectId} bot={projectData} />;
          })}
        </div>
      </FocusZone>
    </div>
  );
};
