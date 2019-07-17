import { css } from '@emotion/core';

export const nav = {
  groupContent: {
    marginBottom: '0px',
  },
  link: {
    paddingRight: '8px',
  },
};

export const moreButton = {
  root: {
    minWidth: 0,
    padding: '0 4px',
    alignSelf: 'stretch',
    height: 'auto',
    visibility: 'hidden',
  },
  menuIcon: {
    fontSize: '14px',
    color: '#000',
  },
};

export const moreMenu = {
  root: {
    marginTop: '-7px',
    width: '100px',
  },
};

export const overflowSet = css`
  width: 100%;
  justify-content: space-between;
  & : hover {
    .dialog-more-btn {
      visibility: visible;
    }
  }
`;

export const addButton = css`
  margin-left: 10px;
`;
