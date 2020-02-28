// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { FC, ComponentClass } from 'react';

import { SingleLineDiv } from '../elements/styledComponents';

export interface ListOverviewProps {
  items: string[];
  ItemRender: FC<any> | ComponentClass<any, any>;
  maxCount: number;
  styles?: Record<string, any>;
}
export const ListOverview: FC<ListOverviewProps> = ({ items, ItemRender, maxCount, styles }) => {
  return (
    <div css={{ padding: '0 0 8px 8px' }}>
      {items.slice(0, 3).map((value, index) => {
        return (
          <ItemRender key={index} title={typeof value === 'string' ? value : ''} css={{ marginTop: '8px' }}>
            {value}
          </ItemRender>
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
          {`${items.length - 3} more`}
        </SingleLineDiv>
      ) : null}
    </div>
  );
};
