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
import { TooltipHost } from 'office-ui-fabric-react/lib/components/Tooltip';
import { Icon } from 'office-ui-fabric-react/lib/Icon';

import { dispatcherState, templateFeedUrlState } from '../../../recoilModel/atoms/appState';
import TelemetryClient from '../../../telemetry/TelemetryClient';

import * as styles from './styles';

const settingsContainer = css`
  border-top: 1px solid ${NeutralColors.gray20};
  padding: 20px 0px;
  width: 100%;
`;

export const TemplateFeedForm: React.FC = () => {
  const templateFeedUrl = useRecoilValue(templateFeedUrlState);
  const { setTemplateFeedUrl } = useRecoilValue(dispatcherState);
  const [urlValue, setUrlValue] = useState(templateFeedUrl);

  const savePendingEdits = (newValue?: string) => {
    console.log('saving pending edits');
    if (urlValue === firstPartyTemplateFeed) {
      TelemetryClient.track('TemplateFeedChangedToDefaultFeed');
    } else {
      TelemetryClient.track('TemplateFeedChangedToCustomFeed');
    }
    setTemplateFeedUrl(newValue ? newValue : urlValue);
  };

  const renderLabel = React.useCallback(({ label: dropdownLabel }) => {
    return (
      <div css={styles.labelContainer}>
        <div css={styles.customerLabel}>{dropdownLabel}</div>
        <TooltipHost content={formatMessage('Alter where Composer templates originate from')}>
          <Icon iconName="Unknown" styles={styles.icon} />
        </TooltipHost>
      </div>
    );
  }, []);

  return (
    <div css={settingsContainer}>
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
          savePendingEdits(firstPartyTemplateFeed);
        }}
      >
        {formatMessage('Reset to default feed')}
      </Link>
    </div>
  );
};
