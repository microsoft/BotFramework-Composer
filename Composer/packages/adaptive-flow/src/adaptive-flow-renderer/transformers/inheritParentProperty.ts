// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IndexedNode } from '../models/IndexedNode';

export const inheritParentProperties = (parentJson: any, childNodes: IndexedNode[]) => {
  /** inherit the 'disabled' property */
  if (parentJson.disabled === true) {
    // Action.disabled is typed with IExpressionString but could be a boolean.
    // Composer only show disable effects when it's strictly set to static {true}.
    childNodes.forEach((node) => (node.json.disabled = true));
  }
};
