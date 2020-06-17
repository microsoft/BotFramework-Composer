// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import React from 'react';
import { FlowSchemaProvider } from '../schema/flowSchemaProvider';
import { defaultFlowSchema } from '../schema/defaultFlowSchema';
import { defaultFlowWidgets } from '../schema/defaultFlowWidgets';
var defaultProvider = new FlowSchemaProvider(defaultFlowSchema);
export var FlowSchemaContext = React.createContext({
  widgets: defaultFlowWidgets,
  schemaProvider: defaultProvider,
});
//# sourceMappingURL=FlowSchemaContext.js.map
