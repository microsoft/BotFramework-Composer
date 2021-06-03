// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { LgTemplate } from '@botframework-composer/types';

export interface LGOption {
  projectId?: string;
  fileId: string;
  templateId?: string;
  template?: LgTemplate;
}

export interface LUOption {
  projectId?: string;
  fileId: string;
  sectionId?: string;
  luFeatures: any;
}
