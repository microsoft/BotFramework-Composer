/* eslint-disable react/no-danger */
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { BotTemplate, localTemplateId } from '@bfc/shared';
import { css, jsx } from '@emotion/core';
import formatMessage from 'format-message';
import { CommandButton } from 'office-ui-fabric-react/lib/components/Button';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
import React, { useEffect, Fragment, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import { Text } from 'office-ui-fabric-react/lib/Text';
import { Link } from 'office-ui-fabric-react/lib/Link';
import { TextField } from 'office-ui-fabric-react/lib/components/TextField';
import { FontIcon } from 'office-ui-fabric-react/lib/Icon';
import { SharedColors } from '@uifabric/fluent-theme/lib/fluent/FluentColors';
import { useRecoilValue } from 'recoil';

import composerIcon from '../../images/composerIcon.svg';
import httpClient from '../../utils/httpUtil';
import { dispatcherState, selectedTemplateVersionState } from '../../recoilModel';
import { useFeatureFlag } from '../../utils/hooks';

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
  margin-bottom: 10px;
`;

const templateTitle = (isLocalTemplate: boolean) => css`
  position: relative;
  bottom: ${isLocalTemplate ? '4px' : '0px'};
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
  localTemplatePath: string;
  onValidateLocalTemplatePath: (isValid: boolean) => void;
  onUpdateLocalTemplatePath: (path: string) => void;
};

const templateDocUrl = 'https://aka.ms/localComposerTemplateDoc';

export const TemplateDetailView: React.FC<TemplateDetailViewProps> = (props) => {
  const { setSelectedTemplateVersion } = useRecoilValue(dispatcherState);
  const selectedTemplateVersion = useRecoilValue(selectedTemplateVersionState);
  const advancedTemplateOptionsEnabled = useFeatureFlag('ADVANCED_TEMPLATE_OPTIONS');

  useEffect(() => {
    props.template?.package?.packageVersion && setSelectedTemplateVersion(props.template.package.packageVersion);
  }, [props.template]);

  const renderVersionButton = useMemo(() => {
    if (!advancedTemplateOptionsEnabled) {
      return <span css={templateVersion}>{props.template?.package?.packageVersion}</span>;
    }
    const availableVersions = props.template?.package?.availableVersions || ([] as string[]);
    const versionOptions = {
      items: availableVersions.map((version: string) => {
        return { key: version, text: version };
      }),
      onItemClick: (ev, item) => setSelectedTemplateVersion(item.key),
      calloutProps: {
        calloutMaxHeight: 300,
      },
    };
    return (
      <CommandButton
        menuProps={versionOptions}
        styles={{ root: templateVersion, menuIcon: { fontSize: '8px' } }}
        text={selectedTemplateVersion}
      />
    );
  }, [props.template, advancedTemplateOptionsEnabled]);

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
        <Stack horizontal>
          <Stack.Item>{renderTemplateIcon()}</Stack.Item>
          <Stack.Item>
            <span css={templateTitle(isLocalTemplate)}>
              {props.template?.name ? props.template.name : formatMessage('Template undefined')}
            </span>
            {!isLocalTemplate && renderVersionButton}
          </Stack.Item>
        </Stack>
      </div>
      {isLocalTemplate ? (
        renderLocalTemplateForm()
      ) : (
        <ReactMarkdown linkTarget="_blank">{getStrippedReadMe()}</ReactMarkdown>
      )}
    </div>
  );
};
