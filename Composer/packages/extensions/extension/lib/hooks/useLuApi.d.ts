import { LuIntentSection, BaseSchema, ShellApi } from '@bfc/shared';
/**
 * LU CRUD API
 */
export declare const useLuApi: (
  shellApi: ShellApi
) => {
  createLuIntent: (
    luFildId: string,
    intent: LuIntentSection | undefined,
    hostResourceId: string,
    hostResourceData: BaseSchema
  ) => Promise<string | undefined>;
  readLuIntent: (luFileId: string, hostResourceId: string, hostResourceData: BaseSchema) => LuIntentSection | undefined;
  deleteLuIntent: (luFileId: string, luIntent: string) => Promise<void[]>;
  deleteLuIntents: (luFileId: string, luIntents: string[]) => Promise<void[]>;
};
//# sourceMappingURL=useLuApi.d.ts.map
