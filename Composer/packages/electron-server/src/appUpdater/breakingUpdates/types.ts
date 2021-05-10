// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { BreakingUpdateId } from '@botframework-composer/types';

type BreakingUpdateResult = { breaking: boolean; uxId: BreakingUpdateId };
export type BreakingUpdatePredicate = (curVersion: string, newVersion: string) => BreakingUpdateResult;
