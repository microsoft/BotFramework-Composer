// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';

import {
  NodeMenuComponent,
  EdgeMenuComponent,
  NodeWrapperComponent,
  ElementWrapperComponent,
} from '../types/PluggableComponents.types';

export interface RendererContextData {
  /** Edge Menu renderer. Could be a fly-out '+' menu. */
  EdgeMenu: EdgeMenuComponent;

  /** Node Menu renderer. Could be a fly-out '...' menu. */
  NodeMenu: NodeMenuComponent;

  /** Action node container renderer. Could be used to show the focus effect. */
  NodeWrapper: NodeWrapperComponent;

  /** Interactable elements container. Could be used to wrap a hyperlink. */
  ElementWrapper: ElementWrapperComponent;
}

export const DefaultRenderers = {
  EdgeMenu: (() => <></>) as EdgeMenuComponent,
  NodeMenu: (() => <></>) as NodeMenuComponent,
  NodeWrapper: (({ children }) => <>{children}</>) as NodeWrapperComponent,
  ElementWrapper: (({ children }) => <>{children}</>) as ElementWrapperComponent,
};
export const RendererContext = React.createContext<RendererContextData>(DefaultRenderers);
