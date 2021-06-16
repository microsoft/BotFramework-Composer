/* eslint-disable react/no-danger */
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { BotTemplate, localTemplateId } from '@bfc/shared';
import { css, jsx } from '@emotion/core';
import formatMessage from 'format-message';
import React, { Fragment } from 'react';
import ReactMarkdown from 'react-markdown';
import { Text } from 'office-ui-fabric-react/lib/Text';
import { Link } from 'office-ui-fabric-react/lib/Link';
import { TextField } from 'office-ui-fabric-react/lib/components/TextField';
import { FontIcon } from 'office-ui-fabric-react/lib/Icon';
import { SharedColors } from '@uifabric/fluent-theme/lib/fluent/FluentColors';

import composerIcon from '../../images/composerIcon.svg';
import httpClient from '../../utils/httpUtil';

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
  localTemplatePath: string;
  onValidateLocalTemplatePath: (isValid: boolean) => void;
  onUpdateLocalTemplatePath: (path: string) => void;
};

const templateDocUrl = 'https://aka.ms/localComposerTemplateDoc';

export const TemplateDetailView: React.FC<TemplateDetailViewProps> = (props) => {
  const { localTemplatePath, onUpdateLocalTemplatePath, onValidateLocalTemplatePath, template } = props;
  const isLocalTemplate = template?.id === localTemplateId;

  // Composer formats and displays its own template title and strips out title from read me to avoid redundant titles
  const getStrippedReadMe = () => {
    return props.readMe.replace(/^(#|##) (.*)/, '').trim();
  };

  const validatePath = async (path): Promise<string> => {
    const response = await httpClient.get(`/storages/validate/${encodeURI(path)}`);
    const validateMessage = response.data.errorMsg;
    if (typeof validateMessage === 'string' && validateMessage.includes('path')) {
      onValidateLocalTemplatePath(false);
      return formatMessage('This path does not exist');
    } else if (validateMessage) {
      onValidateLocalTemplatePath(true);
    }
    return '';
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
        onChange={(_e, val) => onUpdateLocalTemplatePath(val || '')}
        onGetErrorMessage={validatePath}
      />
    </Fragment>
  );

  const renderTemplateIcon = () => {
    return isLocalTemplate ? (
      <FontIcon
        aria-label={formatMessage('Add icon')}
        iconName="Add"
        style={{ marginLeft: '9px', color: `${SharedColors.cyanBlue10}`, fontSize: '20px' }}
      />
    ) : (
      <img
        alt={formatMessage('Composer Logo')}
        aria-label={formatMessage('Composer Logo')}
        src={composerIcon}
        style={{ marginLeft: '9px' }}
      />
    );
  };

  return (
    <div>
      <div css={templateTitleContainer(isLocalTemplate)}>
        {renderTemplateIcon()}
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
