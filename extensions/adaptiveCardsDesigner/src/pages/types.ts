// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { LgTemplate } from '@botframework-composer/types';

export type ParsedLgTemplate = Omit<LgTemplate, 'parameters' | 'range' | 'properties' | 'body'> & {
  body: Record<string, any>;
};

export type Mode = 'create' | 'edit';
