// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { FC } from 'react';

import { Panel } from '../components/lib/Panel';
import { RuleGroup, CollapsedRuleGroup } from '../components/groups';
import { EventMenu } from '../components/menus/EventMenu';
import { NodeEventTypes } from '../constants/NodeEventTypes';

import { EditorProps } from './editorProps';

export const EventsEditor: FC<EditorProps> = ({ id, data, onEvent }): JSX.Element => {
  const ruleCount = data.children.length;
  const title = `Events (${ruleCount})`;

  const onClick = ($kind) => onEvent(NodeEventTypes.Insert, { id, $kind, position: ruleCount });

  return (
    <Panel
      addMenu={<EventMenu data-testid="EventsEditorAdd" onClick={onClick} />}
      collapsedItems={<CollapsedRuleGroup count={ruleCount} />}
      onClickContent={(e) => {
        e.stopPropagation();
        onEvent(NodeEventTypes.FocusEvent, '');
      }}
      title={title}
    >
      <RuleGroup data={data} id={id} key={id} onEvent={onEvent} />
    </Panel>
  );
};
