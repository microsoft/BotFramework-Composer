// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { css } from '@emotion/core';
import { IIconStyles } from 'office-ui-fabric-react/lib/Icon';
import { ITheme, getTheme } from 'office-ui-fabric-react/lib/Styling';
import { Depths, MotionTimings, MotionDurations } from '@uifabric/fluent-theme';
import { FontWeights, FontSizes } from 'office-ui-fabric-react/lib/Styling';

import { colors } from '../../colors';

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
  border-width: 0;
  cursor: ${disabled ? 'auto' : 'pointer'};
  display: block;
  min-width: 180px;
  height: 130px;
  width: 11vw;
  margin-right: 30px;
  padding: 0;
`;

export const itemContainer = css`
  outline: none;
  height: 50%;
`;

export const itemContainerTitle = css`
  height: 100%;
  color: white;
  text-align: left;
  display: flex;
  align-items: center;
  font-size: 20px;
  font-weight: 600;
  padding: 0.5rem 1rem;
  box-sizing: border-box;
  outline: none;
`;

export const itemContainerContent = css`
  height: 100%;
  display: flex;
  flex-direction: column;
  font-size: 16px;
  font-weight: 600;
  text-align: left;
  padding: 10px 0 0 16px;
  overflow: hidden;
  text-overflow: ellipsis;
  word-break: break-word;
  outline: none;
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
  color: ${colors.blue};
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
  color: ${colors.blue};
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
    background-color: ${colors.gray(20)};
    color: ${colors.gray(90)};
  `,
  content: css`
    border: 2px solid ${colors.gray(20)};
    width: auto;
    font-size: smaller;
    word-wrap: break-word;
    color: ${colors.gray(90)};
    background: white;
  `,
};

const baseBotItem = {
  container: css`
    padding: 0;
    border-width: 1px;
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
    background-color: ${colors.gray(20)};
  `,
};

export const newBotItem = {
  ...baseBotItem,
  title: css`
    background-color: ${colors.blue};
  `,
};

export const latestBotItem = {
  ...baseBotItem,
  title: css`
    background-color: ${colors.latestBotItem};
  `,
};

export const tutorialTile = {
  ...baseBotItem,
  title: css`
    background-color: ${colors.shade30};
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
  border: 1px solid ${colors.gray(100)};
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
  &:focus {
    outline: ${colors.gray(130)} solid 1px;
  }
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

export const tableCell = css`
  outline: none;
  width: auto;
  :focus {
    outline: ${colors.gray(130)} solid 1px;
  }
`;

export const content = css`
  outline: none;
`;
