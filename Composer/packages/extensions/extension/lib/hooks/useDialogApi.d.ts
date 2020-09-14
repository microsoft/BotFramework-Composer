import { ShellApi } from '@bfc/shared';
export declare const useDialogApi: (
  shellApi: ShellApi
) => {
  createDialog: () => Promise<string | null>;
  readDialog: (dialogId: string) => any;
  updateDialog: (dialogId: string, newDialogData: any) => any;
};
//# sourceMappingURL=useDialogApi.d.ts.map
