// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import React from 'react';
import { TruncatedText } from '@bfc/ui-shared';

type CardCommentProps = {
  comment?: string;
};

const styles = {
  container: css`
    background-color: #fff4ce;
    padding: 8px;
    padding-bottom: 10px;
    position: relative;
  `,
  fold: css`
    position: absolute;
    bottom: 0;
    left: 0;
    height: 0;
    width: 0;
    border-top: 4px solid #ded2a7;
    border-left: 4px solid #fff;
    border-right: 4px solid #ded2a7;
    border-bottom: 4px solid #fff;
  `,
};

const CardComment: React.FC<CardCommentProps> = ({ comment }) => {
  return (
    <div css={styles.container}>
      <TruncatedText lines={2}>{comment}</TruncatedText>
      <div css={styles.fold} />
    </div>
  );
};

export { CardComment };
