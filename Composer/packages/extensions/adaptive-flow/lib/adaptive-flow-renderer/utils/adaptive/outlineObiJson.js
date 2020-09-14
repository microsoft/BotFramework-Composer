// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
var _a;
import { AdaptiveFieldNames } from '../../constants/AdaptiveFieldNames';
import { AdaptiveKinds } from '../../constants/AdaptiveKinds';
var DEFAULT_CHILDREN_KEYS = [AdaptiveFieldNames.Actions];
var childrenMap =
  ((_a = {}),
  (_a[AdaptiveKinds.AdaptiveDialog] = [AdaptiveFieldNames.Actions]),
  (_a[AdaptiveKinds.IfCondition] = [AdaptiveFieldNames.Actions, AdaptiveFieldNames.ElseActions]),
  (_a[AdaptiveKinds.SwitchCondition] = [AdaptiveFieldNames.Cases, AdaptiveFieldNames.DefaultCase]),
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
