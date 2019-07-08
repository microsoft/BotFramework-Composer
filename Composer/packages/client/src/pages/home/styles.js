import { css } from '@emotion/core';

export const outline = css`
  display: flex;
  flex-direction: column;
  height: calc(100% - 44px);
  margin: 32px 50px 32px 32px;
  border: 1px solid #979797;
  overflow-x: auto;
`;

export const title = css`
  display: block;
  height: 36px;
  margin: 33px 0px 0px 19px;
  font-size: 36px;
  line-height: 32px;
`;

export const introduction = css`
  display: flex;
  flex-wrap: wrap;
  height: auto;
  width: auto;
  max-width: 2000px;
`;

export const introTitle = css`
  display: flex;
  flex-direction: column;
  color: #0078d4;
  width: 50%;
  min-width: 535px;
`;

export const introTitleLeft = css`
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
export const link = css`
  display: 'block',
  textDecoration: 'none',
`;

export const linkContainer = css`
  height: 105px;
  display: flex;
  flex-direction: row;
`;

export const linkInfo = css`
  margin-top: 15px;
  margin-left: 63px;
  width: 50%;
  color: #000000;
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
  width: 242px;
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
  top: 88px;
  left: 70px;
`;

export const footerContainer = css`
  margin-left: 33px;
  margin-top: 30px;
`;

export const footer = css`
  font-size: 18px;
  color: #000000;
  text-decoration: underline;
`;

export const button = () => {
  const normal = {
    root: {
      marginLeft: '84px',
      marginTop: '43px',
    },
    icon: {
      fontSize: '24px',
    },
  };
  return normal;
};
