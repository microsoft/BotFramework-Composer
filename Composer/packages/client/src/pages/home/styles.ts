// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { css } from '@emotion/core';
import { ITheme, getTheme } from 'office-ui-fabric-react/lib/Styling';
import { Depths, MotionTimings, MotionDurations, NeutralColors } from '@uifabric/fluent-theme';
import { FontWeights, FontSizes } from 'office-ui-fabric-react/lib/Styling';
const theme: ITheme = getTheme();
const { palette, fonts } = theme;

export const outline = css`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

export const page = css`
  display: flex;
  overflow-x: hidden;
  overflow-y: auto;
  flex-wrap: wrap;
`;

export const leftPage = css`
  flex: 50%;
  padding: 0 25px 25px 25px;
  display: flex;
  flex-direction: column;
`;

export const rightPage = css`
  flex: 1;
  padding: 25px;
  display: flex;
  background: #f6f6f6;
  flex-direction: column;
`;

export const title = css`
  display: block;
  padding: 25px 25px 10px 25px;
  font-size: ${FontSizes.xxLarge};
  line-height: 36px;
  font-weight: ${FontWeights.semibold};
  margin: 0;
`;

export const introduction = css`
  display: block;
  flex-wrap: wrap;
  height: auto;
  width: auto;
  max-width: 2000px;
  margin-top: 10px;
  margin-bottom: 10px;
  font-size: 18px;
`;

export const rowContainer = css`
  display: flex;
  margin: 20px 0;
`;

export const leftContainer = css`
  margin-bottom: 10px;
  flex: auto;
  display: flex;
  flex-direction: column;
`;

export const gap40 = css`
  margin-top: 40px;
`;

export const itemContainerWrapper = (disabled?: boolean) => css`
  border-radius: 2px;
  border-width: 0;
  cursor: ${disabled ? 'auto' : 'pointer'};
  display: block;
  min-width: 262px;
  height: 183px;
  width: 20vw;
  margin-right: 30px;
  padding: 0;
`;

export const itemContainer = css`
  outline: none;
  height: 50%;
`;

// export const itemContainerTitle = css`
//   height: 100%;
//   color: ${NeutralColors.gray160}
//   font-size: ${FontSizes.medium}
//   box-sizing: border-box;
//   outline: none;
// `;

// export const itemContainerContent = css`
//   height: 100%;
//   display: flex;
//   flex-direction: column;
//   font-size: 16px;
//   font-weight: 600;
//   text-align: left;
//   padding: 10px 0 0 16px;
//   overflow: hidden;
//   text-overflow: ellipsis;
//   word-break: break-word;
//   outline: none;
// `;

export const subtitle = css`
  font-size: 18px;
  line-height: 24px;
  display: flex;
  font-weight: 600;
  margin: 0;
`;

export const bluetitle = css`
  line-height: 20px;
  font-size: ${fonts.medium.fontSize};
  display: flex;
  color: #0078d4;
  margin: 16px 0 0 0;
`;

export const newsDescription = css`
  margin: 0;
  font-size: ${fonts.medium.fontSize};
  display: -webkit-box;
  -webkit-line-clamp: 3;
  overflow: hidden;
  -webkit-box-orient: vertical;
`;

export const botContainer = css`
  display: flex;
  flex-wrap: wrap;
  line-height: 32px;
  margin-left: 33px;
  margin-right: 33px;
  margin-top: 24px;
`;

const baseBotItem = {
  container: css`
    padding: 9px;
    text-align: left;
    border: 1px #efedeb solid;
    box-shadow: ${Depths.depth4};
    transition: box-shadow ${MotionDurations.duration2} ${MotionTimings.standard};
    &:hover,
    &:focus {
      box-shadow: ${Depths.depth16};
    }

    &:active {
      box-shadow: ${Depths.depth0};
    }
  `,
};

export const cardItem = {
  ...baseBotItem,
  title: css`
    font-weight: ${FontWeights.semibold};
    color: ${NeutralColors.gray160};
    text-align: left;
    margin-bottom: 12px;
  `,
  imageCover: css`
    width: 48px;
    height: 48px;
    margin-bottom: 12px;
  `,
  content: css`
    color: ${NeutralColors.gray140};
    margin-bottom: 12px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    overflow: hidden;
    -webkit-box-orient: vertical;
  `,
  moreLink: css`
    color: #0078d4;
  `,
};

export const childrenContainer = css`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
`;

export const detailListContainer = css`
  position: relative;
  max-height: 40vh;
  padding-top: 10px;
  overflow: hidden;
  flex-grow: 1;
  min-height: 250px;
`;

export const exampleListContainer = css`
  border: 1px solid #979797;
  margin-top: 20px;
  position: relative;
  min-width: 260px;
  flex: 1;
  min-height: 582px;
`;

export const loading = css`
  height: 50vh;
  width: 600px;
`;

export const tableCell = css`
  outline: none;
  width: auto;
  :focus {
    outline: rgb(102, 102, 102) solid 1px;
  }
`;

export const content = css`
  outline: none;
`;
