// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { __spreadArrays } from "tslib";
import { AdaptiveFieldNames } from '../constants/AdaptiveFieldNames';
import { AdaptiveKinds } from '../constants/AdaptiveKinds';
import { IndexedNode } from '../models/IndexedNode';
import { normalizeObiStep } from '../utils/adaptive/stepBuilder';
var Events = AdaptiveFieldNames.Events, Actions = AdaptiveFieldNames.Actions;
function transformSimpleDialog(input) {
    if (!input)
        return null;
    var rules = input[Events] || [];
    var steps = input[Actions] || [];
    var ruleGroup = new IndexedNode(Events, {
        $kind: AdaptiveKinds.RuleGroup,
        children: __spreadArrays(rules),
    });
    var stepGroup = new IndexedNode(Actions, {
        $kind: AdaptiveKinds.StepGroup,
        children: steps.map(function (x) { return normalizeObiStep(x); }),
    });
    return {
        ruleGroup: ruleGroup,
        stepGroup: stepGroup,
    };
}
export function transformRootDialog(input) {
    return transformSimpleDialog(input);
}
//# sourceMappingURL=transformRootDialog.js.map