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
import { useMemo, useRef } from 'react';
import { isEqual } from 'lodash';

import { Trigger } from '../components/nodes/Trigger';
import { defaultNodeProps } from '../components/nodes/nodeProps';
import { NodeEventTypes } from '../constants/NodeEventTypes';
import { GraphNode } from '../models/GraphNode';
import { transformObiRules } from '../transformers/transformObiRules';
import { outlineObiJson } from '../utils/outlineObiJson';

import { StepEditor } from './StepEditor';

const calculateNodeMap = (ruleId, data): { [id: string]: GraphNode } => {
  const result = transformObiRules(data, ruleId);
  if (!result) return {};

  const { stepGroup } = result;
  return {
    stepGroup: GraphNode.fromIndexedJson(stepGroup),
  };
};

/**
 * `Rule` means a single element stored in the array `AdaptiveDialog.rules`.
 * Usually, a Rule may contain a series of steps.
 */
export const RuleEditor = ({ id, data, onEvent }): JSX.Element => {
  const outlineCache = useRef();
  const outlineVersion = useRef(0);

  const nodeMap = useMemo(() => {
    const newOutline = outlineObiJson(data);
    if (!isEqual(newOutline, outlineCache.current)) {
      outlineCache.current = newOutline;
      outlineVersion.current += 1;
    }
    return calculateNodeMap(id, data);
  }, [id, data]);

  const { stepGroup } = nodeMap;

  return (
    <div
      className="rule-editor"
      data-testid="RuleEditor"
      css={{
        position: 'relative',
        display: 'flex',
        width: '100%',
        flexDirection: 'column',
        alignItems: 'center',
      }}
      onClick={e => {
        e.stopPropagation();
        onEvent(NodeEventTypes.Focus, { id: '' });
      }}
    >
      <StepEditor
        key={stepGroup.id + '?version=' + outlineVersion.current}
        id={stepGroup.id}
        data={stepGroup.data}
        onEvent={onEvent}
        trigger={<Trigger data={data} />}
      />
    </div>
  );
};

RuleEditor.defaultProps = defaultNodeProps;
