// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { DialogFactory, JSONSchema7 } from '@bfc/shared';

import { ExternalAction } from '../../adaptive-flow-renderer/constants/NodeEventTypes';

export interface NodeRendererContextValue {
  focusedId?: string;
  focusedEvent?: string;
  focusedTab?: string;
  clipboardActions: any[];
  dialogFactory: DialogFactory;
  customSchemas: JSONSchema7[];
  externalEvent?: ExternalAction;
  onCompleteExternalEvent: () => void;
}

export const defaultRendererContextValue = {
  focusedId: '',
  focusedEvent: '',
  focusedTab: '',
  clipboardActions: [],
  dialogFactory: new DialogFactory({}),
  customSchemas: [],
  onCompleteExternalEvent: () => {},
};
export const NodeRendererContext = React.createContext<NodeRendererContextValue>(defaultRendererContextValue);
