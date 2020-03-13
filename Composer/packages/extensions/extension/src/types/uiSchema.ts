// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { SDKTypes, SDKRoles, ShellApi, ShellData } from '@bfc/shared';

import { FieldWidget, FieldProps } from './form';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type UIOptionFunc<R = any, D = any> = (data: D) => R;

export interface UIOptions {
  /* Array field override */
  arrayField?: FieldWidget;
  /** Description override. */
  description?: string | UIOptionFunc<string | undefined>;
  /** Field widget override. */
  field?: FieldWidget;
  /** Url to docs. Rendered below field description. */
  helpLink?: string;
  /**
   * Fields to hide in the form. A function can be used to dynamically hide/show fields.
   * @example
   * (data) => {
   *   if (data.someProperty === '42') {
   *     return ['someOtherProperty'];
   *   }
   * }
   */
  hidden?: string[] | UIOptionFunc<string[]>;
  /** Label override. */
  label?: string | UIOptionFunc<string | undefined> | false;
  /** Set order of fields. Use * for all other fields. */
  order?: (string | [string, string])[] | UIOptionFunc<(string | [string, string])[]>;
  /** Placeholder override. If undefined, schema.examples are used. */
  placeholder?: string | UIOptionFunc<string, undefined>;
  /** Define ui options on fields that are children of this field. */
  properties?: {
    [key: string]: UIOptions;
  };
}

export type RoleSchema = { [key in SDKRoles]?: Omit<UIOptions, 'properties'> };
export type UISchema = { [key in SDKTypes]?: UIOptions };
export type RecognizerSchema = {
  /** Unique id to identify recognizer (SDK $kind) */
  id: string;
  /** Display name used in the UI */
  displayName: string | UIOptionFunc<string>;
  /** An inline editor to edit an intent. If none provided, users will not be able to edit. */
  editor?: FieldWidget;
  /** A function invoked with the form data to determine if this is the currently selected recognizer */
  isSelected: (data: any) => boolean;
  /** Invoked when changing the recognizer type */
  handleRecognizerChange: (fieldProps: FieldProps, shellData: ShellData, shellApi: ShellApi) => void;
};
