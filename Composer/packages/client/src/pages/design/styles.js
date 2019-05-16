import { css } from '@emotion/core';
import { mergeStyleSets, FontSizes, FontWeights } from 'office-ui-fabric-react/lib/Styling';

export const contentContainer = css`
  display: flex;
  height: calc(99vh - 50px);
`;

export const projectContainer = css`
  display: flex;
  flex-direction: column;
  flex-grow: 0;
  flex-shrink: 0;
  width: 255px;
  margin-left: 20px;
  margin-top: 20px;
`;

export const projectWrapper = css`
  padding: 10px;
  color: #4f4f4f;
`;

export const projectHeader = css`
  font-weight: bold;
  margin-bottom: 5px;
  display: flex;
  justify-content: space-between;
  align-items: center;
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
  height: calc(100% - 20px);
  flex-grow: 4;
  margin-top: 20px;
  margin-left: 20px;
  margin-right: 20px;
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
    fontSize: FontSizes.smallPlus,
    fontWeight: FontWeights.bold,
    padding: '4px 8px',
  },
  chevron: {
    fontSize: FontSizes.mini,
    fontWeight: FontWeights.bold,
  },
});
