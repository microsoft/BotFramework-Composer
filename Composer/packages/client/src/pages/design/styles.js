import { css } from '@emotion/core';
import { mergeStyleSets, FontSizes, FontWeights } from 'office-ui-fabric-react/lib/Styling';
import { NeutralColors } from '@uifabric/fluent-theme';

const contentTopMargin = 10;
const contentBottomMargin = 0;

export const contentContainer = css`
  display: flex;
  height: calc(100vh - ${105 + contentTopMargin + contentBottomMargin}px);
  margin-top: ${contentTopMargin}px;
  margin-bottom: ${contentBottomMargin}px;
  margin-left: 20px;
`;

export const projectContainer = css`
  display: flex;
  flex-direction: column;
  flex-grow: 0;
  flex-shrink: 0;
  width: 255px;
`;

export const projectWrapper = css``;

export const projectHeader = css`
  font-weight: bold;
  padding: 7px 10px;
  line-height: 14px;
  font-size: ${FontSizes.medium};
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: ${NeutralColors.gray20};
`;

export const projectTree = css`
  flex-grow: 3;
  flex-shrink: 3;
`;

export const assetTree = css`
  flex-grow: 2;
  flex-shrink: 2;
`;

export const editorContainer = css`
  display: flex;
  flex-direction: column;
  height: 100%;
  flex-grow: 4;
`;

export const editorWrapper = css`
  display: flex;
  flex-direction: row;
  flex-grow: 1;
`;

export const visualEditor = css`
  height: 100%;
  flex: 1;
  border: 0px;
  background-color: ${NeutralColors.gray20};
`;

export const formEditor = css`
  height: 100%;
  flex: 1;
  border: 0px;
  transition: width 0.2s ease-in-out;
`;

export const breadcrumbClass = mergeStyleSets({
  root: {
    margin: '0',
    padding: '10px',
  },
  itemLink: {
    fontSize: FontSizes.medium,
    fontWeight: FontWeights.bold,
    padding: '4px 8px',
  },
  chevron: {
    fontSize: FontSizes.mini,
    fontWeight: FontWeights.bold,
  },
});
