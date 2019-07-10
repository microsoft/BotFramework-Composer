import { css } from '@emotion/core';
import { FontSizes } from 'office-ui-fabric-react/lib/Styling';
import { NeutralColors } from '@uifabric/fluent-theme';

export const fileList = css`
  width: 255px;
`;

export const linkItem = disabled => css`
  display: block;
  text-decoration: none;
  color: ${disabled ? '#A6A6A6' : '#4f4f4f'};
  position: relative;

  &:focus {
    outline: none;
  }
`;

export const contentEditor = css`
  margin: 0px 10px;
  border: 1px solid rgb(237, 235, 233);
`;

export const title = css`
  font-weight: bold;
  padding: 7px 10px;
  line-height: 14px;
  font-size: ${FontSizes.medium};
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: ${NeutralColors.gray20};
`;
