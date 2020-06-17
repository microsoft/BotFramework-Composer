// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
var _a;
import { ObiFieldNames } from '../constants/ObiFieldNames';
import { ObiTypes } from '../constants/ObiTypes';
var DEFAULT_CHILDREN_KEYS = [ObiFieldNames.Actions];
var childrenMap =
  ((_a = {}),
  (_a[ObiTypes.AdaptiveDialog] = [ObiFieldNames.Actions]),
  (_a[ObiTypes.IfCondition] = [ObiFieldNames.Actions, ObiFieldNames.ElseActions]),
  (_a[ObiTypes.SwitchCondition] = [ObiFieldNames.Cases, ObiFieldNames.DefaultCase]),
  _a);
export function outlineObiJson(input) {
  if (!input) return {};
  var outline = {};
  var childrenKeys = DEFAULT_CHILDREN_KEYS;
  if (input.$kind && childrenMap[input.$kind]) {
    childrenKeys = childrenMap[input.$kind];
  }
  outline.$kind = input.$kind;
  for (var _i = 0, childrenKeys_1 = childrenKeys; _i < childrenKeys_1.length; _i++) {
    var childrenKey = childrenKeys_1[_i];
    var children = input[childrenKey];
    if (Array.isArray(children)) {
      outline[childrenKey] = children.map(function (x) {
        return outlineObiJson(x);
      });
    } else {
      outline[childrenKey] = [];
    }
  }
  return outline;
}
//# sourceMappingURL=outlineObiJson.js.map
