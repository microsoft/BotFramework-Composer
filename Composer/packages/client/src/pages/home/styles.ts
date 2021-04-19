// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { css } from '@emotion/core';
import { ITheme, getTheme } from 'office-ui-fabric-react/lib/Styling';
import { Depths, MotionTimings, MotionDurations, NeutralColors } from '@uifabric/fluent-theme';
import { FontWeights, FontSizes } from 'office-ui-fabric-react/lib/Styling';
import { IButtonStyles } from 'office-ui-fabric-react/lib/Button';
const theme: ITheme = getTheme();
const { fonts } = theme;

const ImageCoverWidth = 244;
const ImageCoverHeight = 95;

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
  padding-right: 25px;
  display: flex;
  flex-direction: column;
`;

export const title = css`
  display: block;
  padding: 25px 25px 0px 25px;
  font-size: ${FontSizes.xxLarge};
  line-height: 36px;
  font-weight: ${FontWeights.semibold};
  margin: 0;
  width: 100%;
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
  margin-top: 12px;
`;

export const recentBotsContainer = css`
  margin-top: 12px;
`;

export const resourcesContainer = css`
  margin-top: 40px;
`;

export const videosContainer = css`
  margin-top: 40px;
`;

export const tabRowContainer = css`
  flex-wrap: wrap;
  display: flex;
  clear: both;
`;

export const tabRowViewMore = css`
  float: right;
  position: relative;
  top: -24px;
  font-size: ${fonts.medium.fontSize};
  margin-bottom: -40px;
  right: 12px;
  display: flex;
  align-items: center;
  i {
    margin: 0 0 0 5px;
  }
`;

export const itemContainerWrapper = (disabled?: boolean) => css`
  border-radius: 2px;
  border-width: 0;
  cursor: ${disabled ? 'auto' : 'pointer'};
  display: block;
  height: auto;
  text-decoration-line: none;
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
  display: inline-block;
  color: #0078d4;
  margin: 16px 0 0 0;
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

export const cardItem = {
  container: css`
    font-size: ${fonts.medium.fontSize};
    margin: 12px 0 0 12px;
    padding: 12px;
    min-width: ${ImageCoverWidth}px;
    width: 17vw;
    @media (max-width: 1416px) {
      width: 20vw;
    }
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
  title: css`
    font-weight: ${FontWeights.semibold};
    color: #464844;
    margin-bottom: 4px;
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
  `,
  imageCover: css`
    width: 40px;
    height: 36px;
    max-height: 175px;
    margin-bottom: 12px;
    position: relative;
    .image-cover-img {
      width: 100%;
      height: 100%;
    }
  `,
  content: css`
    color: ${NeutralColors.gray140};
    display: -webkit-box;
    -webkit-line-clamp: 2;
    overflow: hidden;
    min-height: 34px;
    -webkit-box-orient: vertical;
  `,
  moreLink: css`
    margin-top: 12px;
    color: #0078d4;
  `,
};

export const mediaCardItem = {
  ...cardItem,
  imageCover: css`
    ${cardItem.imageCover}
    width: 100%;
    margin-bottom: 12px;
    overflow: hidden;
    display: flex;
    min-height: ${ImageCoverHeight}px;
    height: calc(17vw * ${ImageCoverHeight / ImageCoverWidth});
    @media (max-width: 1416px) {
      height: calc(20vw * ${ImageCoverHeight / ImageCoverWidth});
    }
    @media (min-width: 2800px) {
      background: ${NeutralColors.gray160};
    }
    .image-cover-img {
      display: flex;
      width: 100%;
      height: auto;
      img {
        width: 100%;
        max-width: 450px;
        height: auto;
      }
    }
  `,
};

export const meidiaCardNoCoverItem = {
  ...mediaCardItem,
  imageCover: css`
    ${mediaCardItem.imageCover};
    position: relative;
    align-items: center;
    justify-content: center;
    background: ${NeutralColors.gray160};
    .image-cover-img {
      width: 53px;
      height: 48px;
      img {
        width: auto;
        height: auto;
      }
    }
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
  padding-top: 10px;
  .ms-DetailsHeader {
    padding-top: 0;
  }
  .ms-DetailsHeader-cellName {
    font-weight: 400;
  }
`;

export const detailListScrollWrapper = css`
  position: relative;
  max-height: 40vh;
  overflow: hidden;
  min-height: 250px;
`;

export const whatsNewsContainer = css`
  position: relative;
  flex: 1;
  padding: 20px 25px 25px 25px;
  border-radius: 5px;
  margin: 20px 0 25px 0;
  background: #f6f6f6;
  @media (max-width: 1416px) {
    background: none;
    min-width: 200px;
    margin: 15px 0 0 0;
  }
`;

export const whatsNewsList = css`
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
