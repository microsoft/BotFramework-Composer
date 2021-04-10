// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export type ParsedLgTemplate = {
  body: Record<string, any>;
  displayName?: string;
  name?: string;
};

export type Mode = 'create' | 'edit';
