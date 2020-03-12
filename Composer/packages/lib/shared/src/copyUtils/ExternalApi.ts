// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { DesignerData } from '../types';

export type ExternalResourceCopyHandler<CopiedType> = (
  actionId: string,
  actionData: any,
  resourceFieldName: string,
  resourceValue?: CopiedType
) => CopiedType;

export type ExternalResourceCopyHandlerAsync<CopiedType> = (
  actionId: string,
  actionData: any,
  resourceFieldName: string,
  resourceValue?: CopiedType
) => Promise<CopiedType>;

export interface ExternalApi {
  getDesignerId: (data?: DesignerData) => DesignerData;
  copyLgTemplate: ExternalResourceCopyHandlerAsync<string>;
}
