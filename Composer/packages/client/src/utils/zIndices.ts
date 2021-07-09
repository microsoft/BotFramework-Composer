// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ZIndexes } from 'office-ui-fabric-react/lib/Styling';

/**
 * This object keeps track of zIndices use in the app.
 * This will help prevent zIndices competing with each other.
 * Add your z-index value here and use it in the component.
 */
export const zIndices = {
  notificationContainer: ZIndexes.Layer + 2,
  authContainer: ZIndexes.Layer + 1,
  webChatContainer: ZIndexes.Layer,
};
