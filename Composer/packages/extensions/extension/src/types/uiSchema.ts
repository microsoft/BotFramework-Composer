// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { SDKTypes } from '@bfc/shared';

import { FieldWidget } from './form';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type UIOptionFunc<R = any, D = any> = (data: D) => R;

export interface UIOptions {
  'ui:hidden'?: string[] | UIOptionFunc<string[]>;
  'ui:label'?: string | UIOptionFunc<string | undefined> | false;
  'ui:order'?: string[] | UIOptionFunc;
  'ui:field'?: FieldWidget;
  'ui:placeholder'?: string | UIOptionFunc<string, undefined>;
  properties?: {
    [key: string]: UIOptions;
  };
}

export type UISchema = { [key in SDKTypes]?: UIOptions };
