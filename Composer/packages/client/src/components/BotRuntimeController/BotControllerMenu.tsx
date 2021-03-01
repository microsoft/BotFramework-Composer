// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import React from 'react';
import { Callout, DirectionalHint } from 'office-ui-fabric-react/lib/Callout';
import { DetailsList, DetailsListLayoutMode, IColumn } from 'office-ui-fabric-react/lib/DetailsList';
import { IContextualMenuProps } from 'office-ui-fabric-react/lib/ContextualMenu';
import { SelectionMode } from 'office-ui-fabric-react/lib/Utilities';
import { FontWeights } from '@uifabric/styling';
import { FontSizes } from '@uifabric/fluent-theme/lib/fluent';
import formatMessage from 'format-message';

import { BotRuntimeOperations } from './BotRuntimeOperations';
import { BotStatusIndicator } from './BotStatusIndicator';
import { OpenEmulatorButton } from './OpenEmulatorButton';
import { OpenWebChatButton } from './OpenWebChatButton';

const styles = {
  container: css`
    max-height: 500px;
    overflow: auto;

    .ms-DetailsHeader {
      padding: 0;
    }
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
    onRender: ({ projectId, isRootBot }) => {
      return <BotRuntimeOperations isRoot={isRootBot} projectId={projectId} />;
    },
  },
  {
    key: 'displayName',
    name: formatMessage('Bot'),
    isResizable: true,
    minWidth: 120,
    onRender: ({ displayName, isRootBot }) => {
      return `${displayName} ${!isRootBot ? `(${formatMessage('Skill')})` : ''}`;
    },
    isRowHeader: true,
  },
  {
    key: 'status',
    name: formatMessage('Status'),
    minWidth: 150,
    isResizable: true,
    isRowHeader: true,
    onRender: (item: {
      displayName: string;
      projectId: string;
      setGlobalErrorCalloutVisibility: (isVisible: boolean) => void;
    }) => {
      return (
        <BotStatusIndicator
          projectId={item.projectId}
          setGlobalErrorCalloutVisibility={item.setGlobalErrorCalloutVisibility}
        />
      );
    },
  },
  {
    key: 'webchat-viewer',
    name: '',
    minWidth: 130,
    onRender: ({ projectId, isRootBot }) => {
      return <OpenWebChatButton isRootBot={isRootBot} projectId={projectId} />;
    },
  },
  {
    key: 'emulator',
    name: '',
    minWidth: 135,
    isRowHeader: true,
    onRender: ({ projectId, isRootBot }) => {
      return <OpenEmulatorButton isRootBot={isRootBot} projectId={projectId} />;
    },
  },
];

const BotControllerMenu = React.forwardRef<HTMLDivElement, IContextualMenuProps>((props, ref) => {
  const { items, target, onDismiss, hidden } = props;
  return (
    <Callout
      hideOverflow
      setInitialFocus
      directionalHint={DirectionalHint.topRightEdge}
      hidden={hidden}
      role="dialog"
      styles={{
        root: {
          selectors: {
            // Move the beak of the callout to right.
            '.ms-Callout-beak': {
              right: '5px !important',
            },
          },
        },
      }}
      target={target}
      onDismiss={onDismiss}
    >
      <div ref={ref}>
        <div css={styles.header}>
          <div css={styles.title}>{formatMessage('Local bot runtime manager')}</div>
          <p>{formatMessage('Start and stop local bot runtimes individually.')}</p>
        </div>
        <div css={styles.container}>
          <DetailsList
            columns={tableColumns}
            getKey={(item) => item.id}
            items={items}
            layoutMode={DetailsListLayoutMode.justified}
            selectionMode={SelectionMode.none}
          />
        </div>
      </div>
    </Callout>
  );
});

export { BotControllerMenu };
