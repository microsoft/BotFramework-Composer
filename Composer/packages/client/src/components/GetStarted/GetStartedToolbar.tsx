// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
const items: IToolbarItem[] = [
  {
    text: formatMessage('Delete bot'),
    type: 'action',
    buttonProps: {
      iconProps: { iconName: 'Trash' },
      onClick: () => buttonClick(linkToDelete),
      styles: buttonStyles,
    },
    align: 'left',
  },
  {
    text: formatMessage('Add a package'),
    type: 'action',
    buttonProps: {
      iconProps: { iconName: 'Package' },
      onClick: () => buttonClick(linkToPackageManager),
      styles: buttonStyles,
    },
    align: 'left',
  },
  {
    text: formatMessage('Edit LG'),
    type: 'action',
    buttonProps: {
      iconProps: { iconName: 'Robot' },
      onClick: () => buttonClick(linkToLGEditor),
      styles: buttonStyles,
    },
    align: 'left',
  },
  {
    text: formatMessage('Edit LU'),
    type: 'action',
    buttonProps: {
      iconProps: { iconName: 'People' },
      onClick: () => buttonClick(linkToLUEditor),
      styles: buttonStyles,
    },
    align: 'left',
  },
  {
    text: formatMessage('Manage connections'),
    type: 'action',
    buttonProps: {
      iconProps: { iconName: 'PlugConnected' },
      onClick: () => buttonClick(linkToConnections),
      styles: buttonStyles,
    },
    align: 'left',
  },
];

const buttonClick = (link) => {
  TelemetryClient.track('GettingStartedLinkClicked', { method: 'button', url: link });
  navigateTo(link);
};

<Toolbar
  css={{ borderBottom: '1px solid #3d3d3d' }}
  toolbarItems={props.toolbarItems ? items.concat(props.toolbarItems) : items}
/>;
