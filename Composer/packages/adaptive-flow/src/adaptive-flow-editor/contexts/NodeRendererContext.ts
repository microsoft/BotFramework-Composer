// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { DialogFactory, JSONSchema7, DialogInfo } from '@bfc/shared';

export interface NodeRendererContextValue {
  focusedId?: string;
  focusedEvent?: string;
  focusedTab?: string;
  clipboardActions: any[];
  dialogFactory: DialogFactory;
  customSchemas: JSONSchema7[];
  dialogs: DialogInfo[];
  topics: DialogInfo[];
}

export const defaultRendererContextValue = {
  focusedId: '',
  focusedEvent: '',
  focusedTab: '',
  clipboardActions: [],
  dialogFactory: new DialogFactory({}),
  customSchemas: [],
  dialogs: [],
  topics: [],
};
export const NodeRendererContext = React.createContext<NodeRendererContextValue>(defaultRendererContextValue);
