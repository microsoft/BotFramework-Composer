// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/** @jsx jsx */
import { jsx } from '@emotion/core';
import { CollapsedEventNodeSize, EventNodeLayout } from '../../constants/ElementSizes';
import { EventColor } from '../../constants/ElementColors';
var ElementWidth = CollapsedEventNodeSize.width;
var ElementHeight = CollapsedEventNodeSize.height;
var ElementMarginX = EventNodeLayout.marginX;
var ElementMarginY = EventNodeLayout.marginX;
var maxBlockHeight = (ElementHeight + ElementMarginY) * 2;
export var CollapsedRuleGroup = function (_a) {
  var count = _a.count;
  var items = [];
  for (var i = 0; i < count; i++) {
    items.push(
      jsx('div', {
        key: i,
        css: {
          width: ElementWidth,
          height: ElementHeight,
          background: EventColor.collapsed,
          margin: '0 ' + ElementMarginX + 'px ' + ElementMarginY + 'px 0',
        },
      })
    );
  }
  return jsx(
    'div',
    { css: { display: 'flex', flexWrap: 'wrap', maxHeight: maxBlockHeight, overflow: 'hidden' } },
    items
  );
};
//# sourceMappingURL=CollapsedRuleGroup.js.map
