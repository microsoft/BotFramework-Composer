import { css } from '@emotion/core';

export const choice = {
  root: {
    border: '1px solid #979797',
    height: '200px',
    padding: '5px',
    marginRight: '90px',
    overflowY: 'auto',
    overflowX: 'hidden',
  },
};

export const option = {
  root: {
    height: '32px',
    width: '290px',
  },
  choiceFieldWrapper: {
    width: '100%',
    height: '100%',
  },
};

export const itemIcon = css`
  position: absolute;
  left: 7px;
  top: 7px;
  vertical-align: text-bottom;
  font-size: 18px;
  color: #0078d4;
`;

export const itemText = css`
  margin-left: 40px;
  line-height: 32px;
`;

export const itemRoot = checked => css`
  width: 100%;
  height: 100%;
  background: ${checked ? '#EDEBE9' : 'transparent'};
`;

export const error = css`
  color: #a80000;
  margin-bottom: 5px;
`;
