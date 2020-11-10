// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import * as React from 'react';
import { RouteComponentProps } from '@reach/router';
import { Dialog, DialogType, IDialogContentProps } from 'office-ui-fabric-react/lib/Dialog';
import { ProgressIndicator } from 'office-ui-fabric-react/lib/ProgressIndicator';
import formatMessage from 'format-message';
import { ExternalContentProviderType } from '@botframework-composer/types';
import { FontWeights } from 'office-ui-fabric-react/lib/Styling';

import compIcon from '../../images/composerIcon.svg';
import pvaIcon from '../../images/pvaIcon.svg';
import dataTransferLine from '../../images/dataTransferLine.svg';

import { dialogContent, hidden } from './style';

type ImportState = 'connecting' | 'downloading';

type ImportStatusProps = {
  botName?: string;
  source?: ExternalContentProviderType;
  state: ImportState;
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

const boldText = css`
  font-weight: ${FontWeights.semibold};
  word-break: break-work;
`;

const serviceIcon = css`
  width: 33px;
`;

const iconsContainer = css`
  display: flex;
  justify-content: center;
`;

const dataTransferIcon = css`
  margin: 0 16px;
  width: 78px;
`;

export const ImportStatus: React.FC<RouteComponentProps & ImportStatusProps> = (props) => {
  const { botName, source, state } = props;

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
        <p css={dialogContent}>
          {formatMessage('Connecting to ')}
          <span css={boldBlueText}>{getUserFriendlySource(source)}</span>
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
          <span css={iconsContainer}>
            {getServiceIcon(source)}
            {composerIcon}
          </span>
          <ProgressIndicator label={label} styles={{ itemName: { textAlign: 'center' } }} />
        </Dialog>
      );
    }

    case 'downloading': {
      const sourceName = getUserFriendlySource(source);
      const label = (
        <p css={dialogContent}>
          {formatMessage('Importing ')}
          <span css={boldText}>{botName}</span>
          {formatMessage(` from ${sourceName}...`)}
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
          <span css={iconsContainer}>
            {getServiceIcon(source)}
            {composerIcon}
          </span>
          <ProgressIndicator label={label} styles={{ itemName: { textAlign: 'center' } }} />
        </Dialog>
      );
    }

    default:
      return <div css={hidden}></div>;
  }
};

function getServiceIcon(source?: ExternalContentProviderType) {
  let icon;
  switch (source) {
    case 'pva':
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
        css={dataTransferIcon}
        src={dataTransferLine}
      />
    </React.Fragment>
  );
}

export function getUserFriendlySource(source?: ExternalContentProviderType): string {
  switch (source) {
    case 'pva':
      return 'PowerVirtualAgents';

    default:
      return 'external service';
  }
}
