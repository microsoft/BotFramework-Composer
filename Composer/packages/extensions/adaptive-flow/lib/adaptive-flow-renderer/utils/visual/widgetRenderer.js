// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { __assign, __rest } from "tslib";
import React from 'react';
export var renderUIWidget = function (widgetSchema, widgetMap, context) {
    var parseWidgetSchema = function (widgetSchema) {
        var widget = widgetSchema.widget, props = __rest(widgetSchema, ["widget"]);
        if (typeof widget === 'string') {
            var widgetName = widget;
            return {
                Widget: widgetMap[widgetName] || (function () { return React.createElement(React.Fragment, null); }),
                props: props,
            };
        }
        return {
            Widget: widget,
            props: props,
        };
    };
    var buildWidgetProp = function (rawPropValue, context) {
        if (typeof rawPropValue === 'function') {
            var dataTransformer = rawPropValue;
            var element = dataTransformer(context.data);
            return element;
        }
        // handle recursive widget def
        if (typeof rawPropValue === 'object' && rawPropValue.widget) {
            var widgetSchema_1 = rawPropValue;
            return renderUIWidget(widgetSchema_1, widgetMap, context);
        }
        return rawPropValue;
    };
    var _a = parseWidgetSchema(widgetSchema), Widget = _a.Widget, rawProps = _a.props;
    var widgetProps = Object.keys(rawProps).reduce(function (props, propName) {
        var propValue = rawProps[propName];
        props[propName] = buildWidgetProp(propValue, context);
        return props;
    }, {});
    return React.createElement(Widget, __assign({}, context, widgetProps));
};
//# sourceMappingURL=widgetRenderer.js.map