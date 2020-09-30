// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { css } from '@emotion/core';
import { FontWeights } from '@uifabric/styling';
import { NeutralColors, SharedColors, FontSizes } from '@uifabric/fluent-theme';

export const content = css`
  min-height: 28px;
  outline: none;
`;

export const contentAnswer = (showAll: boolean) => css`
  text-overflow: ellipsis;
  height: ${showAll ? 'auto' : '28px'};
  outline: none;
`;

export const formCell = css`
  display: flex;
  flex-direction: column;
  outline: none;
  :focus {
    outline: rgb(102, 102, 102) solid 1px;
  }
  white-space: pre-wrap;
  font-size: 14px;
  line-height: 28px;
  height: 100%;
`;

export const inlineContainer = (isBold) => css`
  font-weight: ${isBold ? FontWeights.semibold : 400};
`;

export const textFieldQuestion = {
  root: {
    height: 28,
    marginLeft: -5,
  },
  field: {
    paddingLeft: 4,
    marginTop: -5,
  },
};

export const textFieldAnswer = {
  root: {
    minHeight: 28,
    marginLeft: -5,
    marginTop: -1,
  },
  field: {
    lineHeight: 28,
    paddingTop: 0,
    paddingBottom: 0,
    paddingLeft: 4,
  },
};

// export const addQnAPairLink = {
//   root: {
//     fontSize: 14,
//     lineHeight: 28,
//     marginLeft: 72,
//   },
// };

export const divider = css`
  height: 1px;
  background: ${NeutralColors.gray30};
`;

export const rowDetails = {
  root: {
    minHeight: 76,
    selectors: {
      '&:hover': {
        background: NeutralColors.gray30,
        selectors: {
          '.ms-TextField-fieldGroup': {
            background: NeutralColors.gray30,
          },
          '.ms-Button--icon': {
            visibility: 'visible',
          },
          '.ms-Button': {
            visibility: 'visible',
          },
        },
      },
      '&.is-selected': {
        selectors: {
          '.ms-Button--icon': {
            visibility: 'visible',
          },
          '.ms-Button': {
            visibility: 'visible',
          },
          '.ms-TextField-fieldGroup': {
            background: NeutralColors.gray30,
          },
        },
      },
      '&.is-selected:hover': {
        background: NeutralColors.gray30,
      },
    },
  },
};

export const icon = {
  root: {
    color: NeutralColors.black,
    visibility: 'hidden',
  },
};

export const addAlternative = {
  root: {
    fontSize: 12,
    paddingLeft: 0,
    marginLeft: -5,
    color: SharedColors.cyanBlue10,
    visibility: 'hidden',
  },
};

export const addQnAPair = {
  root: {
    fontSize: 12,
    paddingLeft: 0,
    marginLeft: 57,
    marginTop: -10,
    color: SharedColors.cyanBlue10,
  },
};

export const addIcon = {
  root: {
    fontSize: FontSizes.size10,
    margin: 0,
    color: SharedColors.cyanBlue10,
  },
};

export const backIcon = {
  root: {
    fontSize: FontSizes.size16,
    color: NeutralColors.black,
    marginTop: -10,
    marginBottom: 10,
  },
  icon: {
    fontSize: FontSizes.size12,
    marginTop: 2,
    color: NeutralColors.black,
  },
};

export const editableFieldAnswer = (isExpand) => {
  return {
    root: {
      height: '100%',
      selectors: {
        '.ms-TextField-wrapper': {
          height: '100%',
        },
      },
    },
    fieldGroup: {
      height: '100%',
      border: '0',
      selectors: {
        '&.ms-TextField-fieldGroup': {
          selectors: {
            '::after': {
              border: 'none !important',
            },
          },
        },
      },
    },
    field: {
      height: isExpand ? undefined : '60px !important',
      overflowY: 'auto' as 'auto',
      fontSize: FontSizes.size12,
      maxHeight: 500,
    },
  };
};

export const editableFieldQuestion = {
  fieldGroup: {
    border: '0',
    selectors: {
      '&.ms-TextField-fieldGroup': {
        selectors: {
          '::after': {
            border: 'none !important',
          },
        },
      },
    },
  },
  field: {
    fontSize: FontSizes.size12,
    selectors: {
      '::placeholder': {
        fontSize: FontSizes.size12,
      },
    },
  },
};

export const groupHeader = {
  root: {
    selectors: {
      '.ms-GroupHeader-expand': {
        fontSize: 12,
        marginLeft: 16,
      },
    },
  },
};

export const groupNameStyle = css`
  margin-top: -5px;
  margin-left: 8px;
  font-size: ${FontSizes.size16};
  font-weight: ${FontWeights.semibold};
`;

export const detailsHeaderStyle = css`
  .ms-TooltipHost {
    background: ${NeutralColors.white};
  }
`;
