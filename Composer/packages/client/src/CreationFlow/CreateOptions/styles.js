import { css } from '@emotion/core';

export const choiceGroup = {
  flexContainer: {
    width: '100%',
    display: 'flex',
    flexWrap: 'wrap',
    flexDirection: 'row',
    alignContent: 'baseline',
  },
};

export const templateItem = checked => css`
  height: 70px;
  width: 80px;
  margin: 5px;
  background: #ebebeb;
  color: #0078d4;
  font-size: 13px;
  box-sizing: border-box;
  border-top: 6px solid #50e6ff;
  outline: ${checked ? '2px solid #50e6ff' : 'none'};
  cursor: pointer;
  display: flex;
  justify-content: space-around;
  align-items: center;
  font-size: 13px;

  &:hover {
    border: 1px solid rgb(0, 120, 212);
  }
`;

export const optionIcon = checked => css`
  vertical-align: text-bottom;
  font-size: 18px;
  margin-right: 10px;
  color: ${checked ? '#0078d4' : '#000'};
`;

export const optionRoot = css`
  width: 100%;
  height: 100%;
`;
