import React from 'react';

import { CollapsedEventNodeSize, RuleColCount, EventNodeLayout } from '../../shared/elementSizes';

const ColCount = RuleColCount;
const ElementWidth = CollapsedEventNodeSize.width;
const ElementHeight = CollapsedEventNodeSize.height;
const ElementMarginX = EventNodeLayout.marginX;
const ElementMarginY = EventNodeLayout.marginX;
const BlockWidth = ElementWidth + ElementMarginX;
const BoxWidth = BlockWidth * ColCount;
export const CollapsedRuleGroup = ({ count }) => {
  const items = [];
  for (let i = 0; i < count; i++) {
    if (i < RuleColCount * 2) {
      items.push(
        <div
          key={i}
          style={{
            width: ElementWidth,
            height: ElementHeight,
            background: '#00B7C3',
            margin: `0 ${ElementMarginX}px ${ElementMarginY}px 0`,
          }}
        />
      );
    }
  }
  return <div style={{ display: 'flex', flexWrap: 'wrap', width: BoxWidth }}>{items}</div>;
};
