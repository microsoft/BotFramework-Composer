// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import isEqual from 'lodash/isEqual';
import { outlineObiJson } from './outlineObiJson';
export function isLayoutEqual(value, other) {
  var valueOutline = outlineObiJson(value);
  var otherOutline = outlineObiJson(other);
  return isEqual(valueOutline, otherOutline);
}
//# sourceMappingURL=isLayoutEqual.js.map
