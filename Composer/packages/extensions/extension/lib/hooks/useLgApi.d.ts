import { BaseSchema, ShellApi } from '@bfc/shared';
/**
 * LG CRUD lib
 */
export declare const useLgApi: (
  shellApi: ShellApi
) => {
  createLgTemplate: (
    lgFileId: string,
    lgText: string,
    hostActionId: string,
    hostActionData: BaseSchema,
    hostFieldName: string
  ) => Promise<string>;
  readLgTemplate: (lgFileId: string, lgText: string) => string;
  deleteLgTemplate: (lgFileId: string, lgTemplate: string) => Promise<void>;
  deleteLgTemplates: (lgFileId: string, lgTemplates: string[]) => Promise<void>;
};
//# sourceMappingURL=useLgApi.d.ts.map
