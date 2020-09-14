import React from 'react';
import { FlowEditorWidgetMap } from '@bfc/extension';
import { WidgetSchemaProvider } from '../utils/visual/WidgetSchemaProvider';
export interface SchemaContextValue {
  widgets: FlowEditorWidgetMap;
  schemaProvider: WidgetSchemaProvider;
}
export declare const SchemaContext: React.Context<SchemaContextValue>;
//# sourceMappingURL=SchemaContext.d.ts.map
