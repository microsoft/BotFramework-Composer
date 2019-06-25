import { css } from '@emotion/core';

export const choiceGroup = {
  flexContainer: {
    margin: '10px 0 0 20px',
    overflow: 'auto',
    display: 'flex',
    flexWrap: 'wrap',
    flexDirection: 'row',
    alignContent: 'baseline',
  },
};

export const templateItem = checked => css`
  margin-right: 10px;
  margin-bottom: 10px;
  width: 60px;
  height: 80px;
  cursor: pointer;
  border: 1px solid ${checked ? 'rgb(0, 120, 212)' : '#aaa'};
  display: flex;
  justify-content: space-around;
  align-items: center;
  font-size: 13px;

  &:hover {
    border: 1px solid rgb(0, 120, 212);
  }
`;
