// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import { useState } from 'react';
import formatMessage from 'format-message';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { firstPartyTemplateFeed } from '@bfc/shared';
import { Link } from 'office-ui-fabric-react/lib/components/Link';
import { useRecoilValue } from 'recoil';
import { NeutralColors } from '@uifabric/fluent-theme/lib/fluent/FluentColors';
import React from 'react';
import { Text } from 'office-ui-fabric-react/lib/Text';

import { dispatcherState, templateFeedUrlState } from '../../../recoilModel/atoms/appState';
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
  const { setTemplateFeedUrl } = useRecoilValue(dispatcherState);
  const [urlValue, setUrlValue] = useState(templateFeedUrl ? templateFeedUrl : firstPartyTemplateFeed);

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

  return (
    <div css={settingsContainer}>
      <div css={settingsText}>
        <Text>{formatMessage('Configure the template feed that Composer sources its bot templates from.')}</Text>
      </div>
      <TextField
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
