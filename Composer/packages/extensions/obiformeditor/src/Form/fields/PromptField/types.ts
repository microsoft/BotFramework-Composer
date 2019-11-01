// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { MicrosoftInputDialog, ChoiceInput, ConfirmInput, OBISchema } from '@bfc/shared';

export type InputDialogKeys = keyof MicrosoftInputDialog | keyof ChoiceInput | keyof ConfirmInput;
export type PromptFieldChangeHandler = (field: InputDialogKeys) => (data: any) => void;
export type GetSchema = (field: InputDialogKeys) => OBISchema;
