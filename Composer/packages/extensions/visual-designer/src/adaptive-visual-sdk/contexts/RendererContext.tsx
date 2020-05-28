// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';

import { NodeMenuComponent, EdgeMenuComponent, NodeWrapperComponent } from '../types/PluggableComponents.types';

export interface RendererContextData {
  EdgeMenu: EdgeMenuComponent;
  NodeMenu: NodeMenuComponent;
  NodeWrapper: NodeWrapperComponent;
}

export const DefaultRenderers = {
  EdgeMenu: (() => <></>) as EdgeMenuComponent,
  NodeMenu: (() => <></>) as NodeMenuComponent,
  NodeWrapper: (({ children }) => <>{children}</>) as NodeWrapperComponent,
};
export const RendererContext = React.createContext<RendererContextData>(DefaultRenderers);
