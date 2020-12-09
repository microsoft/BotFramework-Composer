// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
import formatMessage from 'format-message';
import { ActionButton } from 'office-ui-fabric-react/lib/Button';

import { Toolbar, IToolbarItem } from '../../components/Toolbar';

export interface PublishToolbarProps {
  canPublish: boolean;
  canPull: boolean;
  onPublish: () => void;
  onPull: () => void;
}

export const PublishToolbar: React.FC<PublishToolbarProps> = ({ canPublish, canPull, onPublish, onPull }) => {
  const toolbarItems: IToolbarItem[] = [
    {
      type: 'element',
      align: 'left',
      element: (
        <ActionButton data-testid="publishPage-Toolbar-Publish" disabled={!canPublish} onClick={onPublish}>
          <svg fill="none" height="15" viewBox="0 0 16 15" width="16" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M16 4.28906V15H5V0H11.7109L16 4.28906ZM12 4H14.2891L12 1.71094V4ZM15 14V5H11V1H6V14H15ZM0 5H4V6H0V5ZM1 7H4V8H1V7ZM2 9H4V10H2V9Z"
              fill={canPublish ? '#0078D4' : 'rgb(161, 159, 157)'}
            />
          </svg>
          <span css={{ marginLeft: '8px' }}>{formatMessage('Publish selected bots')}</span>
        </ActionButton>
      ),
    },
    {
      type: 'action',
      text: formatMessage('Pull from selected profile'),
      buttonProps: {
        iconProps: {
          iconName: 'CloudDownload',
        },
        onClick: onPull,
      },
      align: 'left',
      dataTestid: 'publishPage-Toolbar-Pull',
      disabled: !canPull,
    },
  ];
  return <Toolbar toolbarItems={toolbarItems} />;
};
