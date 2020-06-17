import React from 'react';
import { ShellApi, DialogFactory, OBISchema } from '@bfc/shared';
declare type ShellApiFuncs =
  | 'getLgTemplates'
  | 'copyLgTemplate'
  | 'removeLgTemplate'
  | 'removeLgTemplates'
  | 'updateLgTemplate'
  | 'removeLuIntent';
export interface NodeRendererContextValue extends Pick<ShellApi, ShellApiFuncs> {
  focusedId?: string;
  focusedEvent?: string;
  focusedTab?: string;
  clipboardActions: any[];
  dialogFactory: DialogFactory;
  customSchemas: OBISchema[];
}
export declare const NodeRendererContext: React.Context<NodeRendererContextValue>;
export {};
//# sourceMappingURL=NodeRendererContext.d.ts.map
