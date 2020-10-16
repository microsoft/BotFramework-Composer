// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export interface LGOption {
  projectId?: string;
  fileId: string;
  templateId?: string;
}

export interface LUOption {
  projectId?: string;
  fileId: string;
  sectionId?: string;
  luFeatures: any;
}
