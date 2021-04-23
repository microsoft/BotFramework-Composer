// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { version1To2 } from './version1To2';

type BreakingUpdateResult = { breaking: boolean; uxId: string };
type BreakingUpdatePredicate = (curVersion: string, newVersion: string) => BreakingUpdateResult;

/**
 * Array of functions that will check the current version and latest version during an update to determine
 * if the user is about to install a breaking update. If any of these checks is satisfied, the client will
 * display custom UX for the offending update before allowing the user to proceed with the standard
 * update flow.
 */
export const breakingUpdates: BreakingUpdatePredicate[] = [version1To2];
