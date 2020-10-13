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

export const labelContainer = css`
  display: flex;
  flex-direction: row;
`;

export const customerLabel = css`
  font-size: ${FontSizes.small};
  margin-right: 5px;
`;

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
`;

export const manageBotLanguage = {
  root: {
    fontSize: 12,
    color: SharedColors.cyanBlue10,
    paddingLeft: 0,
  },
};

export const languageItem = css`
  margin: 5px;
`;

export const toggleUseCustomRuntimeStyle = {
  root: {
    marginTop: 15,
  },
};

export const botLanguageContainerStyle = css`
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
