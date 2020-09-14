// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { __assign } from "tslib";
import { AdaptiveFieldNames } from '../constants/AdaptiveFieldNames';
import { AdaptiveKinds } from '../constants/AdaptiveKinds';
import { IndexedNode } from '../models/IndexedNode';
import { inheritParentProperties } from './inheritParentProperty';
var IfBranchKey = AdaptiveFieldNames.Actions;
var ElseBranchKey = AdaptiveFieldNames.ElseActions;
export function transformIfCondtion(input, jsonpath) {
    if (!input || input.$kind !== AdaptiveKinds.IfCondition)
        return null;
    var result = {
        condition: new IndexedNode("" + jsonpath, __assign(__assign({}, input), { $kind: AdaptiveKinds.ConditionNode })),
        choice: new IndexedNode("" + jsonpath, {
            $kind: AdaptiveKinds.ChoiceDiamond,
            text: input.condition,
        }),
        ifGroup: new IndexedNode(jsonpath + "." + IfBranchKey, {
            $kind: AdaptiveKinds.StepGroup,
            children: input[IfBranchKey] || [],
        }),
        elseGroup: new IndexedNode(jsonpath + "." + ElseBranchKey, {
            $kind: AdaptiveKinds.StepGroup,
            children: input[ElseBranchKey] || [],
        }),
    };
    inheritParentProperties(input, Object.values(result));
    return result;
}
//# sourceMappingURL=transformIfCondition.js.map