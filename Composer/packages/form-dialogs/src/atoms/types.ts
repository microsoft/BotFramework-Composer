// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export type PropertyRequiredKind = 'required' | 'optional';

export type FormDialogPropertyKind = 'ref' | 'number' | 'integer' | 'string' | 'array';

export type RefPropertyPayload = TypedPropertyPayload & {
  ref: string;
};

export type TypedPropertyPayload = {
  kind: FormDialogPropertyKind;
  entities?: string[];
};

const builtInFormats = ['date-time', 'date', 'time', 'email', 'uri', 'iri'] as const;

export type BuiltInStringFormat = typeof builtInFormats[number];

export type StringFormatItem = { displayName: string; value: BuiltInStringFormat };

export const builtInStringFormats: readonly StringFormatItem[] = [
  { displayName: 'date-time', value: 'date-time' },
  { displayName: 'date', value: 'date' },
  { displayName: 'time', value: 'time' },
  { displayName: 'email', value: 'email' },
  { displayName: 'uri', value: 'uri' },
  { displayName: 'iri', value: 'iri' },
];

export type StringPropertyPayload = TypedPropertyPayload & {
  kind: 'string';
  enums?: string[];
  pattern?: string;
  format?: BuiltInStringFormat;
};

export type NumberPropertyPayload = TypedPropertyPayload & {
  kind: 'number';
  minimum: number;
  maximum: number;
};

export type IntegerPropertyPayload = TypedPropertyPayload & {
  kind: 'integer';
  minimum: number;
  maximum: number;
};

export type ArrayPropertyPayload = Pick<TypedPropertyPayload, 'kind'> & {
  kind: 'array';
  items:
    | (IntegerPropertyPayload & { maxItems?: number })
    | (NumberPropertyPayload & { maxItems?: number })
    | (StringPropertyPayload & { maxItems?: number })
    | RefPropertyPayload;
};

export type FormDialogPropertyPayload =
  | RefPropertyPayload
  | StringPropertyPayload
  | NumberPropertyPayload
  | IntegerPropertyPayload
  | ArrayPropertyPayload;

export type FormDialogProperty = {
  id: string;
  kind: FormDialogPropertyKind;
  name: string;
  payload: FormDialogPropertyPayload;
  required: boolean;
  array: boolean;
  examples: string[];
};

export type FormDialogSchema = {
  id: string;
  name: string;
  requiredPropertyIds: string[];
  optionalPropertyIds: string[];
};
