// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import formatMessage from 'format-message';
import React from 'react';

// -------------------- Styles -------------------- //

const descriptionWrapper = css`
  display: inline-block;
  height: 59px;
  width: 50%;
  paddingleft: 30px;
`;

// -------------------- BotTypeTile -------------------- //

interface IBotTypeTileProps {
  botName: string;
  botDescription: string;
}

export const BotTypeTile: React.FC<IBotTypeTileProps> = (props: IBotTypeTileProps) => {
  return <div css={descriptionWrapper}>{formatMessage(props.botDescription)}</div>;
};
