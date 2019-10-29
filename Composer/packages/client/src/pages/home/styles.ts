// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { css } from '@emotion/core';
import { IButtonStyles } from 'office-ui-fabric-react';
import { ITheme, mergeStyleSets, getTheme, getFocusStyle } from 'office-ui-fabric-react/lib/Styling';

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
  margin-left: 10px;
  margin-top: 20px;
  margin-bottom: 20px;
`;

export const leftContainer = css`
  display: block;
  min-width: 535px;
  margin-top: 10px;
  margin-bottom: 10px;
`;

export const itemContainer = css`
  border-radius: 2px;
  position: relative;
  cursor: pointer;
  display: block;
  min-height: 120px;
  min-width: 150px;
  height: 13vh;
  width: 11vw;
  margin-right: 30px;
`;

export const itemContainerTitle = css`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  transform: translate(10%, 0%);
  font-size: 20px;
  font-weight: 600;
`;

export const itemContainerContent = css`
  position: absolute;
  font-weight: 600;
  width: 90%;
  max-height: 55%;
  overflow: hidden;
  text-overflow: ellipsis;
  word-break: break-word;
  transform: translate(10%, 30%);
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  display: -webkit-box !important;
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

export const button = () => {
  const normal: IButtonStyles = {
    root: {
      background: 'transparent',
      padding: '0px',
    },
    rootHovered: {
      background: 'transparent',
    },
    rootChecked: {
      background: 'transparent',
    },
    icon: {
      fontSize: '24px',
      color: 'white',
    },
  };
  return normal;
};

export const newBotItem = {
  container: {
    boxShadow: '0px 0.6px 1.8px rgba(0, 0, 0, 0.108), 0px 3.2px 7.2px rgba(0, 0, 0, 0.132)',
  },
  title: { backgroundColor: '#0078D4' },
  content: { backgroundColor: '#F2F2F2' },
};
export const lastestBotItem = {
  container: {
    boxShadow: '0px 0.6px 1.8px rgba(0, 0, 0, 0.108), 0px 3.2px 7.2px rgba(0, 0, 0, 0.132)',
  },
  title: { backgroundColor: '#56CCF2' },
  content: { backgroundColor: '#F2F2F2' },
};
export const videoItem = {
  title: { backgroundColor: '#F2F2F2', color: '#A19F9D' },
  content: {
    border: '2px solid #F2F2F2',
    width: 'auto',
    fontSize: 'smaller',
    wordWrap: 'break-word',
    color: '#A19F9D',
  },
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
