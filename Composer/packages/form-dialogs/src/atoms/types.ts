// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export type ThemeName = 'light' | 'dark';

export type SchemaPropertyKind = 'ref' | 'number' | 'string' | 'array';

export type RefPropertyPayload = TypedPropertyPayload & {
  ref: string;
};

export type TypedPropertyPayload = {
  kind: SchemaPropertyKind;
  entities?: string[];
};

const builtInFormats = ['data-time', 'date', 'time', 'email', 'uri', 'iri'] as const;

export type BuiltInStringFormat = typeof builtInFormats[number];

export type StringFormatItem = { displayName: string; value: BuiltInStringFormat };

export const builtInStringFormats: readonly StringFormatItem[] = [
  { displayName: 'Date time', value: 'data-time' },
  { displayName: 'Date', value: 'date' },
  { displayName: 'Time', value: 'time' },
  { displayName: 'Email', value: 'email' },
  { displayName: 'URI', value: 'uri' },
  { displayName: 'IRI', value: 'iri' },
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

export type ArrayPropertyPayload = Pick<TypedPropertyPayload, 'kind'> & {
  kind: 'array';
  items:
    | (NumberPropertyPayload & { maxItems?: number })
    | (StringPropertyPayload & { maxItems?: number })
    | RefPropertyPayload;
};

export type FormDialogPropertyPayload =
  | RefPropertyPayload
  | StringPropertyPayload
  | NumberPropertyPayload
  | ArrayPropertyPayload;

export type FormDialogProperty = {
  id: string;
  kind: SchemaPropertyKind;
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
