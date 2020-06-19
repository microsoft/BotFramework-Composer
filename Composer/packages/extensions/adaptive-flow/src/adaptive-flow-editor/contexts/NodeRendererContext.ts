// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { DialogFactory, OBISchema } from '@bfc/shared';

export interface NodeRendererContextValue {
  focusedId?: string;
  focusedEvent?: string;
  focusedTab?: string;
  clipboardActions: any[];
  dialogFactory: DialogFactory;
  customSchemas: OBISchema[];
}

export const NodeRendererContext = React.createContext<NodeRendererContextValue>({
  focusedId: '',
  focusedEvent: '',
  focusedTab: '',
  clipboardActions: [],
  dialogFactory: new DialogFactory(),
  customSchemas: [],
});
