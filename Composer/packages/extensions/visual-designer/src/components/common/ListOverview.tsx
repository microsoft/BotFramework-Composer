// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { FC } from 'react';

import { SingleLineDiv } from '../elements/styledComponents';

export interface ListOverviewProps<T> {
  items: T[];
  renderItem: (item: T) => JSX.Element;
  maxCount: number;
}

export const ListOverview: FC<ListOverviewProps<any>> = ({ items, renderItem, maxCount }) => {
  if (!Array.isArray(items) || !items.length) {
    return null;
  }
  return (
    <div style={{ padding: '0 0 8px 8px' }}>
      {items.slice(0, maxCount).map((item, index) => {
        return (
          <div style={{ marginTop: '8px' }} key={index}>
            {renderItem(item)}
          </div>
        );
      })}
      {items.length > maxCount ? (
        <SingleLineDiv
          data-testid="hasMore"
          style={{
            marginTop: '8px',
            textAlign: 'center',
          }}
        >
          {`${items.length - maxCount} more`}
        </SingleLineDiv>
      ) : null}
    </div>
  );
};
