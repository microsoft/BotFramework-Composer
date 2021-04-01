/* eslint-disable format-message/literal-pattern */
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import React from 'react';
import formatMessage from 'format-message';

interface SkillDetailProps {
  manifest: {
    dispatchModels: {
      intents: Array<string> | object;
      languages: object;
    };
    version: string;
    activities: object;
    publisherName: string;
    description: string;
    name: string;
    [key: string]: any;
  };
}
const container = css`
  width: 100%;
  margin: 10px 0px;
`;
const segment = css`
  margin: 15px 0px;
`;
const title = css`
  font-size: 20px;
  line-height: 24px;
  font-weight: 600;
`;
const subTitle = css`
  font-size: 14px;
  line-height: 20px;
  font-weight: 600;
`;
const text = css`
  font-size: 14px;
  line-height: 20px;
`;
export const SkillDetail: React.FC<SkillDetailProps> = (props) => {
  const { manifest } = props;
  console.log(manifest);
  return (
    <div css={container}>
      <div css={title}>{formatMessage(manifest?.name || '')}</div>
      <div css={segment}>
        <div css={subTitle}>{formatMessage('Description')}</div>
        <div css={text}>{formatMessage(manifest?.description || '')}</div>
      </div>
      <div css={segment}>
        <div css={subTitle}>{formatMessage('Version')}</div>
        <div css={text}>{formatMessage(manifest?.version || '')}</div>
      </div>
      <div css={segment}>
        <div css={subTitle}>{formatMessage('Activities')}</div>
        <div css={text}>{formatMessage(Object.keys(manifest?.activities).join(', '))}</div>
      </div>
      <div css={segment}>
        <div css={subTitle}>{formatMessage('Publisher')}</div>
        <div css={text}>{formatMessage(manifest?.publisherName || '')}</div>
      </div>
    </div>
  );
};
