// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { css } from '@emotion/core';
import { IIconStyles } from 'office-ui-fabric-react/lib/Icon';
import { ITheme, getTheme } from 'office-ui-fabric-react/lib/Styling';
import { Depths, MotionTimings, MotionDurations } from '@uifabric/fluent-theme';
import { FontWeights, FontSizes } from 'office-ui-fabric-react/lib/Styling';
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
  padding: 25px;
  display: flex;
  flex-direction: column;
`;

export const rightPage = css`
  flex: 1;
  padding: 25px;
  display: flex;
  flex-direction: column;
`;

export const title = css`
  display: block;
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

export const newBotContainer = css`
  display: flex;
  flex-wrap: wrap;
  margin: 20px 0;
`;

export const leftContainer = css`
  margin-top: 10px;
  margin-bottom: 10px;
  flex: auto;
  display: flex;
  flex-direction: column;
`;

export const itemContainerWrapper = (disabled?: boolean) => css`
  border-radius: 2px;
  cursor: ${disabled ? 'auto' : 'pointer'};
  display: block;
  min-width: 180px;
  height: 130px;
  width: 11vw;
  margin-right: 30px;
`;

export const itemContainer = css`
  height: 50%;
`;

export const itemContainerTitle = css`
  height: 100%;
  display: flex;
  align-items: center;
  font-size: 20px;
  font-weight: 600;
  padding: 0.5rem 1rem;
  box-sizing: border-box;
`;

export const itemContainerContent = css`
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  word-break: break-word;
  padding: 0.5rem 1rem;
`;

export const subtitle = css`
  font-size: 18px;
  line-height: 24px;
  display: flex;
  font-weight: 600;
  margin: 0;
`;

export const bluetitle = css`
  font-size: 18px;
  line-height: 24px;
  display: flex;
  font-weight: 600;
  color: #0078d4;
  margin: 0;
`;

export const examplesDescription = css`
  margin: 0;
`;

export const linkContainer = css`
  width: 50%;
  margin-top: 10px;
  font-weight: 600;
`;

export const linkInfo = css`
  color: #0078d4;
  margin-top: 10px;
  text-decoration: underline;
`;

export const botContainer = css`
  display: flex;
  flex-wrap: wrap;
  line-height: 32px;
  margin-left: 33px;
  margin-right: 33px;
  margin-top: 24px;
`;

export const button: IIconStyles = {
  root: {
    fontSize: '24px',
    fontWeight: 600,
    color: 'white',
  },
};

export const disabledItem = {
  title: css`
    background-color: #f2f2f2;
    color: #a19f9d;
  `,
  content: css`
    border: 2px solid #f2f2f2;
    width: auto;
    font-size: smaller;
    word-wrap: break-word;
    color: #a19f9d;
  `,
};

const baseBotItem = {
  container: css`
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
  content: css`
    background-color: #f2f2f2;
  `,
};

export const newBotItem = {
  ...baseBotItem,
  title: css`
    background-color: #0078d4;
  `,
};

export const lastestBotItem = {
  ...baseBotItem,
  title: css`
    background-color: #56ccf2;
  `,
};

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

const theme: ITheme = getTheme();
const { palette, fonts } = theme;
export const exampleListCell = css`
  min-height: 54px;
  padding: 16px;
  box-sizing: border-box;
  display: flex;

  &:hover {
    background: ${palette.neutralLight};
  }
`;

export const exampleListCellIcon = css`
  height: 51px;
  width: 51px;
  flex-basis: 51px;
`;

export const exampleListCellContent = css`
  margin-left: 16px;
  overflow: hidden;
  flex: 1;
`;

export const exampleListCellName = css`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const exampleListCellDescription = css`
  font-size: ${fonts.small.fontSize};
  color: ${palette.neutralTertiary};
`;
