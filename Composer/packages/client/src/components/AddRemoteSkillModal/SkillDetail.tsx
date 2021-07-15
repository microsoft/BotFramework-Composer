// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import React from 'react';
import formatMessage from 'format-message';
type SkillDetailProps = {
  manifest: {
    dispatchModels?: {
      intents: string[] | object;
      languages: Record<string, any>;
    };
    version?: string;
    activities?: Record<
      string,
      {
        type: string;
        name: string;
      }
    >;
    publisherName?: string;
    description?: string;
    name?: string;
  };
};
const container = css`
  width: 100%;
  height: 100%;
  overflow-y: auto;
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
  return (
    <div css={container}>
      <div css={title}>{manifest.name || ''}</div>
      <div css={segment}>
        <div css={subTitle}>{formatMessage('Description')}</div>
        <div css={text}>{manifest.description || ''}</div>
      </div>
      <div css={segment}>
        <div css={subTitle}>{formatMessage('Version')}</div>
        <div css={text}>{manifest.version || ''}</div>
      </div>
      <div css={segment}>
        <div css={subTitle}>{formatMessage('Activities')}</div>
        <div css={text}>{manifest.activities ? Object.keys(manifest.activities).join(', ') : ''}</div>
      </div>
      <div css={segment}>
        <div css={subTitle}>{formatMessage('Publisher')}</div>
        <div css={text}>{manifest.publisherName || ''}</div>
      </div>
    </div>
  );
};
