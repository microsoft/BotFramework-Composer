/* eslint-disable react/no-danger */
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { BotTemplate } from '@bfc/shared';
import { css, jsx } from '@emotion/core';
import formatMessage from 'format-message';
import { PrimaryButton } from 'office-ui-fabric-react/lib/components/Button';
import React, { useState } from 'react';
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
  const [selectedVersion, setSelectedVersion] = useState<string>('');

  const renderVersionButton = () => {
    const versionOptions = {
      items: [
        { key: '1', text: '1' },
        { key: '2', text: '2' },
        { key: '3', text: '3' },
      ],
      onItemClick: (ev, item) => setSelectedVersion(item.key),
    };
    return (
      <PrimaryButton
        disabled={false}
        menuProps={versionOptions}
        split={versionOptions != undefined}
        styles={{ root: { maxWidth: 180, textOverflow: 'ellipsis' } }}
        onClick={() => {
          console.log('changeVersions');
        }}
      >
        <span>
          <span css={{ display: 'inline-block', overflow: 'hidden' }}>{'install '}</span>&nbsp;
          <span
            css={{
              maxWidth: 80,
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              display: 'inline-block',
            }}
            title={'Selected version'}
          >
            {selectedVersion}
          </span>
        </span>
      </PrimaryButton>
    );
  };

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
        {renderVersionButton()}
      </div>
      <ReactMarkdown linkTarget="_blank">{getStrippedReadMe()}</ReactMarkdown>
    </div>
  );
};
