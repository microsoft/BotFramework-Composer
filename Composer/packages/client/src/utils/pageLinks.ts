// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import formatMessage from 'format-message';
import { ExtensionPageContribution } from '@bfc/extension-client';
import { checkForPVASchema } from '@bfc/shared';

export type ExtensionPageConfig = ExtensionPageContribution & { id: string };

export const topLinks = (
  projectId: string,
  openedDialogId: string,
  pluginPages: ExtensionPageConfig[],
  showFormDialog: boolean,
  schema: any,
  rootProjectId?: string
) => {
  const botLoaded = !!projectId;
  const linkBase =
    projectId === rootProjectId || rootProjectId == null
      ? `/bot/${projectId}/`
      : `/bot/${rootProjectId}/skill/${projectId}/`;

  let links = [
    {
      to: '/home',
      iconName: 'Home',
      labelName: formatMessage('Home'),
      exact: true,
      disabled: false,
    },
    {
      to: linkBase + `dialogs/${openedDialogId}`,
      iconName: 'SplitObject',
      labelName: formatMessage('Design'),
      exact: false,
      disabled: !botLoaded,
    },
    {
      to: linkBase + `language-generation/${openedDialogId}`,
      iconName: 'Robot',
      labelName: formatMessage('Bot Responses'),
      exact: false,
      disabled: !botLoaded,
    },
    {
      to: linkBase + `language-understanding/${openedDialogId}`,
      iconName: 'People',
      labelName: formatMessage('User Input'),
      exact: false,
      disabled: !botLoaded,
    },
    {
      to: linkBase + `knowledge-base/${openedDialogId}`,
      iconName: 'QnAIcon',
      labelName: formatMessage('QnA'),
      exact: true,
      disabled: !botLoaded,
    },
    {
      to: `/bot/${rootProjectId || projectId}/diagnostics`,
      iconName: 'Warning',
      labelName: formatMessage('Diagnostics'),
      exact: true,
      disabled: !botLoaded,
      match: 'diagnostics',
    },
    {
      to: `/bot/${projectId}/publish`,
      iconName: 'CloudUpload',
      labelName: formatMessage('Publish'),
      exact: true,
      disabled: !botLoaded,
    },
    {
      to: `/bot/${projectId}/botProjectsSettings`,
      iconName: 'BotProjectsSettings',
      labelName: formatMessage('Project Settings'),
      exact: true,
      disabled: !botLoaded,
    },
    ...(showFormDialog
      ? [
          {
            to: `/bot/${projectId}/forms`,
            iconName: 'Table',
            labelName: formatMessage('Forms (preview)'),
            exact: false,
            disabled: !botLoaded,
          },
        ]
      : []),
  ];

  // TODO: refactor when Composer can better model the left nav based on schema
  if (schema && checkForPVASchema(schema)) {
    links = links.filter((link) => link.to.indexOf('/knowledge-base') == -1 && link.to.indexOf('/skills') == -1);
  }

  if (pluginPages.length > 0) {
    pluginPages.forEach((p) => {
      links.push({
        to: `/bot/${projectId}/plugin/${p.id}/${p.bundleId}`,
        iconName: p.icon ?? 'StatusCircleQuestionMark',
        labelName: p.label,
        exact: true,
        disabled: !projectId,
      });
    });
  }

  return links;
};

export const bottomLinks = [
  {
    to: `/settings`,
    iconName: 'Settings',
    labelName: formatMessage('Composer Settings'),
    exact: false,
    disabled: false,
  },
];
