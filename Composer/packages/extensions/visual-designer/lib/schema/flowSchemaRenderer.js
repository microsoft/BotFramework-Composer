// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
var __assign =
  (this && this.__assign) ||
  function () {
    __assign =
      Object.assign ||
      function (t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
      };
    return __assign.apply(this, arguments);
  };
var __rest =
  (this && this.__rest) ||
  function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === 'function')
      for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
        if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
      }
    return t;
  };
import React from 'react';
export var renderUIWidget = function (widgetSchema, widgetMap, context) {
  var parseWidgetSchema = function (widgetSchema) {
    var widget = widgetSchema.widget,
      props = __rest(widgetSchema, ['widget']);
    if (typeof widget === 'string') {
      var widgetName = widget;
      return {
        Widget:
          widgetMap[widgetName] ||
          function () {
            return React.createElement(React.Fragment, null);
          },
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
  var _a = parseWidgetSchema(widgetSchema),
    Widget = _a.Widget,
    rawProps = _a.props;
  var widgetProps = Object.keys(rawProps).reduce(function (props, propName) {
    var propValue = rawProps[propName];
    props[propName] = buildWidgetProp(propValue, context);
    return props;
  }, {});
  return React.createElement(Widget, __assign({}, context, widgetProps));
};
//# sourceMappingURL=flowSchemaRenderer.js.map
