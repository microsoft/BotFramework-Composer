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

export const addQnAPairLink = {
  root: {
    fontSize: 14,
    lineHeight: 28,
    marginLeft: 72,
  },
};

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
    fontSize: 16,
    paddingLeft: 0,
    marginLeft: 2,
    color: SharedColors.cyanBlue10,
    visibility: 'hidden',
  },
};

export const addQnAPair = {
  root: {
    fontSize: 16,
    paddingLeft: 0,
    marginLeft: 68,
    color: SharedColors.cyanBlue10,
  },
};

export const addIcon = {
  root: {
    fontSize: FontSizes.size10,
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
      maxHeight: 500,
    },
  };
};

export const editableFieldQuestion = (index) => {
  return {
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
      fontWeight: index === 0 ? FontWeights.semibold : FontWeights.regular,
    },
  };
};

export const groupHeader = {
  root: {
    selectors: {
      //eslint-disable-next-line
      button: {
        fontSize: 16,
      },
    },
  },
};

export const groupNameStyle = css`
  margin-top: -5px;
`;
