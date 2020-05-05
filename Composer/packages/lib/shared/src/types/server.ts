// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  path: string; // absolute path
  tags?: string[]; // tags for further grouping and search secenario
  support?: string[]; // list of supported runtime versions
}
