// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export type PropertyRequiredKind = 'required' | 'optional';

export type FormDialogPropertyKind = 'ref';
// chrimc | 'number' | 'integer' | 'string' | 'array';

export type RefPropertyPayload = TypedPropertyPayload & {
  ref: string;
};

export type TypedPropertyPayload = {
  kind: FormDialogPropertyKind;
  entities?: string[];
};

// chrimc const builtInFormats = ['date-time', 'date', 'time', 'email', 'uri', 'iri'] as const;

// chrimc export type BuiltInStringFormat = typeof builtInFormats[number];

// chrimc export type StringFormatItem = { displayName: string; value: BuiltInStringFormat };

/* chrimc
export const builtInStringFormats: readonly StringFormatItem[] = [
  { displayName: 'date-time', value: 'date-time' },
  { displayName: 'date', value: 'date' },
  { displayName: 'time', value: 'time' },
  { displayName: 'email', value: 'email' },
  { displayName: 'uri', value: 'uri' },
  { displayName: 'iri', value: 'iri' },
];
*/

/*
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
*/

export type ArrayPropertyPayload = Pick<TypedPropertyPayload, 'kind'> & {
  kind: 'array';
  items: /* chrimc | (IntegerPropertyPayload & { maxItems?: number })
    | (NumberPropertyPayload & { maxItems?: number })
    | (StringPropertyPayload & { maxItems?: number })
    | */
  RefPropertyPayload;
};

export type FormDialogPropertyPayload =
  | RefPropertyPayload
  /* chrimc
  | StringPropertyPayload
  | NumberPropertyPayload
  | IntegerPropertyPayload
  */
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
