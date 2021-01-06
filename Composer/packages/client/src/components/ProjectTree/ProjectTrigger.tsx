// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */

import { useCallback } from 'react';
import { jsx, css } from '@emotion/core';
import formatMessage from 'format-message';

import { doesLinkMatch } from './helpers';
import { TreeItem } from './treeItem';

const icons = {
  BOT: 'CubeShape',
  EXTERNAL_SKILL: 'Globe',
};

type ProjectTriggerProps = {};

export const ProjectTrigger = (props: ProjectTriggerProps) => {
  const link: TreeLink = {
    projectId: rootProjectId,
    skillId: projectId === rootProjectId ? undefined : projectId,
    dialogId: dialog.id,
    trigger: item.index,
    displayName: item.displayName,
    diagnostics: [],
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
