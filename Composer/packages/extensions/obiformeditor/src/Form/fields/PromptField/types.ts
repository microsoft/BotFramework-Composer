import { MicrosoftInputDialog, ChoiceInput, ConfirmInput, OBISchema } from 'shared';

export type InputDialogKeys = keyof MicrosoftInputDialog | keyof ChoiceInput | keyof ConfirmInput;
export type PromptFieldChangeHandler = (field: InputDialogKeys) => (data: any) => void;
export type GetSchema = (field: InputDialogKeys) => OBISchema;
