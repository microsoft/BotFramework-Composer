// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { AdaptiveKinds } from '../constants/AdaptiveKinds';
import { IndexedNode } from '../models/IndexedNode';
import { normalizeObiStep } from '../utils/adaptive/stepBuilder';
import { inheritParentProperties } from './inheritParentProperty';
export function transformStepGroup(input, groupId) {
    if (!input || input.$kind !== AdaptiveKinds.StepGroup)
        return [];
    if (!input.children || !Array.isArray(input.children))
        return [];
    var results = input.children.map(function (step, index) { return new IndexedNode(groupId + "[" + index + "]", normalizeObiStep(step)); });
    inheritParentProperties(input, results);
    return results;
}
//# sourceMappingURL=transformStepGroup.js.map