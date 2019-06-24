import { css } from '@emotion/core';

export const outline = css`
  display: flex;
  flex-direction: column;
  height: 100%;
  margin: 32px 50px 32px 32px;
  border: 1px solid #000000;
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

export const myBotContainer = css`
  display: block;
  height: 236px;
  margin-top: 8px;
`;

export const myBotTitle = css`
  font-size: 24px;
  color: #000000;
  line-height: 32px;
  margin-left: 33px;
`;

export const myBots = css`
  display: flex;
  line-height: 32px;
  margin-left: 33px;
  margin-right: 33px;
  height: 200px;
  justify-content: space-between;
`;

export const myBot = css`
  height: 156px;
  width: 200px;
`;

export const action = css`
  height: 124px;
  width: 200px;
  background: #979797;
`;

export const actionName = css`
  font-size: 18px;
  line-height: 32px;
  color: #000000;
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
