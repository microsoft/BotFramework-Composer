// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import React, { useCallback, useState, useEffect, useRef, useMemo } from 'react';
import { jsx, css } from '@emotion/core';
import { FocusZone, FocusZoneDirection } from 'office-ui-fabric-react/lib/FocusZone';
import formatMessage from 'format-message';
import isEqual from 'lodash/isEqual';

import { ListItem } from './listItem';

// -------------------- Styles -------------------- //

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
  BOT: 'CubeShape',
  EXTERNAL_SKILL: 'Globe',
};

const listCSS = css`
  height: 100%;
  label: list;
`;

const headerCSS = (label: string) => css`
  margin-top: -6px;
  width: 100%;
  label: ${label};
`;

// -------------------- ProjectList -------------------- //

export type ListLink = {
  displayName?: string;
  projectId: string;
};

type BotInProject = {
  projectId: string;
  name: string;
  isRemote: boolean;
};

type Props = {
  onSelect?: (link: ListLink) => void;
  defaultSelected?: string;
  projectCollection: BotInProject[];
};

export const ProjectList: React.FC<Props> = ({ onSelect, defaultSelected, projectCollection }) => {
  const listRef = useRef<HTMLDivElement>(null);

  const [selectedLink, setSelectedLink] = useState<string | undefined>(defaultSelected);

  const createProjectList = () => {
    return projectCollection.filter((p) => !p.isRemote).map(renderBotHeader);
  };

  const handleOnSelect = (link: ListLink) => {
    // Skip state change when link not changed.
    if (link.projectId === selectedLink) return;

    setSelectedLink(link.projectId);
    onSelect?.(link);
  };

  const renderBotHeader = (bot: BotInProject) => {
    const link: ListLink = {
      displayName: bot.name,
      projectId: bot.projectId,
    };

    return (
      <span key={bot.name} css={headerCSS('bot-header')} data-testid={`BotHeader-${bot.name}`} role="grid">
        <ListItem
          icon={bot.isRemote ? icons.EXTERNAL_SKILL : icons.BOT}
          isActive={link.projectId === selectedLink}
          link={link}
          onSelect={handleOnSelect}
        />
      </span>
    );
  };

  const projectList = createProjectList();

  return (
    <div
      ref={listRef}
      aria-label={formatMessage('Navigation pane')}
      className="ProjectList"
      css={root}
      data-testid="ProjectList"
      role="region"
    >
      <FocusZone isCircularNavigation direction={FocusZoneDirection.vertical}>
        <div css={listCSS}>{projectList}</div>
      </FocusZone>
    </div>
  );
};
