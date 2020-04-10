// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { VisualEditorWidgetMap } from '@bfc/extension';

import { VisualSchemaProvider } from '../schema/visualSchemaProvider';
import { defaultVisualSchema } from '../schema/defaultVisualSchema';
import { defaultVisualWidgets } from '../schema/defaultVisualWidgets';

const defaultProvider = new VisualSchemaProvider(defaultVisualSchema);

export interface VisualSchemaContextValue {
  widgets: VisualEditorWidgetMap;
  schemaProvider: VisualSchemaProvider;
}

export const VisualSchemaContext = React.createContext<VisualSchemaContextValue>({
  widgets: defaultVisualWidgets,
  schemaProvider: defaultProvider,
});
