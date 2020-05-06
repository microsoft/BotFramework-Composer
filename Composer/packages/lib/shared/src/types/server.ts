// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  /* absolute path */
  path: string;
  /* tags for further grouping and search secenario */
  tags?: string[];
  /* list of supported runtime versions */
  support?: string[];
}
