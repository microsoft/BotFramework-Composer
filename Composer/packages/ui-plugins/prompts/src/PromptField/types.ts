// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { FieldProps } from '@bfc/extension';
import { MicrosoftInputDialog, ChoiceInput, ConfirmInput } from '@bfc/shared';
import { JSONSchema4 } from 'json-schema';

export type InputDialogKeys = keyof MicrosoftInputDialog | keyof ChoiceInput | keyof ConfirmInput;
export type PromptFieldChangeHandler = (field: InputDialogKeys) => (data: any) => void;
export type GetSchema = (field: InputDialogKeys) => JSONSchema4;

export interface PromptFieldProps<T = any> extends Omit<FieldProps<T>, 'onChange'> {
  onChange: PromptFieldChangeHandler;
  getSchema: GetSchema;
}
