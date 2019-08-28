/** @jsx jsx */
import { jsx } from '@emotion/core';

import { CollapsedEventNodeSize, EventNodeLayout } from '../../constants/ElementSizes';
import { EventColor } from '../../constants/ElementColors';

const ElementWidth = CollapsedEventNodeSize.width;
const ElementHeight = CollapsedEventNodeSize.height;
const ElementMarginX = EventNodeLayout.marginX;
const ElementMarginY = EventNodeLayout.marginX;
const maxBlockHeight = (ElementHeight + ElementMarginY) * 2;

export const CollapsedRuleGroup = ({ count }): JSX.Element => {
  const items: JSX.Element[] = [];
  for (let i = 0; i < count; i++) {
    items.push(
      <div
        key={i}
        css={{
          width: ElementWidth,
          height: ElementHeight,
          background: EventColor.collapsed,
          margin: `0 ${ElementMarginX}px ${ElementMarginY}px 0`,
        }}
      />
    );
  }
  return <div css={{ display: 'flex', flexWrap: 'wrap', maxHeight: maxBlockHeight, overflow: 'hidden' }}>{items}</div>;
};
