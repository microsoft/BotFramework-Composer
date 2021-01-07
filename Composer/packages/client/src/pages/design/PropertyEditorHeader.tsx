// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useMemo } from 'react';
import { css } from '@emotion/core';
import { FontSizes } from '@uifabric/fluent-theme';
import formatMessage from 'format-message';
import { Link } from 'office-ui-fabric-react/lib/Link';
import { FontWeights } from '@uifabric/styling';

import { colors } from '../../colors';

const styles = {
  errorLoading: css`
    padding: 18px;
  `,

  propertyEditorHeaderStyle: css`
    border-top: 1px solid ${colors.gray(10)};
    padding: 0 18px;
    margin-bottom: 0px;
    border-bottom: 1px solid ${colors.gray(60)};
  `,

  title: css`
    font-weight: ${FontWeights.semibold};
    margin: 5px 0px;
  `,

  subtitle: css`
    display: block;
    height: 15px;
    line-height: 15px;
    font-size: ${FontSizes.size12};
    color: ${colors.gray(130)};
    font-weight: ${FontWeights.semibold};
  `,

  description: css`
    margin-top: 0;
    margin-bottom: 10px;
    white-space: pre-line;
    font-size: ${FontSizes.size12};
    margin-bottom: 10px;
  `,

  helplink: css`
    font-size: ${FontSizes.size12};
  `,
};

export type PropertyEditorHeaderProps = {
  projectData: { isRootBot: boolean; isRemote: boolean };
  botName: string;
  helpLink?: string;
};

const PropertyEditorHeader: React.FC<PropertyEditorHeaderProps> = (props) => {
  const {
    projectData: { isRootBot, isRemote },
    botName,
    helpLink,
  } = props;

  const botTypeText = useMemo(() => {
    if (isRootBot) {
      return formatMessage('Root bot.');
    } else {
      if (isRemote) {
        return formatMessage('Remote Skill.');
      }
      return formatMessage('Local Skill.');
    }
  }, [isRemote, isRootBot]);

  const botDescriptionText = useMemo(() => {
    if (isRootBot) {
      return formatMessage('Root bot of your project that greets users, and can call skills.');
    } else {
      if (isRemote) {
        return formatMessage('This configures a data driven dialog via a collection of events and actions.');
      }
      return formatMessage('A skill bot that can be called from a host bot.');
    }
  }, [isRemote, isRootBot]);

  return (
    <div css={styles.propertyEditorHeaderStyle}>
      <h2 style={{ margin: '7px 0' }}>
        {botName} {isRemote ? '(Remote)' : ''}
        <span css={styles.subtitle}>{botTypeText}</span>
      </h2>
      <p css={styles.description}>{botDescriptionText}</p>
      <p css={styles.helplink}>
        {isRemote ? (
          <Link
            aria-label={formatMessage('Learn more about skill manifests')}
            href={helpLink}
            rel="noopener noreferrer"
            target="_blank"
          >
            {formatMessage('Learn more')}
          </Link>
        ) : null}
      </p>
    </div>
  );
};

export { PropertyEditorHeader };
