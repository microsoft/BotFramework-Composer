// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
var __extends =
  (this && this.__extends) ||
  (function () {
    var extendStatics = function (d, b) {
      extendStatics =
        Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array &&
          function (d, b) {
            d.__proto__ = b;
          }) ||
        function (d, b) {
          for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
        };
      return extendStatics(d, b);
    };
    return function (d, b) {
      extendStatics(d, b);
      function __() {
        this.constructor = d;
      }
      d.prototype = b === null ? Object.create(b) : ((__.prototype = b.prototype), new __());
    };
  })();
/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
import { defaultNodeProps } from '../nodes/nodeProps';
import { EventRenderer } from '../renderers/EventRenderer';
import { Boundary } from '../../models/Boundary';
import { EventNodeSize, EventNodeLayout } from '../../constants/ElementSizes';
var RuleElementHeight = EventNodeSize.height;
var RuleElementWidth = EventNodeSize.width;
var RulePaddingX = EventNodeLayout.marginX;
var RulePaddingY = EventNodeLayout.marginY;
var RuleBlockWidth = RuleElementWidth + RulePaddingX;
var RuleBlockHeight = RuleElementHeight + RulePaddingY;
var RuleGroup = /** @class */ (function (_super) {
  __extends(RuleGroup, _super);
  function RuleGroup() {
    return (_super !== null && _super.apply(this, arguments)) || this;
  }
  RuleGroup.prototype.propagateBoundary = function () {
    if (!this.containerElement) return;
    var _a = this.containerElement,
      scrollWidth = _a.scrollWidth,
      scrollHeight = _a.scrollHeight;
    this.props.onResize(new Boundary(scrollWidth, scrollHeight));
  };
  RuleGroup.prototype.renderRule = function (rule, index) {
    var _this = this;
    var _a = this.props,
      id = _a.id,
      onEvent = _a.onEvent;
    var elementId = id + '[' + index + ']';
    return jsx(
      'div',
      {
        key: elementId + 'block',
        css: {
          width: RuleBlockWidth,
          height: RuleBlockHeight,
          boxSizing: 'border-box',
        },
      },
      jsx(EventRenderer, {
        data: rule,
        id: elementId,
        onEvent: onEvent,
        onResize: function () {
          _this.propagateBoundary();
        },
      })
    );
  };
  RuleGroup.prototype.render = function () {
    var _this = this;
    var data = this.props.data;
    var rules = data.children || [];
    return jsx(
      'div',
      {
        ref: function (el) {
          _this.containerElement = el;
          _this.propagateBoundary();
        },
        css: {
          boxSizing: 'border-box',
          display: 'flex',
          flexWrap: 'wrap',
        },
      },
      rules.map(function (x, i) {
        return _this.renderRule(x, i);
      })
    );
  };
  RuleGroup.defaultProps = defaultNodeProps;
  return RuleGroup;
})(React.Component);
export { RuleGroup };
//# sourceMappingURL=RuleGroup.js.map
