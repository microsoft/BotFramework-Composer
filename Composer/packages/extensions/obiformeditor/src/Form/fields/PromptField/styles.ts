import { IPivotStyles } from 'office-ui-fabric-react';
import { css } from '@emotion/core';

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
    padding: '24px 18px',
  },
};

export const tabsContainer = css`
  border-bottom: 1px solid #c8c6c4;
`;

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

export const field = css`
  margin: 10px 0;
`;

export const settingsContainer = css`
  /* padding: 24px 0; */
`;

export const settingsFields = css`
  display: flex;
  flex-wrap: wrap;
`;

export const settingsFieldFull = css`
  flex-basis: 100%;
`;

export const settingsFieldHalf = css`
  flex: 1;

  & + & {
    margin-left: 36px;
  }
`;

export const settingsFieldInline = css`
  margin: 0;
`;
