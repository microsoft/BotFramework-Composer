// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  /** Absolute path of the template */
  path?: string;
  /** Optional order property */
  order?: number;
}
