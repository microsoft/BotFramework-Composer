// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { FC } from 'react';

import { SingleLineDiv } from '../styled/styledComponents';

export interface ListOverviewProps<T> {
  items: T[];
  renderItem: (item: T) => JSX.Element;
  maxCount?: number;
  itemPadding?: number;
}

export const ListOverview: FC<ListOverviewProps<any>> = ({
  items,
  renderItem,
  maxCount = 3,
  itemPadding: itemInterval = 4,
}) => {
  if (!Array.isArray(items) || !items.length) {
    return null;
  }
  return (
    <div
      className="ListOverview"
      css={css`
        width: 100%;
      `}
    >
      {items.slice(0, maxCount).map((item, index) => {
        return (
          <div style={{ marginTop: index ? itemInterval : 0 }} key={index}>
            {renderItem(item)}
          </div>
        );
      })}
      {items.length > maxCount ? (
        <SingleLineDiv
          data-testid="hasMore"
          css={{
            marginTop: '3px',
            textAlign: 'center',
            color: '#757575',
          }}
        >
          {`${items.length - maxCount} more`}
        </SingleLineDiv>
      ) : null}
    </div>
  );
};
