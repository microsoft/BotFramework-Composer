// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { MicrosoftIRecognizer, SDKKinds, SDKRoles, ShellApi, ShellData } from '@bfc/types';

import { FieldWidget } from './form';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type UIOptionValue<R = string, D = any> = R | UIOptionFunc<R, D>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type UIOptionFunc<R, D> = (data: D) => R;

export interface Fieldset {
  title: UIOptionValue<string>;
  fields?: string[];
  defaultExpanded?: boolean;
  itemKey?: string;
}

export interface UIOptions {
  /** Specifies if the property is an additional field */
  additionalField?: true;
  /** Description override. */
  description?: UIOptionValue<string | undefined>;
  /** Field widget override. */
  field?: FieldWidget;
  /** Url to docs. Rendered below field description. */
  helpLink?: string;
  /** Hide errors in SchemaField */
  hideError?: boolean;
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
  /** Organizes fields into collapsible sets */
  fieldsets?: Fieldset[];
  /** Label override. */
  label?: UIOptionValue<string | false | undefined>;
  /** Set order of fields. Use * for all other fields. */
  order?: UIOptionValue<(string | [string, string])[]>;
  /** Renders fieldsets in a tabbed view when true */
  pivotFieldsets?: true;
  /** Placeholder override. If undefined, schema.examples are used. */
  placeholder?: UIOptionValue<string, undefined>;
  /** Define ui options on fields that are children of this field. */
  properties?: {
    [key: string]: UIOptions;
  };
  /** Use the serializer to apply additional data processing.
   * `get` is called to retrieve the value that is passed to SchemaField
   * `set` is called prior to the `onChange` handler  */
  serializer?: {
    get: (value: any) => any;
    set: (value: any) => any;
  };
  /** subtitle rendered in form title, defaults to schema.$kind */
  subtitle?: UIOptionValue<string>;
  intellisenseScopes?: string[];
}

export type RoleSchema = { [key in SDKRoles]?: Omit<UIOptions, 'properties'> };
export type FormUISchema = { [key in SDKKinds]?: UIOptions };
export type RecognizerSchema = {
  /** Unique id to identify recognizer (SDK $kind) */
  id: string;
  /** If is default, will be used as dropdown's default selection */
  default?: boolean;
  /** If disabled, cannot be selected from dropdown */
  disabled?: boolean;
  /** Display name used in the UI. Recommended to use function over static string to enable multi-locale feature. */
  displayName: UIOptionValue<string>;
  /** An inline editor to edit an intent. If none provided, users will not be able to edit. */
  intentEditor?: FieldWidget;
  /** A function invoked with the form data to determine if this is the currently selected recognizer */
  isSelected?: (data: any) => boolean;
  /** Invoked when constructing a new recognizer instance.
   *  Make sure the instance can be recognized either by $kind or isSelected().
   */
  seedNewRecognizer?: (shellData: ShellData, shellApi: ShellApi) => MicrosoftIRecognizer | any;
  /** An inline editor to edit recognizer value. If none provided, users will not be able to edit its value. */
  recognizerEditor?: FieldWidget;
  /** Function to rename an intent */
  renameIntent?: (
    intentName: string,
    newIntentName: string,
    shellData: ShellData,
    shellApi: ShellApi
  ) => Promise<void> | void;
};
