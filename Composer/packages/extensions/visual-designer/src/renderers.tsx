// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';

import { NodeMenuComponent, EdgeMenuComponent, NodeWrapperComponent } from './models/FlowRenderer.types';
import { NodeMenu } from './components/renderers/NodeMenu';
import { EdgeMenu } from './components/renderers/EdgeMenu';
import { NodeEventTypes } from './constants/NodeEventTypes';
import { ElementWrapper } from './components/renderers/ElementWrapper';

export const VisualEditorNodeMenu: NodeMenuComponent = ({ nodeId, onEvent, colors = { color: 'black' } }) => {
  return <NodeMenu id={nodeId} onEvent={onEvent} colors={colors} />;
};

export const VisualEditorEdgeMenu: EdgeMenuComponent = ({ arrayId, arrayPosition, onEvent }) => {
  return (
    <EdgeMenu
      id={`${arrayId}[${arrayPosition}]`}
      onClick={$kind => onEvent(NodeEventTypes.Insert, { id: arrayId, position: arrayPosition, $kind })}
    />
  );
};

export const VisualEditorNodeWrapper: NodeWrapperComponent = ({ nodeId, nodeData, nodeTab, onEvent, children }) => {
  return (
    <ElementWrapper id={nodeId} data={nodeData} onEvent={onEvent} tab={nodeTab as any}>
      {children}
    </ElementWrapper>
  );
};
