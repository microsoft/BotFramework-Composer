// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import React from 'react';
import { Callout, DirectionalHint } from 'office-ui-fabric-react/lib/Callout';
import { DetailsList, DetailsListLayoutMode, IColumn } from 'office-ui-fabric-react/lib/DetailsList';
import { IContextualMenuProps } from 'office-ui-fabric-react/lib/ContextualMenu';
import { IComponentAsProps, SelectionMode } from 'office-ui-fabric-react/lib/Utilities';
import { FontWeights } from '@uifabric/styling';
import { FontSizes } from '@uifabric/fluent-theme/lib/fluent';
import formatMessage from 'format-message';

import { LocalBotRuntime } from './LocalBotRuntime';
import { LocalBotStatusIndicator } from './LocalBotStatusIndicator';
import { OpenEmulatorButton } from './OpenEmulatorButton';

const styles = {
  container: css`
    max-height: 500px;
    overflow: auto;
  `,
  header: css`
    margin: 18px 18px 0 18px;
  `,
  title: css`
    font-weight: ${FontWeights.bold};
    font-size: ${FontSizes.size18};
  `,
};

const tableColumns: IColumn[] = [
  {
    key: 'control',
    name: '',
    minWidth: 20,
    maxWidth: 20,
    fieldName: 'control',
    isRowHeader: false,
    onRender: ({ displayName, projectId }) => {
      return <LocalBotRuntime displayName={displayName} projectId={projectId} />;
    },
  },
  {
    key: 'displayName',
    name: formatMessage('Bot'),
    minWidth: 150,
    maxWidth: 150,
    fieldName: 'displayName',
    isRowHeader: true,
  },
  {
    key: 'status',
    name: formatMessage('Status'),
    minWidth: 100,
    isRowHeader: true,
    onRender: (item: { displayName: string; projectId: string }) => {
      return <LocalBotStatusIndicator projectId={item.projectId} />;
    },
  },
  {
    key: 'emulator',
    name: '',
    minWidth: 200,
    isRowHeader: true,
    onRender: ({ projectId }) => {
      return <OpenEmulatorButton projectId={projectId} />;
    },
  },
];

const BotControllerMenu: React.FC<IComponentAsProps<IContextualMenuProps>> = ({ items, target, onDismiss }) => {
  return (
    <Callout
      setInitialFocus
      directionalHint={DirectionalHint.bottomRightEdge}
      role="dialog"
      target={target}
      onDismiss={onDismiss}
    >
      <div>
        <div css={styles.header}>
          <div css={styles.title}>{formatMessage('Local bot runtime manager')}</div>
          <p>{formatMessage('Start and stop local bot runtimes individually.')}</p>
        </div>
        <div css={styles.container}>
          <DetailsList
            columns={tableColumns}
            compact={false}
            getKey={(item) => item.id}
            items={items}
            layoutMode={DetailsListLayoutMode.justified}
            selectionMode={SelectionMode.none}
          />
        </div>
      </div>
    </Callout>
  );
};

export { BotControllerMenu };
