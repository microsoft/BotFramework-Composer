// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import * as React from 'react';
import { RouteComponentProps } from '@reach/router';
import { Dialog, DialogType, IDialogContentProps } from 'office-ui-fabric-react/lib/Dialog';
import { ProgressIndicator } from 'office-ui-fabric-react/lib/ProgressIndicator';
import formatMessage from 'format-message';
import { FontWeights } from 'office-ui-fabric-react/lib/Styling';
import { PublishTarget } from '@botframework-composer/types';

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

const boldBlueText = css`
  font-weight: ${FontWeights.semibold};
  color: #106ebe;
  word-break: break-work;
`;

export const PullStatus: React.FC<RouteComponentProps & PullStatusProps> = (props) => {
  const { publishTarget, state } = props;

  const composerIcon = (
    <img
      alt={formatMessage('Composer Logo')}
      aria-label={formatMessage('Composer Logo')}
      src={compIcon}
      style={{ width: '33px' }}
    />
  );

  switch (state) {
    case 'connecting': {
      const label = (
        <p style={{ fontSize: 16, whiteSpace: 'normal' }}>
          {formatMessage('Connecting to ')}
          <span css={boldBlueText}>{publishTarget?.name}</span>
          {formatMessage(' to import bot content...')}
        </p>
      );
      return (
        <Dialog
          dialogContentProps={contentProps}
          hidden={false}
          minWidth={560}
          styles={{ main: { height: 263 } }}
          modalProps={{ isBlocking: true }}
        >
          <span style={{ display: 'flex', justifyContent: 'center' }}>
            {getServiceIcon(publishTarget?.type as KnownPublishTargets)}
            {composerIcon}
          </span>
          <ProgressIndicator label={label} styles={{ itemName: { textAlign: 'center' } }} />
        </Dialog>
      );
    }

    case 'downloading': {
      const label = (
        <p style={{ fontSize: 16, whiteSpace: 'normal' }}>
          {formatMessage('Importing bot content from {targetName}...', { targetName: publishTarget?.name })}
        </p>
      );
      return (
        <Dialog
          dialogContentProps={contentProps}
          hidden={false}
          minWidth={560}
          styles={{ main: { height: 263 } }}
          modalProps={{ isBlocking: true }}
        >
          <span style={{ display: 'flex', justifyContent: 'center' }}>
            {getServiceIcon(publishTarget?.type as KnownPublishTargets)}
            {composerIcon}
          </span>
          <ProgressIndicator label={label} styles={{ itemName: { textAlign: 'center' } }} />
        </Dialog>
      );
    }

    default:
      return <div style={{ display: 'none' }}></div>;
  }
};

function getServiceIcon(targetType?: KnownPublishTargets) {
  let icon;
  switch (targetType) {
    case 'pva-publish-composer':
      icon = (
        <img
          alt={formatMessage('PowerVirtualAgents Logo')}
          aria-label={formatMessage('PowerVirtualAgents Logo')}
          src={pvaIcon}
          style={{ width: '33px' }}
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
        src={dataTransferLine}
        style={{ margin: '0 16px', width: '78px' }}
      />
    </React.Fragment>
  );
}
