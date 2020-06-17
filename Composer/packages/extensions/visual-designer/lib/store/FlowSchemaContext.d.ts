import React from 'react';
import { FlowEditorWidgetMap } from '@bfc/extension';
import { FlowSchemaProvider } from '../schema/flowSchemaProvider';
export interface FlowSchemaContextValue {
  widgets: FlowEditorWidgetMap;
  schemaProvider: FlowSchemaProvider;
}
export declare const FlowSchemaContext: React.Context<FlowSchemaContextValue>;
//# sourceMappingURL=FlowSchemaContext.d.ts.map
