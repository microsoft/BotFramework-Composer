// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { __assign, __makeTemplateObject } from "tslib";
/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import { useRef, useContext, useEffect } from 'react';
import { SelectionContext } from '../contexts/SelectionContext';
import { AttrNames } from '../constants/ElementAttributes';
import { ElementWrapperTag, } from '../../adaptive-flow-renderer/types/PluggableComponents.types';
export var ElementWrapper = function (_a) {
    var _b;
    var nodeId = _a.nodeId, tagId = _a.tagId, children = _a.children;
    var divRef = useRef(null);
    var selectedIds = useContext(SelectionContext).selectedIds;
    var elementId = "" + nodeId + tagId;
    var elementAttributes = (_b = {},
        _b[AttrNames.SelectableElement] = true,
        _b[AttrNames.InlineLinkElement] = true,
        _b[AttrNames.SelectedId] = elementId,
        _b);
    var selected = selectedIds.includes(elementId);
    useEffect(function () {
        if (!selected || !divRef.current)
            return;
        var childRef = divRef.current.firstElementChild;
        if (tagId === ElementWrapperTag.Link) {
            // try focus a link
            childRef &&
                typeof childRef.focus === 'function' &&
                childRef.focus();
        }
    });
    return (jsx("div", __assign({ ref: divRef, css: css(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n        display: inline-block;\n      "], ["\n        display: inline-block;\n      "]))) }, elementAttributes), children));
};
var templateObject_1;
//# sourceMappingURL=ElementWrapper.js.map