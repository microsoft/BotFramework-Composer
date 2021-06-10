/* eslint-disable react/no-danger */
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { BotTemplate } from '@bfc/shared';
import { css, jsx } from '@emotion/core';
import formatMessage from 'format-message';
import { CommandButton } from 'office-ui-fabric-react/lib/components/Button';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
import React, { useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { useRecoilValue } from 'recoil';

import composerIcon from '../../../images/composerIcon.svg';
import { dispatcherState, selectedTemplateVersionState } from '../../../recoilModel';

const templateTitleContainer = css`
  width: 100%;
  padding-right: 2%;
  height: fit-content
  overflow: hidden;
  flex-grow: 1;
  float: left;
  word-break: break-all;
  margin-bottom: 10px;
`;

const templateTitle = css`
  position: relative;
  font-size: 19px;
  font-weight: 550;
  margin-left: 7px;
`;

const templateVersion = css`
  position: relative;
  font-size: 12px;
  font-weight: 100;
  display: block;
  width: fit-content;
  height: 10px;
  padding: 0px;
  margin-left: 6px;
`;

type TemplateDetailViewProps = {
  template?: BotTemplate;
  readMe: string;
};

export const TemplateDetailView: React.FC<TemplateDetailViewProps> = (props) => {
  const { setSelectedTemplateVersion } = useRecoilValue(dispatcherState);
  const selectedTemplateVersion = useRecoilValue(selectedTemplateVersionState);

  useEffect(() => {
    props.template?.package?.packageVersion && setSelectedTemplateVersion(props.template.package.packageVersion);
  }, [props.template]);

  const renderVersionButton = () => {
    const availableVersions = props.template?.package?.availableVersions || ([] as string[]);
    availableVersions;
    const versionOptions = {
      items: availableVersions.map((version: string) => {
        return { key: version, text: version };
      }),
      onItemClick: (ev, item) => setSelectedTemplateVersion(item.key),
    };
    return (
      <CommandButton
        menuProps={versionOptions}
        styles={{ root: templateVersion, menuIcon: { fontSize: '8px' } }}
        text={selectedTemplateVersion}
      />
    );
  };

  // Composer formats and displays its own template title and strips out title from read me to avoid redundant titles
  const getStrippedReadMe = () => {
    return props.readMe.replace(/^(#|##) (.*)/, '').trim();
  };

  return (
    <div>
      <div css={templateTitleContainer}>
        <Stack horizontal>
          <Stack.Item>
            <img
              alt={formatMessage('Composer Logo')}
              aria-label={formatMessage('Composer Logo')}
              src={composerIcon}
              style={{ marginLeft: '9px' }}
            />
          </Stack.Item>
          <Stack.Item>
            <span css={templateTitle}>{props.template?.name}</span>
            {renderVersionButton()}
          </Stack.Item>
        </Stack>
      </div>

      <ReactMarkdown linkTarget="_blank">{getStrippedReadMe()}</ReactMarkdown>
    </div>
  );
};
