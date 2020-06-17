// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useMemo, useRef } from 'react';
import isEqual from 'lodash/isEqual';
import { Trigger } from '../components/nodes/Trigger';
import { defaultNodeProps } from '../components/nodes/nodeProps';
import { NodeEventTypes } from '../constants/NodeEventTypes';
import { GraphNode } from '../models/GraphNode';
import { transformObiRules } from '../transformers/transformObiRules';
import { outlineObiJson } from '../utils/outlineObiJson';
import { StepEditor } from './StepEditor';
var calculateNodeMap = function (ruleId, data) {
  var result = transformObiRules(data, ruleId);
  if (!result) return {};
  var stepGroup = result.stepGroup;
  return {
    stepGroup: GraphNode.fromIndexedJson(stepGroup),
  };
};
/**
 * `Rule` means a single element stored in the array `AdaptiveDialog.rules`.
 * Usually, a Rule may contain a series of steps.
 */
export var RuleEditor = function (_a) {
  var id = _a.id,
    data = _a.data,
    onEvent = _a.onEvent;
  var outlineCache = useRef();
  var outlineVersion = useRef(0);
  var nodeMap = useMemo(
    function () {
      var newOutline = outlineObiJson(data);
      if (!isEqual(newOutline, outlineCache.current)) {
        outlineCache.current = newOutline;
        outlineVersion.current += 1;
      }
      return calculateNodeMap(id, data);
    },
    [id, data]
  );
  var stepGroup = nodeMap.stepGroup;
  return jsx(
    'div',
    {
      className: 'rule-editor',
      css: {
        position: 'relative',
        display: 'flex',
        width: '100%',
        flexDirection: 'column',
        alignItems: 'center',
      },
      'data-testid': 'RuleEditor',
      onClick: function (e) {
        e.stopPropagation();
        onEvent(NodeEventTypes.Focus, { id: '' });
      },
    },
    jsx(StepEditor, {
      key: stepGroup.id + '?version=' + outlineVersion.current,
      data: stepGroup.data,
      id: stepGroup.id,
      trigger: jsx(Trigger, { data: data }),
      onEvent: onEvent,
    })
  );
};
RuleEditor.defaultProps = defaultNodeProps;
//# sourceMappingURL=RuleEditor.js.map
