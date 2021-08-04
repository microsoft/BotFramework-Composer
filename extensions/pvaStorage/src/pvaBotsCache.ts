// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { CachedPVABot } from './types';

/** Per-session cache of PVA bots that have been opened / downloaded. */
export const PVABotsCache: Record<string, CachedPVABot> = {};
