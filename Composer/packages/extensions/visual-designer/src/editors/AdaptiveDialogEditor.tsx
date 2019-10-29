/**
    Copyright (c) Microsoft. All rights reserved.
    Licensed under the MIT license.

    Microsoft Bot Framework: http://botframework.com

    Bot Framework Composer Github:
    https://github.com/Microsoft/BotFramwork-Composer

    Copyright (c) Microsoft Corporation
    All rights reserved.

    MIT License:
    Permission is hereby granted, free of charge, to any person obtaining
    a copy of this software and associated documentation files (the
    "Software"), to deal in the Software without restriction, including
    without limitation the rights to use, copy, modify, merge, publish,
    distribute, sublicense, and/or sell copies of the Software, and to
    permit persons to whom the Software is furnished to do so, subject to
    the following conditions:

    The above copyright notice and this permission notice shall be
    included in all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED ""AS IS"", WITHOUT WARRANTY OF ANY KIND,
    EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
    MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
    NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
    LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
    OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
    WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
**/
/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useMemo, FC, useContext } from 'react';

import { transformRootDialog } from '../transformers/transformRootDialog';
import { NodeEventTypes } from '../constants/NodeEventTypes';
import { GraphNode } from '../models/GraphNode';
import { queryNode } from '../utils/jsonTracker';
import { NodeRendererContext } from '../store/NodeRendererContext';
import { Collapse } from '../components/lib/Collapse';

import { EventsEditor } from './EventsEditor';
import { RuleEditor } from './RuleEditor';
import { EditorProps, defaultEditorProps } from './editorProps';
import { EditorConfig } from './editorConfig';

const calculateNodeMap = (_, data): { [id: string]: GraphNode } => {
  const result = transformRootDialog(data);
  if (!result) return {};

  const { ruleGroup, stepGroup } = result;
  return {
    ruleGroup: GraphNode.fromIndexedJson(ruleGroup),
    stepGroup: GraphNode.fromIndexedJson(stepGroup),
  };
};

export const AdaptiveDialogEditor: FC<EditorProps> = ({ id, data, onEvent }): JSX.Element | null => {
  const nodeMap = useMemo(() => calculateNodeMap(id, data), [id, data]);
  const { ruleGroup } = nodeMap;

  const { focusedEvent } = useContext(NodeRendererContext);

  const interceptRuleEvent = (eventName: NodeEventTypes, eventData: any) => {
    if (eventName === NodeEventTypes.Expand) {
      const selectedRulePath = eventData;
      return onEvent(NodeEventTypes.FocusEvent, selectedRulePath);
    }
    if (eventName === NodeEventTypes.Insert) {
      return onEvent(NodeEventTypes.InsertEvent, eventData);
    }
    return onEvent(eventName, eventData);
  };

  const activeEventData = queryNode(data, focusedEvent);

  const eventActions = activeEventData ? (
    <RuleEditor key={focusedEvent} id={focusedEvent} data={activeEventData} onEvent={onEvent} />
  ) : null;

  if (!EditorConfig.features.showEvents) {
    return eventActions;
  }

  return (
    <div
      css={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
      onClick={e => {
        e.stopPropagation();
        onEvent(NodeEventTypes.Focus, { id: '' });
      }}
    >
      {ruleGroup && (
        <EventsEditor key={ruleGroup.id} id={ruleGroup.id} data={ruleGroup.data} onEvent={interceptRuleEvent} />
      )}
      <div className="editor-interval" style={{ height: 50 }} />
      <Collapse text="Actions">{eventActions}</Collapse>
    </div>
  );
};

AdaptiveDialogEditor.defaultProps = defaultEditorProps;
