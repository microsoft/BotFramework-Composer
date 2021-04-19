// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
import { DialogInfo } from '@bfc/shared';
import formatMessage from 'format-message';
import get from 'lodash/get';

import { ExpandableNode } from './ExpandableNode';
import { TreeItem } from './treeItem';
import { LEVEL_PADDING, INDENT_PER_LEVEL } from './constants';
import { headerCSS } from './ProjectTree';

type TopicsListProps = {
  onToggle: (newState: boolean) => void;
  topics: DialogInfo[];
  textWidth: number;
  projectId: string;
};

export const TopicsList: React.FC<TopicsListProps> = ({ topics, onToggle, textWidth, projectId }) => {
  const linkTooltip = formatMessage('Edit in Power Virtual Agents');

  const renderTopic = (topic: DialogInfo) => {
    const isSystemTopic = get(topic.content, 'isSystemTopic', false);

    return (
      <TreeItem
        key={topic.id}
        dialogName={topic.displayName}
        extraSpace={INDENT_PER_LEVEL}
        isActive={false}
        isMenuOpen={false}
        itemType={isSystemTopic ? 'system topic' : 'topic'}
        link={{
          projectId,
          dialogId: topic.id,
          displayName: topic.displayName,
          href: get(topic.content, '$designer.link'),
          tooltip: linkTooltip,
        }}
        marginLeft={1 * INDENT_PER_LEVEL}
        role="treeitem"
        textWidth={textWidth}
        onSelect={(link) => {
          if (link.href) {
            // eslint-disable-next-line security/detect-non-literal-fs-filename
            window.open(link.href, '_blank');
          }
        }}
      />
    );
  };

  return (
    <ExpandableNode
      key="pva-topics"
      depth={1}
      summary={
        <span css={headerCSS('pva-topics')}>
          <TreeItem
            hasChildren
            isActive={false}
            isChildSelected={false}
            isMenuOpen={false}
            itemType="topic"
            link={{
              displayName: formatMessage('Power Virtual Agents Topics ({count})', { count: topics.length }),
              projectId,
            }}
            padLeft={0 * LEVEL_PADDING}
            showErrors={false}
            textWidth={textWidth}
          />
        </span>
      }
      onToggle={onToggle}
    >
      <div>{topics.map(renderTopic)}</div>
    </ExpandableNode>
  );
};
