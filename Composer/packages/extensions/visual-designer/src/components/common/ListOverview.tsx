// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';

import { MultiLineDiv, parseElementSchema } from '../elements/styledComponents';
import { UIElement } from '../elements/styledComponents.types';

export interface ListOverviewProps {
  items: string[];
  elementSchema: UIElement;
  maxCount: number;
  role: string;
  styles?: Record<string, any>;
}
export const ListOverview: React.FC<ListOverviewProps> = ({ items, elementSchema, maxCount, role, styles }) => {
  const { ElementComponent, props } = parseElementSchema(elementSchema);
  return (
    <>
      {items.map((value, index) => {
        if (index < 3) {
          return (
            <ElementComponent
              key={index}
              role={role}
              title={typeof value === 'string' ? value : ''}
              {...props}
              style={styles}
            >
              {value}
            </ElementComponent>
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
