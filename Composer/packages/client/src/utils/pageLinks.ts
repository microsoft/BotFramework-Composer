// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import formatMessage from 'format-message';
import { ExtensionPageContribution } from '@bfc/extension-client';
import { checkForPVASchema } from '@bfc/shared';

export type ExtensionPageConfig = ExtensionPageContribution & { id: string };

export type PageLink = {
  to: string;
  iconName: string;
  labelName: string;
  disabled: boolean;
  match?: RegExp;
};

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

  let links: PageLink[] = [
    {
      to: '/home',
      iconName: 'Home',
      labelName: formatMessage('Home'),
      disabled: false,
    },
    {
      to: linkBase + `dialogs/${openedDialogId}`,
      iconName: 'SplitObject',
      labelName: formatMessage('Design'),
      disabled: !botLoaded,
      match: /(bot\/[0-9.]+)$|(bot\/[0-9.]+\/skill\/[0-9.]+)$/,
    },
    {
      to: linkBase + `language-generation/${openedDialogId}`,
      iconName: 'Robot',
      labelName: formatMessage('Bot Responses'),
      disabled: !botLoaded,
      match: /language-generation\/[a-zA-Z0-9_-]+$/,
    },
    {
      to: linkBase + `language-understanding/${openedDialogId}`,
      iconName: 'People',
      labelName: formatMessage('User Input'),
      disabled: !botLoaded,
      match: /language-understanding\/[a-zA-Z0-9_-]+$/,
    },
    {
      to: linkBase + `knowledge-base/${openedDialogId}`,
      iconName: 'QnAIcon',
      labelName: formatMessage('QnA'),
      disabled: !botLoaded,
      match: /knowledge-base\/[a-zA-Z0-9_-]+$/,
    },
    {
      to: `/bot/${rootProjectId || projectId}/diagnostics`,
      iconName: 'Warning',
      labelName: formatMessage('Diagnostics'),
      disabled: !botLoaded,
      match: /diagnostics/,
    },
    {
      to: `/bot/${rootProjectId || projectId}/publish`,
      iconName: 'CloudUpload',
      labelName: formatMessage('Publish'),
      disabled: !botLoaded,
    },
    {
      to: `/bot/${rootProjectId || projectId}/botProjectsSettings`,
      iconName: 'BotProjectsSettings',
      labelName: formatMessage('Project Settings'),
      disabled: !botLoaded,
      match: /botProjectsSettings/,
    },
    ...(showFormDialog
      ? [
          {
            to: `/bot/${projectId}/forms`,
            iconName: 'Table',
            labelName: formatMessage('Forms (preview)'),
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
        disabled: !projectId,
      });
    });
  }

  return links;
};

export const bottomLinks: PageLink[] = [
  {
    to: `/settings`,
    iconName: 'Settings',
    labelName: formatMessage('Composer Settings'),
    disabled: false,
  },
  // {
  //   to: `/extensions`,
  //   iconName: 'OEM',
  //   labelName: formatMessage('Extensions'),
  //   disabled: false,
  // },
];
