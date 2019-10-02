import { IPivotStyles } from 'office-ui-fabric-react';
import { css } from '@emotion/core';

export const tabsContainer = css`
  padding: 0 18px;
`;

export const tabs: Partial<IPivotStyles> = {
  root: {
    display: 'flex',
    padding: '0 18px',
  },
  link: {
    flex: 1,
  },
  linkIsSelected: {
    flex: 1,
  },
  itemContainer: {
    padding: '18px',
  },
};

export const validationItem = css`
  display: flex;
  align-items: center;
  padding-left: 10px;

  & + & {
    margin-top: 10px;
  }
`;

export const validationItemValue = css`
  flex: 1;
`;
