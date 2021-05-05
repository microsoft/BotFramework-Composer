// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */

import { useCallback } from 'react';
import { jsx, css } from '@emotion/core';
import formatMessage from 'format-message';
import { useRecoilValue } from 'recoil';
import { Diagnostic } from '@bfc/shared';

import { BotStatus } from '../../constants';
import { perProjectDiagnosticsSelectorFamily, botStatusState, rootBotProjectIdSelector } from '../../recoilModel';
import TelemetryClient from '../../telemetry/TelemetryClient';
import { createBotSettingUrl, navigateTo } from '../../utils/navigation';
import { usePVACheck } from '../../hooks/usePVACheck';

import { isChildDialogLinkSelected, doesLinkMatch } from './helpers';
import { TreeItem } from './treeItem';
import { ProjectTreeOptions, TreeLink } from './types';

const headerCSS = (label: string) => css`
  label: ${label};
`;

type ProjectHeaderProps = {
  projectId: string;
  name: string;
  isRootBot: boolean;
  isRemote: boolean;
  botError?: any;
  options?: Partial<ProjectTreeOptions>;
  textWidth: number;
  selectedLink: Partial<TreeLink> | undefined;
  isMenuOpen: boolean;
  onErrorClick: (projectId: string, skillId: string, diagnostic: Diagnostic) => void;
  onBotRemoveSkill: (skillId: string) => void;
  onBotExportZip: (projectId: string) => void;
  onBotDeleteDialog: (projectId: string, dialogId: string) => void;
  onBotCreateDialog: (projectId: string) => void;
  onBotStop: (projectId: string) => void;
  onBotEditManifest: (projectId: string) => void;
  onBotStart: (projectId: string) => void;
  setMenuOpen: (isOpen: boolean) => void;
  handleOnSelect: (link: TreeLink) => void;
};

export const ProjectHeader = (props: ProjectHeaderProps) => {
  const {
    projectId,
    name,
    botError,
    isRemote,
    isRootBot,
    onBotStart,
    onErrorClick,
    textWidth,
    selectedLink,
    isMenuOpen,
    setMenuOpen,
    onBotRemoveSkill,
    onBotCreateDialog,
    onBotStop,
    onBotExportZip,
    onBotEditManifest,
    handleOnSelect,
    options = {},
  } = props;

  const rootProjectId = useRecoilValue(rootBotProjectIdSelector) || '';
  const status = useRecoilValue(botStatusState(projectId));
  const diagnostics = useRecoilValue(perProjectDiagnosticsSelectorFamily(projectId));
  const isPVABot = usePVACheck(projectId);
  const isRunning = status === BotStatus.connected;

  const displayName = `${name} ${rootProjectId !== projectId ? `(${formatMessage('Skill')})` : ''}`;

  const link: TreeLink = {
    displayName,
    projectId: rootProjectId,
    skillId: rootProjectId === projectId ? undefined : projectId,
    isRoot: true,
    botError,
    diagnostics,
    onErrorClick: onErrorClick,
    isRemote,
  };

  const generateMenuItems = useCallback(() => {
    let menuItems = [
      {
        label: formatMessage('Add a dialog'),
        icon: 'Add',
        onClick: () => {
          onBotCreateDialog(projectId);
          TelemetryClient.track('AddNewDialogStarted');
        },
        isDisableForPVA: false,
      },
      {
        label: isRunning ? formatMessage('Stop this bot') : formatMessage('Start this bot'),
        icon: isRunning ? 'CircleStopSolid' : 'TriangleSolidRight12',
        onClick: () => {
          isRunning ? onBotStop(projectId) : onBotStart(projectId);
          TelemetryClient.track(isRunning ? 'StopBotButtonClicked' : 'StartBotButtonClicked', {
            projectId,
            location: 'projectTree',
            isRoot: projectId === rootProjectId,
          });
        },
        isDisableForPVA: true,
      },
      {
        label: '',
        onClick: () => {},
      },
      {
        label: formatMessage('Export as skill'),
        onClick: () => {
          onBotEditManifest(projectId);
        },
        isDisableForPVA: true,
      },
      {
        label: formatMessage('Export as .zip'),
        onClick: () => {
          onBotExportZip(projectId);
        },
        isDisableForPVA: false,
      },
      {
        label: formatMessage('Bot settings'),
        onClick: () => {
          navigateTo(createBotSettingUrl(link.projectId, link.skillId));
        },
        isDisableForPVA: false,
      },
    ];

    const removeSkillItem = {
      label: formatMessage('Remove this skill from project'),
      onClick: () => {
        onBotRemoveSkill(projectId);
      },
    };

    if (isRemote || botError) {
      return [removeSkillItem];
    }

    if (!isRootBot) {
      menuItems.splice(3, 0, removeSkillItem);
    }

    if (isPVABot) {
      menuItems = menuItems.filter((item) => !item.isDisableForPVA);
    }
    return menuItems;
  }, [projectId, isRunning]);

  const menu = generateMenuItems();

  return (
    <span key={name} css={headerCSS('bot-header')} data-testid={`BotHeader-${name}`}>
      <TreeItem
        hasChildren={!isRemote}
        isActive={doesLinkMatch(link, selectedLink)}
        isChildSelected={isChildDialogLinkSelected(link, selectedLink)}
        isMenuOpen={isMenuOpen}
        itemType={isRemote ? 'external skill' : 'bot'}
        link={link}
        menu={options.showMenu ? menu : []}
        menuOpenCallback={setMenuOpen}
        showErrors={options.showErrors}
        textWidth={textWidth}
        onSelect={options.showCommonLinks ? undefined : handleOnSelect}
      />
    </span>
  );
};
