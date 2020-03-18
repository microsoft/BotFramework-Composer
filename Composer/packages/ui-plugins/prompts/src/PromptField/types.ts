// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { FieldProps, JSONSchema7 } from '@bfc/extension';
import { MicrosoftInputDialog, ChoiceInput, ConfirmInput } from '@bfc/shared';

export type InputDialogKeys = keyof MicrosoftInputDialog | keyof ChoiceInput | keyof ConfirmInput;
export type PromptFieldChangeHandler = (field: InputDialogKeys) => (data: any) => void;
export type GetSchema = (field: InputDialogKeys) => JSONSchema7;
export type GetError = (field: InputDialogKeys) => string | string[] | undefined;

export interface PromptFieldProps<T = any> extends Omit<FieldProps<T>, 'onChange'> {
  onChange: PromptFieldChangeHandler;
  getSchema: GetSchema;
  getError: GetError;
}
