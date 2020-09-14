import { ShellApi, ShellData } from '@bfc/shared';
import { PluginConfig } from '../types';
interface ShellContext extends ShellData {
  shellApi: ShellApi;
  plugins: PluginConfig;
}
export declare function useShellApi(): ShellContext;
export {};
//# sourceMappingURL=useShellApi.d.ts.map
