import { BaseSchema, ShellApi } from '@bfc/shared';
export declare const useActionApi: (shellApi: ShellApi) => {
    constructAction: (dialogId: string, action: BaseSchema) => Promise<any[]>;
    constructActions: (dialogId: string, actions: BaseSchema[]) => Promise<any[]>;
    copyAction: (dialogId: string, action: BaseSchema) => Promise<any[]>;
    copyActions: (dialogId: string, actions: BaseSchema[]) => Promise<any[]>;
    deleteAction: (dialogId: string, action: BaseSchema) => Promise<void>;
    deleteActions: (dialogId: string, actions: BaseSchema[]) => Promise<void>;
    actionsContainLuIntent: (actions: BaseSchema[]) => boolean;
};
//# sourceMappingURL=useActionApi.d.ts.map