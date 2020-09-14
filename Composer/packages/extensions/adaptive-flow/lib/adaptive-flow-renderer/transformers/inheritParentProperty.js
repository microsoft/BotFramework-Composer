// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
export var inheritParentProperties = function (parentJson, childNodes) {
  /** inherit the 'disabled' property */
  if (parentJson.disabled === true) {
    // Action.disabled is typed with IExpressionString but could be a boolean.
    // Composer only show disable effects when it's strictly set to static {true}.
    childNodes.forEach(function (node) {
      return (node.json.disabled = true);
    });
  }
};
//# sourceMappingURL=inheritParentProperty.js.map
