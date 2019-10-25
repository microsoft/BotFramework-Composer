import { css } from '@emotion/core';
import { IButtonStyles } from 'office-ui-fabric-react';
import { ITheme, mergeStyleSets, getTheme, getFocusStyle } from 'office-ui-fabric-react/lib/Styling';

export const outline = css`
  display: block;
  height: calc(100% - 50px);
`;

export const page = css`
  display: flex;
  height: 100%;
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
  font-family: 'Segoe UI';
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

export const itemContainer = css`
  display: block;
  min-width: 535px;
  margin-top: 10px;
  margin-bottom: 10px;
`;
export const subtitle = css`
  font-size: 18px;
  font-family: 'Segoe UI';
  line-height: 24px;
  display: flex;
  font-weight: 600;
`;

export const bluetitle = css`
  font-size: 18px;
  font-family: 'Segoe UI';
  line-height: 24px;
  display: flex;
  font-weight: 600;
  color: #0078d4;
`;

export const introTitle = css`
  display: block;
  height: 37px;
  font-size: 24px;
  line-height: 32px;
  margin-left: 33px;
  margin-top: 26px;
`;

export const introTitleRight = css`
  display: block;
  height: 37px;
  font-size: 24px;
  line-height: 32px;
  margin-left: 33px;
  margin-top: 26px;
`;

export const introLink = css`
  display: block;
  height: 79px;
  width: 100%;
`;
export const linkContainer = css`
  width: 50%;
  margin-top: 10px;
`;

export const linkInfo = css`
  color: #0078d4;
  margin-top: 10px;
  text-decoration: underline;
`;

export const linkLeft = css`
  width: 100%;
  color: #000000;
`;

export const linkRight = css`
  width: 100%;
  color: #000000;
`;

export const moreOptions = css`
  color: #0078d4;
  font-size: 14px;
  margin-top: 15px;
  margin-left: 63px;
`;

export const botArea = css`
  display: block;
  margin-top: 8px;
`;

export const botTitle = css`
  font-size: 24px;
  color: #000000;
  line-height: 32px;
  margin-left: 33px;
`;

export const botContainer = css`
  display: flex;
  flex-wrap: wrap;
  line-height: 32px;
  margin-left: 33px;
  margin-right: 33px;
  margin-top: 24px;
`;

export const botContent = css`
  margin-right: 40px;
`;

export const action = css`
  height: 124px;
  width: 200px;
  background: #979797;
  cursor: pointer;
`;

export const actionName = css`
  font-size: 18px;
  line-height: 32px;
  color: #000000;
`;

export const templateArea = css`
  display: block;
  margin-top: 8px;
`;

export const templateTitle = css`
  font-size: 24px;
  color: #000000;
  line-height: 32px;
  margin-left: 33px;
`;

export const templateContainer = css`
  display: flex;
  flex-wrap: wrap;
  line-height: 32px;
  margin-left: 33px;
  margin-right: 33px;
`;

export const templateContent = css`
  display: block;
  height: 242px;
  width: 260px;
  font-size: 24px;
  line-height: 32px;
  border-top: 10px solid #50e6ff;
  background: #ebebeb;
  margin-right: 60px;
  margin-top: 24px;
  cursor: pointer;
`;

export const templateText = css`
  position: relative;
  top: 60px;
  left: 70px;
`;

export const templateDescription = css`
  position: relative;
  top: 75px;
  left: 7px;
  font-size: 15px;
`;

// export const footer = css`
//   position: absolute;
//   bottom: 0;
//   margin-bottom:
// `;

export const button = () => {
  const normal: IButtonStyles = {
    root: {
      background: 'transparent',
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
  title: { backgroundColor: '#0078D4' },
  content: { backgroundColor: '#F2F2F2' },
};
export const lastestBotItem = {
  title: { backgroundColor: '#56CCF2' },
  content: { backgroundColor: '#F2F2F2' },
};
export const videoItem = {
  title: { backgroundColor: '#F2F2F2' },
  content: { border: '2px solid #F2F2F2', width: 'auto', fontSize: 'smaller', wordWrap: 'break-word' },
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
  container: {
    overflow: 'auto',
    maxHeight: 500,
  },
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
  chevron: {
    alignSelf: 'center',
    marginLeft: 10,
    color: palette.neutralTertiary,
    fontSize: fonts.large.fontSize,
    flexShrink: 0,
  },
});
