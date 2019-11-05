// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { DesignerData } from '../types';

export interface ExternalApi {
  getDesignerId: (data?: DesignerData) => DesignerData;
  copyLgTemplate: (lgTemplate: string) => Promise<string>;
}
