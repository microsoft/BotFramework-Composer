/* eslint-disable react/no-danger */
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { BotTemplate, localTemplateId } from '@bfc/shared';
import { css, jsx } from '@emotion/core';
import formatMessage from 'format-message';
import React, { Fragment } from 'react';
import ReactMarkdown from 'react-markdown';
import { useRecoilValue } from 'recoil';
import { Text } from 'office-ui-fabric-react/lib/Text';
import { Link } from 'office-ui-fabric-react/lib/Link';
import { TextField } from 'office-ui-fabric-react/lib/components/TextField';

import composerIcon from '../../../images/composerIcon.svg';
import addIcon from '../../../images/addIcon.svg';
import { dispatcherState, localTemplatePathState } from '../../../recoilModel';
import httpClient from '../../../utils/httpUtil';

const templateTitleContainer = (isLocalTemplate: boolean) => css`
  width: 100%;
  padding-right: 2%;
  height: fit-content
  overflow: hidden;
  flex-grow: 1;
  float: left;
  word-break: break-all;
  padding-top: ${isLocalTemplate ? '15px' : '0px'};
  padding-bottom: ${isLocalTemplate ? '15px' : '0px'};
`;

const templateTitle = (isLocalTemplate: boolean) => css`
  position: relative;
  bottom: ${isLocalTemplate ? '4px' : '18px'};
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

const templateDocUrl = 'https://aka.ms/localComposerTemplateDoc';

export const TemplateDetailView: React.FC<TemplateDetailViewProps> = (props) => {
  const { setLocalTemplatePathState } = useRecoilValue(dispatcherState);

  const localTemplatePath = useRecoilValue(localTemplatePathState);
  const isLocalTemplate = props.template?.id === localTemplateId;
  // Composer formats and displays its own template title and strips out title from read me to avoid redundant titles
  const getStrippedReadMe = () => {
    return props.readMe.replace(/^(#|##) (.*)/, '').trim();
  };

  const validatePath = async (path): Promise<string> => {
    const response = await httpClient.get(`/storages/validate/${encodeURI(path)}`);
    return response.data.errorMsg;
  };

  const renderLocalTemplateForm = () => (
    <Fragment>
      <Text>
        {formatMessage.rich(
          `To create a bot from your own Bot Framework Template you need to add a path to your local templates index.js file. <templateDocLink>Learn more</templateDocLink>`,
          {
            templateDocLink: ({ children }) => (
              <Link key="local-template-link" href={templateDocUrl} rel="noopener noreferrer" target="_blank">
                {children}
              </Link>
            ),
          }
        )}
      </Text>
      <TextField
        label={formatMessage('Local Template Path')}
        styles={{ root: { marginTop: '10px' } }}
        value={localTemplatePath}
        onChange={(_e, val) => setLocalTemplatePathState(val || '')}
        onGetErrorMessage={validatePath}
      />
    </Fragment>
  );

  return (
    <div>
      <div css={templateTitleContainer(isLocalTemplate)}>
        {isLocalTemplate ? (
          <img
            alt={formatMessage('Add Icon')}
            aria-label={formatMessage('Add Icon')}
            src={addIcon}
            style={{ marginLeft: '9px', height: '20px', width: '20px' }}
          />
        ) : (
          <img
            alt={formatMessage('Composer Logo')}
            aria-label={formatMessage('Composer Logo')}
            src={composerIcon}
            style={{ marginLeft: '9px' }}
          />
        )}
        <span css={templateTitle(isLocalTemplate)}>{props.template?.name}</span>
        {!isLocalTemplate && <span css={templateVersion}>{props.template?.package?.packageVersion}</span>}
      </div>
      {isLocalTemplate ? (
        renderLocalTemplateForm()
      ) : (
        <ReactMarkdown linkTarget="_blank">{getStrippedReadMe()}</ReactMarkdown>
      )}
    </div>
  );
};
