// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';

import {
  NodeMenuComponent,
  EdgeMenuComponent,
  NodeWrapperComponent,
  ElementWrapperComponent,
} from '../../adaptive-flow-renderer/types/PluggableComponents.types';
import { NodeEventTypes } from '../../adaptive-flow-renderer/constants/NodeEventTypes';

import { NodeMenu } from './NodeMenu';
import { EdgeMenu } from './EdgeMenu';
import { ActionNodeWrapper } from './NodeWrapper';
import { ElementWrapper } from './ElementWrapper';

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

export const VisualEditorNodeWrapper: NodeWrapperComponent = ({
  nodeId,
  nodeData,
  nodeTab,
  onEvent,
  children,
  ...rest
}) => {
  return (
    <ActionNodeWrapper data={nodeData} id={nodeId} tab={nodeTab as any} onEvent={onEvent} {...rest}>
      {children}
    </ActionNodeWrapper>
  );
};

export const VisualEditorElementWrapper: ElementWrapperComponent = ElementWrapper;
