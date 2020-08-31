// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { FC } from 'react';

import { SingleLineDiv } from '../styled/styledComponents';

export interface ListOverviewProps<T> {
  items: T[];
  renderItem?: (item: T) => JSX.Element;
  maxCount?: number;
  itemInterval?: number;
  itemSingleline?: boolean;
}

export const ListOverview: FC<ListOverviewProps<any>> = ({
  items,
  renderItem,
  maxCount = 3,
  itemInterval = 8,
  itemSingleline = true,
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
        let content = item;
        if (typeof renderItem === 'function') {
          content = renderItem(item);
        } else if (typeof item !== 'string') {
          content = JSON.stringify(item);
        }

        return (
          <div key={index} style={{ marginTop: index ? itemInterval : 0 }}>
            {itemSingleline ? <SingleLineDiv height={16}>{content}</SingleLineDiv> : content}
          </div>
        );
      })}
      {items.length > maxCount ? (
        <SingleLineDiv
          css={{
            marginTop: '3px',
            textAlign: 'center',
            color: '#757575',
          }}
          data-testid="hasMore"
        >
          {`${items.length - maxCount} more`}
        </SingleLineDiv>
      ) : null}
    </div>
  );
};
