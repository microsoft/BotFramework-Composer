// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { FC, ComponentClass } from 'react';

import { MultiLineDiv } from '../elements/styledComponents';

export interface ListOverviewProps {
  items: string[];
  ItemRender: FC<any> | ComponentClass<any, any>;
  maxCount: number;
  styles?: Record<string, any>;
}
export const ListOverview: React.FC<ListOverviewProps> = ({ items, ItemRender, maxCount, styles }) => {
  return (
    <>
      {items.map((value, index) => {
        if (index < 3) {
          return (
            <ItemRender key={index} title={typeof value === 'string' ? value : ''}>
              {value}
            </ItemRender>
          );
        }
      })}
      {items.length > maxCount ? (
        <MultiLineDiv
          data-testid="hasMore"
          style={{
            ...styles,
            textAlign: 'center',
          }}
        >
          {`${items.length - 3} more`}
        </MultiLineDiv>
      ) : null}
    </>
  );
};
