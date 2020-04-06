// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

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

export const choiceGroupRoot = css`
  .ms-ChoiceField-wrapper {
    width: 100%;
  }
`;

export const templateItem = (checked, disabled) => css`
  height: 70px;
  width: 80px;
  margin: 5px;
  background: #ebebeb;
  color: ${disabled ? '#A19F9D' : '#000'};
  font-size: 13px;
  box-sizing: border-box;
  border-top: 6px solid ${disabled ? '#A19F9D' : '#50e6ff'};
  outline: ${disabled ? 'none' : checked ? '2px solid #50e6ff' : 'none'};
  cursor: pointer;
  display: flex;
  justify-content: space-around;
  align-items: center;
  font-size: 13px;
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

export const placeholder = css`
  line-height: 30px;
  height: 30px;
  padding-left: 5px;
`;

export const detailListContainer = css`
  width: 100%;
  height: 400px;
  position: relative;
  overflow: hidden;
  flex-grow: 1;
`;

export const listHeader = css`
  margin-top: 10px;
  margin-bottom: 0;
`;
