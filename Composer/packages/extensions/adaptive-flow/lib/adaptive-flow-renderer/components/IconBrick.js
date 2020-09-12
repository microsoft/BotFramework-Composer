// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { __assign } from "tslib";
/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import { IconBrickSize } from '../constants/ElementSizes';
export var IconBrick = function (_a) {
    var onClick = _a.onClick, _b = _a.disabled, disabled = _b === void 0 ? false : _b;
    var brickColor = disabled ? 'transparent' : '#FFFFFF';
    var iconColor = disabled ? '#ddd' : '#FED9CC';
    return (jsx("div", { css: __assign(__assign({}, IconBrickSize), { background: brickColor, boxShadow: '0px 0.6px 1.8px rgba(0, 0, 0, 0.108), 0px 3.2px 7.2px rgba(0, 0, 0, 0.132)', borderRadius: '2px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }), "data-testid": "IconBrick", onClick: function (e) {
            e.stopPropagation();
            onClick(e);
        } },
        jsx("div", { css: {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: iconColor,
                width: 16,
                height: 16,
                borderRadius: '8px',
            } },
            jsx(Icon, { iconName: "ErrorBadge", style: { fontSize: 8 } }))));
};
//# sourceMappingURL=IconBrick.js.map