// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { AdaptiveFieldNames } from '../constants/AdaptiveFieldNames';
import { AdaptiveKinds } from '../constants/AdaptiveKinds';
import { IndexedNode } from '../models/IndexedNode';
import { normalizeObiStep } from '../utils/adaptive/stepBuilder';
export function transformObiRules(input, parentPath) {
    if (parentPath === void 0) { parentPath = ''; }
    if (!input)
        return null;
    var prefix = parentPath ? parentPath + '.' : '';
    var steps = input[AdaptiveFieldNames.Actions] || [];
    var stepGroup = new IndexedNode("" + prefix + AdaptiveFieldNames.Actions, {
        $kind: AdaptiveKinds.StepGroup,
        children: steps.map(function (x) { return normalizeObiStep(x); }),
    });
    return {
        stepGroup: stepGroup,
    };
}
//# sourceMappingURL=transformObiRules.js.map