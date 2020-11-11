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
import { generateUniqueId } from '@bfc/shared';

import compIcon from '../../images/composerIcon.svg';
import pvaIcon from '../../images/pvaIcon.svg';
import dataTransferLine from '../../images/dataTransferLine.svg';

import { boldText, boldBlueText, dialogContent, hidden } from './style';

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

function getUserFriendlySource(source?: ExternalContentProviderType): string {
  switch (source) {
    case 'pva':
      return 'PowerVirtualAgents';

    default:
      return 'external service';
  }
}

const BoldBlue = ({ children }) => (
  <span key={generateUniqueId()} css={boldBlueText}>
    {children}
  </span>
);

const Bold = ({ children }) => (
  <span key={generateUniqueId()} css={boldText}>
    {children}
  </span>
);

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
          {formatMessage.rich('Connecting to <b>{ source }</b> to import bot content...', {
            b: BoldBlue,
            source: getUserFriendlySource(source),
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
          {formatMessage.rich('Importing <b>{ botName }</b> from { sourceName }...', {
            b: Bold,
            botName,
            sourceName,
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
