// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';

import { NodeMenuComponent, EdgeMenuComponent, NodeWrapperComponent } from '../models/FlowRenderer.types';

export interface FlowRendererContextData {
  EdgeMenu: EdgeMenuComponent;
  NodeMenu: NodeMenuComponent;
  NodeWrapper: NodeWrapperComponent;
}

export const FlowRendererContext = React.createContext<FlowRendererContextData>({
  EdgeMenu: () => <></>,
  NodeMenu: () => <></>,
  NodeWrapper: ({ children }) => <>{children}</>,
});
