// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import { useEffect, useState } from 'react';
import formatMessage from 'format-message';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { firstPartyTemplateFeed } from '@bfc/shared';
import { Link } from 'office-ui-fabric-react/lib/components/Link';
import { useRecoilValue } from 'recoil';
import { NeutralColors } from '@uifabric/fluent-theme/lib/fluent/FluentColors';
import React from 'react';
import { Text } from 'office-ui-fabric-react/lib/Text';

import { dispatcherState, templateFeedUrlState, templateProjectsState } from '../../../recoilModel/atoms/appState';
import TelemetryClient from '../../../telemetry/TelemetryClient';

import * as styles from './styles';

const settingsContainer = css`
  border-top: 1px solid ${NeutralColors.gray20};
  padding-top: 5px;
  width: 100%;
`;

const settingsText = css`
  padding-bottom: 20px;
  width: 100%;
`;

export const TemplateFeedForm: React.FC = () => {
  const templateFeedUrl = useRecoilValue(templateFeedUrlState);
  const templateProjects = useRecoilValue(templateProjectsState);
  const { setTemplateFeedUrl, fetchTemplates } = useRecoilValue(dispatcherState);

  const [urlValue, setUrlValue] = useState(templateFeedUrl ? templateFeedUrl : firstPartyTemplateFeed);
  const [errorMessage, setErrorMessage] = useState('');
  const [fieldDisabled, setFieldDisabled] = useState(false);

  const savePendingEdits = (isFirstPartyFeed?: boolean) => {
    if (urlValue === firstPartyTemplateFeed || isFirstPartyFeed) {
      TelemetryClient.track('TemplateFeedChangedToDefaultFeed');
      setTemplateFeedUrl('');
    } else {
      TelemetryClient.track('TemplateFeedChangedToCustomFeed');
      setTemplateFeedUrl(urlValue);
    }
  };

  const renderLabel = React.useCallback(({ label: dropdownLabel }) => {
    return (
      <div css={styles.labelContainer}>
        <div css={styles.customerLabel}>{dropdownLabel}</div>
      </div>
    );
  }, []);

  useEffect(() => {
    setFieldDisabled(true);

    if (templateFeedUrl) {
      fetchTemplates([templateFeedUrl]);
    } else {
      fetchTemplates([firstPartyTemplateFeed]);
    }
  }, [templateFeedUrl]);

  useEffect(() => {
    setFieldDisabled(false);
    if (templateProjects.length < 1) {
      setErrorMessage('This feed did not return any templates, please confirm that this is a valid template feed URL.');
    } else {
      setErrorMessage('');
    }
  }, [templateProjects]);

  return (
    <div css={settingsContainer}>
      <div css={settingsText}>
        <Text>{formatMessage('Configure the template feed that Composer sources its bot templates from.')}</Text>
      </div>
      <TextField
        disabled={fieldDisabled}
        errorMessage={errorMessage}
        label={formatMessage('Template Feed Url')}
        value={urlValue}
        onBlur={(ev) => {
          savePendingEdits();
        }}
        onChange={(ev, newValue) => {
          if (newValue) {
            setUrlValue(newValue);
          } else {
            setUrlValue('');
          }
        }}
        onRenderLabel={renderLabel}
      />
      <Link
        styles={{ root: { paddingTop: '10px' } }}
        onClick={(ev) => {
          setUrlValue(firstPartyTemplateFeed);
          savePendingEdits(true);
        }}
      >
        {formatMessage('Reset to default feed')}
      </Link>
    </div>
  );
};
