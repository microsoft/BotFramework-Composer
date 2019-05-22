import { css } from '@emotion/core';
import { NeutralColors, Depths, SharedColors } from '@uifabric/fluent-theme';
import { FontSizes, FontWeights } from 'office-ui-fabric-react/lib/Styling';

export const main = css`
  height: calc(100vh - 105px);
  display: flex;
`;

export const sideBar = css`
  width: 80px;
  background-color: ${NeutralColors.gray20};
  height: 100%;
  box-shadow: ${Depths.depth8};
`;

export const content = css`
  height: 100%;
  overflow: hidden;
  z-index: 2;
  flex: 1;
`;

export const newBotModal = {
  main: { maxWidth: '600px', width: '60vw' },
};

export const newContainer = css`
  padding: 27px 36px 29px 39px;
`;

export const newModalTitle = css`
  font-weight: ${FontWeights.semibold};
  font-size: ${FontSizes.icon};
  line-height: 19px;
`;

export const newModalForm = css`
  margin-top: 42px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 460px;
`;

export const templateList = css`
  list-style: none;
  margin: 0;
  padding: 5px;
  border: 1px solid;
  height: 160px;
  overflow: auto;
`;

export const templateItem = isActive => css`
  height: 30px;
  line-height: 30px;
  margin-top: 5px;
  padding-left: 5px;
  background: ${isActive ? SharedColors.cyanBlue10 : NeutralColors.white};
  color: ${isActive ? NeutralColors.white : NeutralColors.black};

  &:hover {
    background: ${isActive ? SharedColors.cyanBlue10 : NeutralColors.gray20};
  }
`;

export const actionWrap = css`
  display: flex;
  justify-content: flex-end;
`;
