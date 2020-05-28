// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';

import {
  NodeMenuComponent,
  EdgeMenuComponent,
  NodeWrapperComponent,
} from '../../adaptive-visual-sdk/types/PluggableComponents.types';
import { NodeEventTypes } from '../../adaptive-visual-sdk/constants/NodeEventTypes';

import { NodeMenu } from './NodeMenu';
import { EdgeMenu } from './EdgeMenu';
import { ActionNodeWrapper } from './NodeWrapper';

export const VisualEditorNodeMenu: NodeMenuComponent = ({ nodeId, onEvent, colors = { color: 'black' } }) => {
  return <NodeMenu colors={colors} id={nodeId} onEvent={onEvent} />;
};

export const VisualEditorEdgeMenu: EdgeMenuComponent = ({ arrayId, arrayPosition, onEvent }) => {
  return (
    <EdgeMenu
      id={`${arrayId}[${arrayPosition}]`}
      onClick={($kind) => onEvent(NodeEventTypes.Insert, { id: arrayId, position: arrayPosition, $kind })}
    />
  );
};

export const VisualEditorNodeWrapper: NodeWrapperComponent = ({ nodeId, nodeData, nodeTab, onEvent, children }) => {
  return (
    <ActionNodeWrapper data={nodeData} id={nodeId} tab={nodeTab as any} onEvent={onEvent}>
      {children}
    </ActionNodeWrapper>
  );
};
