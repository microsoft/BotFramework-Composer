import { css } from '@emotion/core';

export const outline = css`
  display: flex;
  flex-direction: column;
  height: 100%;
  margin: 32px 50px 32px 32px;
  border: 1px solid #979797;
  overflow-x: auto;
`;

export const content = css`
  min-width: 1300px;
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
  flex-direction: column;
  height: 169px;
`;

export const introTitle = css`
  display: flex;
  height: 37px;
  width: 100%;
  color: #0078d4;
  margin-left: 33px;
  margin-top: 26px;
`;

export const introTitleLeft = css`
  display: block;
  height: 37px;
  width: 60%;
  font-size: 24px;
  line-height: 32px;
`;

export const introTitleRight = css`
  display: block;
  height: 37px;
  width: 40%;
  font-size: 24px;
  line-height: 32px;
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
  width: 60%;
  color: #000000;
`;

export const linkRight = css`
  width: 40%;
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
  height: 236px;
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
  line-height: 32px;
  margin-left: 33px;
  margin-right: 33px;
  margin-top: 24px;
  height: 156px;
`;

export const botContent = css`
  height: 156px;
  width: 200px;
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
  height: 365px;
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
  line-height: 32px;
  margin-left: 33px;
  margin-right: 33px;
  margin-top: 24px;
  height: 272px;
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
  cursor: pointer;
`;

export const templateText = css`
  position: relative;
  top: 88px;
  left: 70px;
`;

export const footer = css`
  font-size: 18px;
  color: #000000;
  margin-left: 33px;
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
