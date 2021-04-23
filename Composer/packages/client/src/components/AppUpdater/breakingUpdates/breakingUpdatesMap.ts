// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';

import { BreakingUpdateProps } from './types';
import { Version1To2Content } from './version1To2';

/**
 * A map of breaking update identifiers to the React components responsible
 * for showing each breaking update's special UX before proceeding to the
 * standard update flow.
 *
 * Ex.  'Version2.5.xTo3.x.x': DialogWithDisclaimerAndDocsAboutNewChanges
 */

// TODO: update 'string' to more specific 'BreakingUpdateUXIdentifier'
export const breakingUpdatesMap: Record<string, React.FC<BreakingUpdateProps>> = {
  'Version1.x.xTo2.x.x': Version1To2Content,
};
