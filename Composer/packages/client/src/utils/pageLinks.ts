// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import formatMessage from 'format-message';

export const topLinks = (projectId: string, openedDialogId: string) => {
  const disabled = projectId === '';
  let links = [
    {
      to: '/home',
      iconName: 'Home',
      labelName: formatMessage('Home'),
      exact: true,
      disabled: false,
    },
    {
      to: `/bot/${projectId}/dialogs/${openedDialogId}`,
      iconName: 'SplitObject',
      labelName: formatMessage('Design'),
      exact: false,
      disabled,
    },
    {
      to: `/bot/${projectId}/language-generation`,
      iconName: 'Robot',
      labelName: formatMessage('Bot Responses'),
      exact: false,
      disabled,
    },
    {
      to: `/bot/${projectId}/language-understanding`,
      iconName: 'People',
      labelName: formatMessage('User Input'),
      exact: false,
      disabled,
    },
    {
      to: `/bot/${projectId}/notifications`,
      iconName: 'Warning',
      labelName: formatMessage('Notifications'),
      exact: true,
      disabled,
    },
    {
      to: `/bot/${projectId}/publish`,
      iconName: 'CloudUpload',
      labelName: formatMessage('Publish'),
      exact: true,
      disabled,
    },
    {
      to: `/bot/${projectId}/skills`,
      iconName: 'PlugDisconnected',
      labelName: formatMessage('Skills'),
      exact: true,
      disabled,
    },
    {
      to: `/bot/${projectId}/settings/`,
      iconName: 'Settings',
      labelName: formatMessage('Settings'),
      exact: false,
      disabled,
    },
  ];

  if (process.env.COMPOSER_AUTH_PROVIDER === 'abs-h') {
    links = links.filter((link) => link.to !== '/home');
  }

  return links;
};

export const bottomLinks = [
  {
    to: '/about',
    iconName: 'info',
    labelName: formatMessage('About'),
    exact: true,
    disabled: false,
  },
];
