// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { AttrNames } from '../../constants/ElementAttributes';
var SelectorElement = /** @class */ (function () {
    function SelectorElement(element) {
        this.isSelectable = element.getAttribute(AttrNames.SelectableElement);
        this.isNode = element.getAttribute(AttrNames.NodeElement);
        this.isEdgeMenu = element.getAttribute(AttrNames.EdgeMenuElement);
        this.isInlineLinkElement = element.getAttribute(AttrNames.InlineLinkElement);
        this.focusedId = element.getAttribute(AttrNames.FocusedId);
        this.selectedId = element.getAttribute(AttrNames.SelectedId);
        this.tab = element.getAttribute(AttrNames.Tab);
        var elementBounds = element.getBoundingClientRect();
        this.bounds = {
            width: elementBounds.width,
            height: elementBounds.height,
            left: elementBounds.left,
            right: elementBounds.right,
            top: elementBounds.top,
            bottom: elementBounds.bottom,
        };
    }
    SelectorElement.prototype.hasAttribute = function (attrName) {
        return this[attrName];
    };
    return SelectorElement;
}());
export { SelectorElement };
export var Direction;
(function (Direction) {
    Direction[Direction["Up"] = 0] = "Up";
    Direction[Direction["Down"] = 1] = "Down";
    Direction[Direction["Left"] = 2] = "Left";
    Direction[Direction["Right"] = 3] = "Right";
})(Direction || (Direction = {}));
export var BoundRect;
(function (BoundRect) {
    BoundRect["Top"] = "top";
    BoundRect["Bottom"] = "bottom";
    BoundRect["Left"] = "left";
    BoundRect["Right"] = "right";
})(BoundRect || (BoundRect = {}));
export var Axle;
(function (Axle) {
    Axle[Axle["X"] = 0] = "X";
    Axle[Axle["Y"] = 1] = "Y";
})(Axle || (Axle = {}));
//# sourceMappingURL=type.js.map