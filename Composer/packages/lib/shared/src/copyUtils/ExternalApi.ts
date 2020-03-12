// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { DesignerData } from '../types';

export type ExternalResourceHandler<CopiedType> = (
  actionId: string,
  actionData: any,
  resourceFieldName: string,
  resourceValue?: CopiedType
) => CopiedType;

export type ExternalResourceHandlerAsync<CopiedType> = (
  actionId: string,
  actionData: any,
  resourceFieldName: string,
  resourceValue?: CopiedType
) => Promise<CopiedType>;

export interface ExternalApi {
  getDesignerId: (data?: DesignerData) => DesignerData;
  transformLgField: ExternalResourceHandlerAsync<string>;
}
