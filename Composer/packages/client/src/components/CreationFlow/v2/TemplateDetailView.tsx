/* eslint-disable react/no-danger */
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { BotTemplate } from '@bfc/shared';
import { css, jsx } from '@emotion/core';
import formatMessage from 'format-message';
import React from 'react';
import ReactMarkdown from 'react-markdown';

import composerIcon from '../../../images/composerIcon.svg';

const templateTitleContainer = css`
  width: 100%;
  padding-right: 2%;
  height: fit-content
  overflow: hidden;
  flex-grow: 1;
  float: left;
  word-break: break-all;
`;

const templateTitle = css`
  position: relative;
  bottom: 18px;
  font-size: 19px;
  font-weight: 550;
  margin-left: 10px;
`;

const templateVersion = css`
  position: relative;
  font-size: 12px;
  font-weight: 100;
  display: block;
  left: 55px;
  width: fit-content;
  bottom: 18px;
`;

type TemplateDetailViewProps = {
  template?: BotTemplate;
  readMe: string;
};

export const TemplateDetailView: React.FC<TemplateDetailViewProps> = (props) => {
  // Composer formats and displays its own template title and strips out title from read me to avoid redundant titles
  const getStrippedReadMe = () => {
    return props.readMe.replace(/^(#|##) (.*)/, '').trim();
  };

  return (
    <div>
      <div css={templateTitleContainer}>
        <img
          alt={formatMessage('Composer Logo')}
          aria-label={formatMessage('Composer Logo')}
          src={composerIcon}
          style={{ marginLeft: '9px' }}
        />
        <span css={templateTitle}>{props.template?.name}</span>
        <span css={templateVersion}>{props.template?.package?.packageVersion}</span>
      </div>
      <ReactMarkdown linkTarget="_blank">{getStrippedReadMe()}</ReactMarkdown>
    </div>
  );
};
