// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { DesignerData, BaseSchema } from '../types';

export type FieldProcessor<T> = (
  fromActionId: string,
  fromAction: BaseSchema,
  toActionId: string,
  toAction: BaseSchema,
  fieldName: string
) => T;

export type FieldProcessorAsync<T> = (
  fromActionId: string,
  fromAction: BaseSchema,
  toActionId: string,
  toAction: BaseSchema,
  fieldName: string
) => Promise<T>;

export interface ExternalApi {
  getDesignerId: (data?: DesignerData) => DesignerData;
  copyLgField: FieldProcessorAsync<string>;
  copyLuField: FieldProcessorAsync<any>;
}
