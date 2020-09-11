"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FieldLabel = void 0;
var tslib_1 = require("tslib");
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/** @jsx jsx */
var core_1 = require("@emotion/core");
var Tooltip_1 = require("office-ui-fabric-react/lib/Tooltip");
var Icon_1 = require("office-ui-fabric-react/lib/Icon");
var Label_1 = require("office-ui-fabric-react/lib/Label");
var fluent_theme_1 = require("@uifabric/fluent-theme");
var format_message_1 = tslib_1.__importDefault(require("format-message"));
var Link_1 = require("./Link");
var sharedStyles_1 = require("./sharedStyles");
var DescriptionCallout = function DescriptionCallout(props) {
    var description = props.description, title = props.title, helpLink = props.helpLink;
    if (!description) {
        return null;
    }
    return (core_1.jsx(Tooltip_1.TooltipHost, { delay: Tooltip_1.TooltipDelay.zero, directionalHint: Tooltip_1.DirectionalHint.bottomAutoEdge, styles: { root: { display: 'inline-block' } }, tooltipProps: {
            styles: { root: { width: '288px', padding: '17px 28px' } },
            onRenderContent: function () { return (core_1.jsx("div", null,
                core_1.jsx("h3", { "aria-label": title + '.', style: { fontSize: '20px', margin: '0', marginBottom: '10px' } }, title),
                core_1.jsx("p", null, description),
                helpLink && (core_1.jsx(Link_1.Link, { "aria-label": format_message_1.default('Learn more about {title}', { title: title.toLowerCase() }), href: helpLink, rel: "noopener noreferrer", target: "_blank" }, format_message_1.default('Learn more'))))); },
        } },
        core_1.jsx("div", { css: sharedStyles_1.focusBorder, "data-testid": "FieldLabelDescriptionIcon", tabIndex: 0 },
            core_1.jsx(Icon_1.Icon, { "aria-label": title + '; ' + description, iconName: 'Unknown', styles: {
                    root: {
                        width: '16px',
                        minWidth: '16px',
                        height: '16px',
                        color: fluent_theme_1.NeutralColors.gray160,
                        fontSize: '12px',
                        marginBottom: '-2px',
                        paddingLeft: '4px',
                        paddingTop: '4px',
                    },
                } }))));
};
var FieldLabel = function (props) {
    var label = props.label, description = props.description, id = props.id, inline = props.inline, helpLink = props.helpLink, required = props.required;
    if (!label) {
        return null;
    }
    return (core_1.jsx("div", { style: {
            display: 'flex',
            alignItems: 'center',
        } },
        core_1.jsx(Label_1.Label, { htmlFor: id, required: required, styles: {
                root: {
                    fontWeight: '400',
                    marginLeft: inline ? '4px' : '0',
                    selectors: {
                        '::after': {
                            paddingRight: 0,
                        },
                    },
                },
            } }, label),
        core_1.jsx(DescriptionCallout, { description: description, helpLink: helpLink, id: id, title: label })));
};
exports.FieldLabel = FieldLabel;
//# sourceMappingURL=FieldLabel.js.map