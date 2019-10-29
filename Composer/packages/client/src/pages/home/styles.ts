// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { css } from '@emotion/core';
import { IIconStyles } from 'office-ui-fabric-react';
import { ITheme, mergeStyleSets, getTheme, getFocusStyle } from 'office-ui-fabric-react/lib/Styling';
import { Depths, MotionTimings, MotionDurations } from '@uifabric/fluent-theme';

export const outline = css`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

export const page = css`
  display: flex;
  overflow: auto;
`;
export const leftPage = css`
  flex: 50%;
  padding: 25px;
`;
export const rightPage = css`
  flex: 1;
  padding: 25px;
`;

export const title = css`
  display: block;
  font-size: 28px;
  line-height: 36px;
`;

export const introduction = css`
  display: block;
  flex-wrap: wrap;
  height: auto;
  width: auto;
  max-width: 2000px;
  margin-top: 10px;
  margin-bottom: 10px;
`;

export const newBotContainer = css`
  display: flex;
  flex-wrap: wrap;
  margin: 20px 0;
`;

export const leftContainer = css`
  display: block;
  min-width: 535px;
  margin-top: 10px;
  margin-bottom: 10px;
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
`;

export const bluetitle = css`
  font-size: 18px;
  line-height: 24px;
  display: flex;
  font-weight: 600;
  color: #0078d4;
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
  min-height: 35vh;
  max-height: 40vh;
  padding-top: 10px;
  overflow: hidden;
  flex-grow: 1;
`;

export const exampleListContainer = css`
  border: 1px solid #979797;
  margin-top: 20px;
  position: relative;
  height: 90%;
  min-width: 260px;
`;

export const loading = css`
  height: 50vh;
  width: 600px;
`;
const theme: ITheme = getTheme();
const { palette, semanticColors, fonts } = theme;
export const exampleListClass = mergeStyleSets({
  itemCell: [
    getFocusStyle(theme, { inset: -1 }),
    {
      minHeight: 54,
      padding: 10,
      boxSizing: 'border-box',
      borderBottom: `1px solid ${semanticColors.bodyDivider}`,
      display: 'flex',
      selectors: {
        '&:hover': { background: palette.neutralLight },
      },
    },
  ],
  image: {
    width: 50,
    height: 50,
    fontSize: 50,
    backgroundColor: '#0078D4',
    color: 'white',
    margin: '5px',
  },
  itemContent: {
    marginLeft: 10,
    overflow: 'hidden',
    flexGrow: 1,
  },
  itemName: [
    fonts.xLarge,
    {
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
  ],
  itemIndex: {
    fontSize: fonts.small.fontSize,
    color: palette.neutralTertiary,
    marginBottom: 10,
  },
});
