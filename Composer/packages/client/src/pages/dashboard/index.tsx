// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import formatMessage from 'format-message';
import { RouteComponentProps } from '@reach/router';
import { List } from 'office-ui-fabric-react/lib/List';
import { Link } from 'office-ui-fabric-react/lib/Link';
import { Toggle } from 'office-ui-fabric-react/lib/Toggle';
import { FontIcon } from 'office-ui-fabric-react/lib/Icon';

import { BotStatus } from '../../constants';
import { BotState } from '../../store/types';

import { root, header, headerText, content, icon } from './styles';

type BotNode = Partial<BotState> & {
  children: Array<BotNode>;
};

function addDepth(array: Array<{ depth?: number; children?: Array<{}> }>, depth = 0) {
  for (const el of array) {
    el.depth = depth;
    if (el.children != null && el.children?.length > 0) {
      addDepth(el.children, depth + 1);
    }
  }
}

const EXAMPLE_DATA: Array<BotNode> = [
  {
    projectId: '12345.6789',
    botName: 'Sample Bot 1',
    botStatus: BotStatus.connected,
    children: [],
  },
  {
    projectId: '9876.54321',
    botName: 'Sample Bot 2',
    botStatus: BotStatus.failed,
    children: [
      {
        projectId: '11111.1111',
        botName: 'Skill 2A',
        botStatus: BotStatus.published,
        children: [],
      },
      {
        projectId: '22222.2222',
        botName: 'Skill 2B',
        botStatus: BotStatus.publishing,
        children: [],
      },
    ],
  },
];

function renderCell(item?: BotNode) {
  if (item == null) return;
  return (
    <div style={{ display: 'flex', height: '36px', width: '100%' }}>
      <FontIcon css={icon} iconName={'ChatBot'} />
      <Link css={{ width: '300px' }} href={`../bot/${item.projectId}/dialogs`}>
        {item.botName}
      </Link>
      <Toggle offText={formatMessage('Stopped')} onText={formatMessage('Running')} />
    </div>
  );
}

export const Dashboard: React.FC<RouteComponentProps> = () => {
  addDepth(EXAMPLE_DATA);

  return (
    <div css={root}>
      <div css={header}>
        <h1 css={headerText}>{formatMessage('Bot Management Dashboard')}</h1>
      </div>
      <div aria-label={formatMessage('List of Bots')} css={content}>
        <List items={EXAMPLE_DATA} onRenderCell={renderCell} />
      </div>
    </div>
  );
};
