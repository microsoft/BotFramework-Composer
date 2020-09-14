import { BaseSchema, ShellApi } from '@bfc/shared';
export interface DialogApiContext {
  copyAction: (actionId: string) => BaseSchema;
  deleteAction: (actionId: BaseSchema) => BaseSchema;
  copyActions: (actionIds: string[]) => BaseSchema[];
  deleteActions: (actionIds: BaseSchema[]) => BaseSchema[];
}
export declare function useDialogEditApi(
  shellApi: ShellApi
): {
  insertAction: (
    dialogId: string,
    dialogData: any,
    targetArrayPath: string,
    targetArrayPosition: number,
    actionToInsert: BaseSchema
  ) => Promise<any>;
  insertActions: (
    dialogId: string,
    dialogData: any,
    targetArrayPath: string,
    targetArrayPosition: number,
    actionsToInsert: BaseSchema[]
  ) => Promise<any>;
  insertActionsAfter: (
    dialogId: string,
    dialogData: any,
    targetId: string,
    actionsToInsert: BaseSchema[]
  ) => Promise<any>;
  deleteSelectedAction: (dialogId: any, dialogData: any, actionId: string) => any;
  deleteSelectedActions: (dialogId: string, dialogData: any, actionIds: string[]) => any;
  copySelectedActions: (dialogId: any, dialogData: any, actionIds: string[]) => Promise<any[]>;
  cutSelectedActions: (
    dialogId: any,
    dialogData: any,
    actionIds: string[]
  ) => Promise<{
    dialog: any;
    cutActions: any[];
  }>;
  updateRecognizer: (dialogId: any, dialogData: any, recognizer: any) => any;
  disableSelectedActions: (dialogId: string, dialogData: any, actionIds: string[]) => any;
  enableSelectedActions: (dialogId: string, dialogData: any, actionIds: string[]) => any;
};
//# sourceMappingURL=useDialogEditApi.d.ts.map
