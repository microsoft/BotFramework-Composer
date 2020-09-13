import React from 'react';
import { ShellApi, ShellData } from '@bfc/shared';
import { PluginConfig } from './types';
interface ExtensionContext {
  shellApi: ShellApi;
  shellData: ShellData;
  plugins: PluginConfig;
}
declare const ExtensionContext: React.Context<ExtensionContext>;
export default ExtensionContext;
//# sourceMappingURL=extensionContext.d.ts.map
