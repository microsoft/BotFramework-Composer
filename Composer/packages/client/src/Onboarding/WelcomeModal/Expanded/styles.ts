// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { css } from '@emotion/core';
import { NeutralColors, SharedColors } from '@uifabric/fluent-theme';

export const buttonStyle = css`
  position: absolute;
  right: -16px;
  top: -16px;
`;

export const contentStyle = css`
  padding: 15px;
`;

export const headerStyle = css`
  font-weight: bold;
  padding-bottom: 10px;
  text-align: center;

  img {
    height: 200px;
    padding: 10px;
  }
`;

export const footerStyle = css`
  display: flex;
  justify-content: flex-end;
  padding-top: 20px;
  min-height: 40px;
`;

export const statusStyle = css`
  padding: 5px 0;

  i {
    color: ${NeutralColors.gray150};
    padding-right: 10px;
  }

  i.completed {
    color: ${SharedColors.cyanBlue10};
  }

  span {
    color: ${NeutralColors.gray130};
  }
`;

export const subtitleStyle = css`
  font-size: 16px;
`;

export const titleStyle = css`
  padding-top: 8px;
  font-size: 24px;
`;

export const topBarStyle = css`
  position: relative;
`;
