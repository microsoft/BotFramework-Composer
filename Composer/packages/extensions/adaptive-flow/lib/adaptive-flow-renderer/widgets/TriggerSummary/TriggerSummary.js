// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/** @jsx jsx */
import { conceptLabels } from '@bfc/shared';
import { jsx } from '@emotion/core';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import get from 'lodash/get';
import { triggerContainerStyle, triggerContentStyle, titleStyle, subtitleStyle, triggerIconStyle, titleContentStyle, } from './triggerStyles';
function getLabel(data) {
    var labelOverrides = conceptLabels()[data.$kind];
    if (labelOverrides) {
        return labelOverrides.subtitle || labelOverrides.title;
    }
    return data.$kind;
}
function getName(data) {
    return (data.intent ||
        get(data, '$designer.name', conceptLabels()[data.$kind] ? conceptLabels()[data.$kind].title : data.$kind));
}
export var TriggerSummary = function (_a) {
    var data = _a.data, _b = _a.onClick, onClick = _b === void 0 ? function () { } : _b;
    var name = getName(data);
    var label = getLabel(data);
    return (jsx("div", { css: triggerContainerStyle },
        jsx("div", { css: triggerContentStyle },
            jsx("div", { css: titleStyle },
                jsx(Icon, { iconName: "Flow", style: triggerIconStyle }),
                jsx("h1", { css: titleContentStyle }, name)),
            jsx("div", { className: "trigger__content-label", css: subtitleStyle }, label))));
};
//# sourceMappingURL=TriggerSummary.js.map