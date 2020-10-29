// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import * as React from 'react';
import { RouteComponentProps } from '@reach/router';
import { Dialog, DialogType, IDialogContentProps } from 'office-ui-fabric-react/lib/Dialog';
import { ProgressIndicator } from 'office-ui-fabric-react/lib/ProgressIndicator';
import formatMessage from 'format-message';

import compIcon from '../../images/composerIcon.svg';
import pvaIcon from '../../images/pvaIcon.svg';

type ImportState = 'connecting' | 'downloading' | 'copying';

type ImportStatusProps = {
  botName?: string;
  source?: string;
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

export const ImportStatus: React.FC<RouteComponentProps & ImportStatusProps> = (props) => {
  const { botName, source, state } = props;

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
        <p style={{ fontSize: 16 }}>
          {formatMessage('Connecting to ')}
          <span style={{ fontWeight: 600, color: 'blue' }}>{getUserFriendlySource(source)}</span>
          {formatMessage(' to import bot content...')}
        </p>
      );
      return (
        <Dialog dialogContentProps={contentProps} hidden={false} minWidth={560} styles={{ main: { height: 263 } }}>
          <span style={{ display: 'flex', justifyContent: 'center' }}>
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
        <p style={{ fontSize: 16 }}>
          {formatMessage('Importing ')}
          <span style={{ fontWeight: 600 }}>{botName}</span>
          {formatMessage(` from ${sourceName}...`)}
        </p>
      );
      return (
        <Dialog dialogContentProps={contentProps} hidden={false} minWidth={560} styles={{ main: { height: 263 } }}>
          <span style={{ display: 'flex', justifyContent: 'center' }}>
            {getServiceIcon(source)}
            {composerIcon}
          </span>
          <ProgressIndicator label={label} styles={{ itemName: { textAlign: 'center' } }} />
        </Dialog>
      );
    }

    case 'copying': {
      const label = <p style={{ fontSize: 16 }}>{formatMessage('Almost there. Setting things up...')}</p>;
      return (
        <Dialog dialogContentProps={contentProps} hidden={false} minWidth={560} styles={{ main: { height: 263 } }}>
          <span style={{ display: 'flex', justifyContent: 'center' }}>{composerIcon}</span>
          <ProgressIndicator label={label} styles={{ itemName: { textAlign: 'center' } }} />
        </Dialog>
      );
    }

    default:
      return <div style={{ display: 'none' }}></div>;
  }
};

// TODO: create a type for possible publish sources
function getUserFriendlySource(source?: string): string {
  switch (source) {
    case 'pva':
      return 'PowerVirtualAgents';

    default:
      return 'external service';
  }
}

// TODO: typing of source
function getServiceIcon(source?: string) {
  let icon;
  switch (source) {
    case 'pva':
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
      <span style={{ display: 'block', margin: '0 16px' }}>---&gt;</span>
    </React.Fragment>
  );
}
