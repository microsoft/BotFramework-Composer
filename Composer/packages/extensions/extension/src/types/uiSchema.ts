// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { SDKTypes, SDKRoles, ShellApi, ShellData } from '@bfc/shared';

import { FieldWidget, FieldProps } from './form';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type UIOptionValue<R = string, D = any> = R | UIOptionFunc<R, D>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type UIOptionFunc<R, D> = (data: D) => R;

export interface UIOptions {
  /** Description override. */
  description?: UIOptionValue<string | undefined>;
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
  hidden?: UIOptionValue<string[]>;
  /** Label override. */
  label?: UIOptionValue<string | false | undefined>;
  /** Set order of fields. Use * for all other fields. */
  order?: UIOptionValue<(string | [string, string])[]>;
  /** Placeholder override. If undefined, schema.examples are used. */
  placeholder?: UIOptionValue<string, undefined>;
  /** Define ui options on fields that are children of this field. */
  properties?: {
    [key: string]: UIOptions;
  };
  /** subtitle rendered in form title */
  subtitle?: UIOptionValue<string>;
}

export type RoleSchema = { [key in SDKRoles]?: Omit<UIOptions, 'properties'> };
export type UISchema = { [key in SDKTypes]?: UIOptions };
export type RecognizerSchema = {
  /** Unique id to identify recognizer (SDK $kind) */
  id: string;
  /** Display name used in the UI */
  displayName: UIOptionValue<string>;
  /** An inline editor to edit an intent. If none provided, users will not be able to edit. */
  editor?: FieldWidget;
  /** A function invoked with the form data to determine if this is the currently selected recognizer */
  isSelected: (data: any) => boolean;
  /** Invoked when changing the recognizer type */
  handleRecognizerChange: (fieldProps: FieldProps, shellData: ShellData, shellApi: ShellApi) => void;
};
