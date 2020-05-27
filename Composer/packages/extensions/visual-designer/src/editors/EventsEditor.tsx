// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { FC } from 'react';

import { Panel } from '../components/lib/Panel';
import { RuleGroup, CollapsedRuleGroup } from '../components/groups';
import { NodeEventTypes } from '../constants/NodeEventTypes';

import { EditorProps } from './editorProps';

export const EventsEditor: FC<EditorProps> = ({ id, data, onEvent }): JSX.Element => {
  const ruleCount = data.children.length;
  const title = `Events (${ruleCount})`;

  return (
    <Panel
      addMenu={null}
      collapsedItems={<CollapsedRuleGroup count={ruleCount} />}
      title={title}
      onClickContent={(e) => {
        e.stopPropagation();
        onEvent(NodeEventTypes.FocusEvent, '');
      }}
    >
      <RuleGroup key={id} data={data} id={id} onEvent={onEvent} />
    </Panel>
  );
};
