import React from 'react';

import { CollapsedEventNodeSize, EventNodeLayout } from '../../shared/elementSizes';

const ElementWidth = CollapsedEventNodeSize.width;
const ElementHeight = CollapsedEventNodeSize.height;
const ElementMarginX = EventNodeLayout.marginX;
const ElementMarginY = EventNodeLayout.marginX;
const maxBlockHeight = (ElementHeight + ElementMarginY) * 2;
export const CollapsedRuleGroup = ({ count }) => {
  const items = [];
  for (let i = 0; i < count; i++) {
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
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', maxHeight: maxBlockHeight, overflow: 'hidden' }}>{items}</div>
  );
};
