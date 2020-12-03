// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useState, Fragment, useEffect, useCallback } from 'react';
import formatMessage from 'format-message';

export type TreeLink = {
  displayName: string;
  isRoot: boolean;
  bot?: BotInProject;
  projectId: string;
  skillId?: string;
  dialogId?: string;
  trigger?: number;
  parentLink?: TreeLink;
};

type BotInProject = {
  [key: string]: any;
}

type Props = {
  projectCollection: BotInProject[];
}
export const MiniProjectTree: React.FC<Props> = ({
  projectCollection = [],
}) =>{

  const createSubtree = useMemo(() => {
    return projectCollection.map(createBotSubtree);
  });

  const createBotSubtree = (bot: BotInProject & { hasWarnings: boolean }) => {
    const key = 'bot-' + bot.projectId;
    return renderBotHeader(bot);
  };

 const renderBotHeader = (bot: BotInProject) => {
    const link: TreeLink = {
      displayName: bot.name,
      projectId: rootProjectId,
      skillId: rootProjectId === bot.projectId ? undefined : bot.projectId,
      isRoot: true,
      bot,
    };
    const isRunning = bot.buildEssentials.status === BotStatus.connected;

    return (
      <span key={bot.name} css={headerCSS('bot-header')} data-testid={`BotHeader-${bot.name}`} role="grid">
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
          onSelect={options.showCommonLinks ? undefined : handleOnSelect}
        />
      </span>
    );
  };


});