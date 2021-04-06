// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { css } from '@emotion/core';
import { ITheme, getTheme } from 'office-ui-fabric-react/lib/Styling';
import { Depths, MotionTimings, MotionDurations, NeutralColors } from '@uifabric/fluent-theme';
import { FontWeights, FontSizes } from 'office-ui-fabric-react/lib/Styling';
import { IButtonStyles } from 'office-ui-fabric-react/lib/Button';
const theme: ITheme = getTheme();
const { fonts } = theme;

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
  margin-bottom: 55px;
  display: flex;
  flex-direction: column;
  background: #f6f6f6;
  @media (max-width: 1366px) {
    background: none;
  }
`;

export const title = css`
  display: block;
  padding: 25px 25px 0px 25px;
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
  margin: 12px 0;
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
  min-width: 244px;
  height: 185px;
  width: 17vw;
  margin-right: 12px;
  padding: 0;
`;

export const itemContainer = css`
  outline: none;
  height: 50%;
`;

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

export const recentBotsTitle = css`
  ${subtitle};
  padding: 18px 0;
`;

export const toolbar = css`
  border-bottom: none;
  button: {
    font-size: ${fonts.medium.fontSize};
  }
`;

export const toolbarButtonStyles: IButtonStyles = {
  root: { fontSize: '14px', marginTop: '2px', marginLeft: '15px' },
};

export const toolbarFirstButtonStyles: IButtonStyles = {
  root: { fontSize: '14px', marginTop: '2px', marginLeft: '0' },
};

export const noRecentBotsContainer = css`
  height: 227px;
  background: rgba(242, 242, 242, 0.7);
  border-radius: 5px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const noRecentBotsCover = css`
  width: 104px;
  height: 84px;
  margin-top: 48px;
`;

export const noRecentBotsDescription = css`
  margin-top: 28px;
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
    padding: 8px;
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
    margin-bottom: 16px;
  `,
  imageCover: css`
    width: 53px;
    height: 48px;
    margin: 2px 0 12px 0;
  `,
  content: css`
    color: ${NeutralColors.gray140};
    font-size: ${fonts.small.fontSize};
    display: -webkit-box;
    -webkit-line-clamp: 2;
    overflow: hidden;
    min-height: 34px;
    -webkit-box-orient: vertical;
    margin-bottom: 16px;
  `,
  moreLink: css`
    color: #0078d4;
  `,
};

export const mediaCardItem = {
  ...cardItem,
  title: css`
    ${cardItem.title};
    margin-bottom: 6px;
  `,
  imageCover: css`
    width: 100%;
    height: 95px;
    margin: 4px 0 12px 0;
    display: flex;
  `,
};

export const meidiaCardNoCoverItem = {
  ...mediaCardItem,
  imageCover: css`
    align-items: center;
    justify-content: center;
    ${mediaCardItem.imageCover};
    background: ${NeutralColors.gray160};
  `,
};

export const childrenContainer = css`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
`;

export const detailListContainer = css`
  border-top: 1px solid ${NeutralColors.gray30};
  position: relative;
  max-height: 40vh;
  padding-top: 10px;
  overflow: hidden;
  flex-grow: 1;
  min-height: 250px;
  .ms-DetailsHeader {
    padding-top: 0;
  }
  .ms-DetailsHeader-cellName {
    font-weight: 400;
  }
`;

export const whatsNewsContainer = css`
  position: relative;
  min-width: 200px;
  flex: 1;
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
