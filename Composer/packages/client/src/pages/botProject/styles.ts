// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { css } from '@emotion/core';
import { FontSizes, FontWeights } from 'office-ui-fabric-react/lib/Styling';
import { NeutralColors, SharedColors } from '@uifabric/fluent-theme';

export const header = css`
  padding: 5px 20px;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  justify-content: space-between;
  label: PageHeader;
`;

export const container = css`
  display: flex;
  flex-direction: column;
  max-width: 1000px;
  height: 100%;
`;

export const titleStyle = {
  root: {
    fontSize: FontSizes.medium,
    fontWeight: FontWeights.semibold,
  },
};

export const botNameStyle = css`
  font-size: ${FontSizes.xLarge};
  font-weight: ${FontWeights.semibold};
  color: ${NeutralColors.black};
  margin-bottom: 27px;
`;

export const mainContentHeader = css`
  display: flex;
  justify-content: space-between;
`;

export const labelContainer = css`
  display: flex;
  flex-direction: row;
`;

export const customerLabel = css`
  font-size: ${FontSizes.small};
  margin-right: 5px;
`;

export const unknownIconStyle = (required) => {
  return {
    root: {
      selectors: {
        '&::before': {
          content: required ? " '*'" : '',
          color: SharedColors.red10,
          paddingRight: 3,
        },
      },
    },
  };
};

export const runtimeLabel = (enabled: boolean) => css`
  font-size: ${FontSizes.small};
  margin-right: 5px;
  color: ${enabled ? NeutralColors.black : '#585756'};
`;

export const appIdOrPassWordStyle = css`
  display: flex;
  flex-direction: column;
`;

export const botLanguageDescriptionStyle = css`
  font-size: ${FontSizes.small};
  color: ${NeutralColors.gray130};
`;

export const botLanguageFieldStyle = css`
  font-size: ${FontSizes.small};
  color: ${NeutralColors.black};
  overflow-y: auto;
  max-height: 150px;
  border: 1px solid #c4c4c4;
  margin-top: 17px;
  padding: 10px;
`;

export const manageBotLanguage = {
  root: {
    fontSize: 12,
    fontWeight: FontWeights.regular,
    color: SharedColors.cyanBlue10,
    paddingLeft: 0,
  },
};

export const languageItem = css`
  &:hover {
    background: #ebebeb;
  }
`;

export const languageRowContainer = css`
  display: flex;
  height: 30px;
  line-height: 30px;
`;

export const languageItemContainer = css`
  display: flex;
  width: 100%;
  justify-content: space-between;
  &:hover .ms-Button {
    visibility: visible;
  }
`;

export const languageButton = {
  root: {
    fontSize: FontSizes.small,
    fontWeight: FontWeights.regular,
    color: SharedColors.cyanBlue10,
    height: 30,
    visibility: 'hidden',
  },
};

export const toggleUseCustomRuntimeStyle = {
  root: {
    marginTop: 15,
  },
};

export const botLanguageContainerStyle = css`
  margin-left: 2px;
  margin-bottom: 12px;
`;

export const runtimeLabelStyle = css`
  display: flex;
`;

export const textOr = css`
  font-size: 12px;
  margin-right: 5px;
  color: #000000;
`;

export const customRuntimeStyle = css`
  margin-left: 2px;
  margin-bottom: 14px;
`;

export const textRuntimeCode = (enable: boolean) => css`
  font-size: 12px;
  color: ${enable ? NeutralColors.black : '#585756'};
`;

export const deleteBotText = css`
  font-weight: ${FontWeights.semibold};
  font-size: 12px;
  margin-bottom: 20px;
`;

export const deleteBotButton = {
  root: {
    height: 32,
    width: 82,
    background: SharedColors.cyanBlue10,
    color: NeutralColors.white,
  },
};

export const publishTargetsContainer = css`
  display: flex;
  flex-direction: column;
`;

export const publishTargetsHeader = css`
  display: flex;
  flex-direction: row;
  height: 42px;
`;

export const publishTargetsHeaderText = css`
  width: 200px;
  font-size: ${FontSizes.medium};
  font-weight: ${FontWeights.semibold};
  border-bottom: 1px solid ${NeutralColors.gray30};
  padding-top: 10px;
  padding-left: 10px;
`;

export const publishTargetsItem = css`
  display: flex;
  flex-direction: row;
  height: 42px;
`;

export const publishTargetsItemText = css`
  width: 200px;
  font-size: ${FontSizes.medium};
  font-weight: ${FontWeights.regular};
  border-bottom: 1px solid ${NeutralColors.gray30};
  padding-top: 10px;
  padding-left: 10px;
`;

export const publishTargetsStyle = css`
  margin-left: 2px;
  margin-bottom: 14px;
`;

export const addPublishProfile = {
  root: {
    fontSize: 12,
    fontWeight: FontWeights.regular,
    color: SharedColors.cyanBlue10,
    paddingLeft: 0,
    marginLeft: 5,
  },
};

export const editPublishProfile = {
  root: {
    fontSize: 12,
    fontWeight: FontWeights.regular,
    color: SharedColors.cyanBlue10,
    paddingLeft: 0,
    paddingBottom: 5,
  },
};

export const publishTargetsEditButton = css`
  width: 200px;
  font-size: ${FontSizes.medium};
  font-weight: ${FontWeights.regular};
  border-bottom: 1px solid ${NeutralColors.gray30};
  padding-top: 3px;
  padding-left: 10px;
`;

export const runtimeSettingsStyle = css`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
`;

export const runtimeControls = css`
  margin-bottom: 18px;

  & > h1 {
    margin-top: 0;
  }
`;

export const runtimeToggle = css`
  display: flex;

  & > * {
    margin-right: 2rem;
  }
`;

export const breathingSpace = css`
  margin-bottom: 1rem;
`;

export const marginBottom = css`
  margin-bottom: 20px;
`;

export const defaultLanguageTextStyle = css`
  color: #898989;
  font-size: 8px;
`;

export const languageTextStyle = css`
  color: ${NeutralColors.black};
  font-size: 12px;
`;

export const languageButtonContainer = css`
  display: flex;
  justify-content: space-between;
  width: 240px;
`;

export const errorContainer = css`
  display: flex;
  width: 100%;
  height: 48px;
  line-height: 48px;
  background: #fed9cc;
  color: ${NeutralColors.black};
`;

export const customError = {
  root: {
    selectors: {
      'p > span': {
        width: '100%',
      },
    },
  },
};

export const errorIcon = {
  root: {
    color: '#A80000',
    marginRight: 8,
    paddingLeft: 12,
    fontSize: FontSizes.mediumPlus,
  },
};

export const errorTextStyle = css`
  margin-bottom: 5px;
`;
