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
export declare const defaultRendererContextValue: {
  focusedId: string;
  focusedEvent: string;
  focusedTab: string;
  clipboardActions: never[];
  dialogFactory: DialogFactory;
  customSchemas: never[];
};
export declare const NodeRendererContext: React.Context<NodeRendererContextValue>;
//# sourceMappingURL=NodeRendererContext.d.ts.map
