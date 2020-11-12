// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import * as React from 'react';
import { RouteComponentProps } from '@reach/router';
import { Dialog, DialogType, IDialogContentProps } from 'office-ui-fabric-react/lib/Dialog';
import { IProgressIndicatorStyles, ProgressIndicator } from 'office-ui-fabric-react/lib/ProgressIndicator';
import formatMessage from 'format-message';
import { FontWeights } from 'office-ui-fabric-react/lib/Styling';
import { PublishTarget } from '@botframework-composer/types';
import { generateUniqueId } from '@bfc/shared';

import compIcon from '../../images/composerIcon.svg';
import pvaIcon from '../../images/pvaIcon.svg';
import dataTransferLine from '../../images/dataTransferLine.svg';

type KnownPublishTargets = 'pva-publish-composer';

type PullState = 'connecting' | 'downloading';

type PullStatusProps = {
  publishTarget: PublishTarget | undefined;
  state: PullState;
};

const contentProps: IDialogContentProps = {
  type: DialogType.normal,
  styles: {
    header: {
      display: 'none',
    },
    content: {
      height: '100%',
    },
    inner: {
      height: '100%',
    },
    innerContent: {
      display: 'flex',
      flexFlow: 'column nowrap',
      height: '100%',
      justifyContent: 'center',
    },
  },
};

const serviceIcon = css`
  width: 33px;
`;

const boldBlueText = css`
  font-weight: ${FontWeights.semibold};
  color: #106ebe;
  word-break: break-work;
`;

const iconContainer = css`
  display: flex;
  justify-content: center;
`;

const progressLabel = css`
  font-size: 16px;
  white-space: normal;
`;

const dataTransferStyle = css`
  margin: 0 16px;
  width: 78px;
`;

const centeredProgressIndicatorStyles: Partial<IProgressIndicatorStyles> = { itemName: { textAlign: 'center' } };

function getServiceIcon(targetType?: KnownPublishTargets) {
  let icon;
  switch (targetType) {
    case 'pva-publish-composer':
      icon = (
        <img
          alt={formatMessage('PowerVirtualAgents Logo')}
          aria-label={formatMessage('PowerVirtualAgents Logo')}
          css={serviceIcon}
          src={pvaIcon}
        />
      );
      break;

    // don't draw anything, just render the Composer icon
    default:
      return undefined;
  }
  return (
    <React.Fragment>
      {icon}
      <img
        alt={formatMessage('Data transferring between services')}
        aria-label={formatMessage('Data transferring between services')}
        css={dataTransferStyle}
        src={dataTransferLine}
      />
    </React.Fragment>
  );
}

const Bold = ({ children }) => (
  <span key={generateUniqueId()} css={boldBlueText}>
    {children}
  </span>
);

export const PullStatus: React.FC<RouteComponentProps & PullStatusProps> = (props) => {
  const { publishTarget, state } = props;

  const composerIcon = (
    <img
      alt={formatMessage('Composer Logo')}
      aria-label={formatMessage('Composer Logo')}
      css={serviceIcon}
      src={compIcon}
    />
  );

  switch (state) {
    case 'connecting': {
      const label = (
        <p css={progressLabel}>
          {formatMessage.rich('Connecting to <b>{ targetName }</b> to import bot content...', {
            b: Bold,
            targetName: publishTarget?.name,
          })}
        </p>
      );
      return (
        <Dialog
          dialogContentProps={contentProps}
          hidden={false}
          minWidth={560}
          modalProps={{ isBlocking: true }}
          styles={{ main: { height: 263 } }}
        >
          <span css={iconContainer}>
            {getServiceIcon(publishTarget?.type as KnownPublishTargets)}
            {composerIcon}
          </span>
          <ProgressIndicator label={label} styles={centeredProgressIndicatorStyles} />
        </Dialog>
      );
    }

    case 'downloading': {
      const label = (
        <p css={progressLabel}>
          {formatMessage('Importing bot content from {targetName}...', { targetName: publishTarget?.name })}
        </p>
      );
      return (
        <Dialog
          dialogContentProps={contentProps}
          hidden={false}
          minWidth={560}
          modalProps={{ isBlocking: true }}
          styles={{ main: { height: 263 } }}
        >
          <span css={iconContainer}>
            {getServiceIcon(publishTarget?.type as KnownPublishTargets)}
            {composerIcon}
          </span>
          <ProgressIndicator label={label} styles={centeredProgressIndicatorStyles} />
        </Dialog>
      );
    }

    default:
      throw new Error(`PullStatus trying to render for unexpected status: ${state}`);
  }
};
