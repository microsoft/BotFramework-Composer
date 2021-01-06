// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
import { ScrollablePane, ScrollbarVisibility } from 'office-ui-fabric-react/lib/ScrollablePane';
import { List } from 'office-ui-fabric-react/lib/List';
import { BotTemplate } from '@bfc/shared';

import * as exampleIcons from '../../images/samples';

import {
  exampleListContainer,
  exampleListCell,
  exampleListCellIcon,
  exampleListCellContent,
  exampleListCellName,
  exampleListCellDescription,
} from './styles';

interface ExampleListProps {
  examples: BotTemplate[];
  onClick: (templateId: string) => void;
}

const resolveIcon = (exampleId: string): string => {
  if (exampleIcons[exampleId]) {
    return exampleIcons[exampleId];
  }

  return exampleIcons.DefaultIcon;
};

export const ExampleList: React.FC<ExampleListProps> = (props) => {
  const { onClick, examples } = props;

  function onRenderCell(item?: BotTemplate): React.ReactNode {
    if (!item) {
      return;
    }

    return (
      <div
        key={item.id}
        data-is-focusable
        aria-label={item.name + '; ' + item.description}
        css={exampleListCell}
        role="button"
        tabIndex={0}
        onClick={() => onClick(item.id)}
        onKeyDown={(ev) => {
          if (ev.key === 'Enter') {
            onClick(item.id);
          }
        }}
      >
        <img alt="" css={exampleListCellIcon} role="presentation" src={resolveIcon(item.id)} />
        <div css={exampleListCellContent}>
          <div css={exampleListCellName}>{item.name}</div>
          <div css={exampleListCellDescription}>{item.description}</div>
        </div>
      </div>
    );
  }

  return (
    <div css={exampleListContainer} data-is-scrollable="true">
      <ScrollablePane scrollbarVisibility={ScrollbarVisibility.auto}>
        <List items={examples} onRenderCell={onRenderCell} />
      </ScrollablePane>
    </div>
  );
};
