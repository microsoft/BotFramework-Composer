// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { AdaptiveKinds } from '../../constants/AdaptiveKinds';
export function normalizeObiStep(data) {
    var step = data;
    // Grammar sugar provide by OBI runtime.
    if (typeof data === 'string') {
        step = {
            $kind: AdaptiveKinds.BeginDialog,
            dialog: step,
        };
    }
    return step;
}
//# sourceMappingURL=stepBuilder.js.map