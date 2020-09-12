// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { __assign, __extends, __rest } from "tslib";
/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
var OffsetContainer = /** @class */ (function (_super) {
    __extends(OffsetContainer, _super);
    function OffsetContainer() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    OffsetContainer.prototype.render = function () {
        var _a = this.props, offset = _a.offset, children = _a.children, otherProps = __rest(_a, ["offset", "children"]);
        if (!offset)
            return children;
        return (jsx("div", __assign({ css: [
                {
                    position: 'absolute',
                    left: offset.x,
                    top: offset.y,
                    transitionDuration: '50ms',
                    transitionProperty: 'left, right, top, bottom',
                },
            ], "data-testid": "OffsetContainer" }, otherProps), children));
    };
    return OffsetContainer;
}(React.Component));
export { OffsetContainer };
//# sourceMappingURL=OffsetContainer.js.map