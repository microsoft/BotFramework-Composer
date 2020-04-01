import { MicrosoftInputDialog, ChoiceInput, ConfirmInput, OBISchema } from '@bfc/shared';
export declare type InputDialogKeys = keyof MicrosoftInputDialog | keyof ChoiceInput | keyof ConfirmInput;
export declare type PromptFieldChangeHandler = (field: InputDialogKeys) => (data: any) => void;
export declare type GetSchema = (field: InputDialogKeys) => OBISchema;
//# sourceMappingURL=types.d.ts.map
