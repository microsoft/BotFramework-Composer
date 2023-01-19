// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { css, jsx } from '@emotion/react';
import React from 'react';
import { FocusTrapCallout } from '@fluentui/react/lib/Callout';
import { DetailsList, DetailsListLayoutMode, IColumn } from '@fluentui/react/lib/DetailsList';
import { IContextualMenuProps } from '@fluentui/react/lib/ContextualMenu';
import { SelectionMode } from '@fluentui/react/lib/Utilities';
import { FontWeights } from '@fluentui/style-utilities';
import { FontSizes } from '@fluentui/theme';
import formatMessage from 'format-message';
import { DirectionalHint } from '@fluentui/react/lib/common/DirectionalHint';

import { BotRuntimeOperations } from './BotRuntimeOperations';
import { BotStatusIndicator } from './BotStatusIndicator';
import { BotErrorViewer } from './BotErrorViewer';
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
    onRender: (item: { displayName: string; projectId: string }) => {
      return (
        <div
          css={{
            display: 'flex',
            flex: '1 1 auto',
          }}
        >
          <BotStatusIndicator projectId={item.projectId} />
          <BotErrorViewer projectId={item.projectId} />
        </div>
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
    <FocusTrapCallout
      hideOverflow
      setInitialFocus
      directionalHint={DirectionalHint.topRightEdge}
      focusTrapProps={{
        isClickableOutsideFocusTrap: true,
        forceFocusInsideTrap: false,
      }}
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
    </FocusTrapCallout>
  );
});

export { BotControllerMenu };
