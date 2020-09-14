"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnsupportedField = void 0;
var tslib_1 = require("tslib");
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/** @jsx jsx */
var core_1 = require("@emotion/core");
var react_1 = tslib_1.__importStar(require("react"));
var Link_1 = require("office-ui-fabric-react/lib/Link");
var omit_1 = tslib_1.__importDefault(require("lodash/omit"));
var styles_1 = require("./styles");
exports.UnsupportedField = function UnsupportedField(props) {
    var _a = react_1.useState(false), showDetails = _a[0], setShowDetails = _a[1];
    return (core_1.jsx(react_1.default.Fragment, null,
        core_1.jsx("div", { css: styles_1.unsupportedField.container, "data-testid": "UnsupportedField" },
            props.label,
            " (Unsupported Field)",
            core_1.jsx(Link_1.Link, { styles: styles_1.unsupportedField.link, onClick: function () { return setShowDetails(function (prev) { return !prev; }); } }, "Toggle Details")),
        core_1.jsx("pre", { css: styles_1.unsupportedField.details(!showDetails), "data-testid": "UnsupportedFieldDetails" },
            "props: ",
            JSON.stringify(omit_1.default(props, ['definitions']), null, 2))));
};
//# sourceMappingURL=UnsupportedField.js.map