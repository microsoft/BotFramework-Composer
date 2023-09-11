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
  isDisabledForPVA: boolean;
};

export const topLinks = (
  projectId: string,
  openedDialogId: string,
  pluginPages: ExtensionPageConfig[],
  showFormDialog: boolean,
  schema: any,
  skillIsRemote: boolean,
  rootProjectId?: string
) => {
  const isPVASchema = checkForPVASchema(schema);
  const botLoaded = !!projectId;
  const linkBase =
    projectId === rootProjectId || rootProjectId == null
      ? `/bot/${projectId}/`
      : `/bot/${rootProjectId}/skill/${projectId}/`;

  const links: PageLink[] = [
    {
      to: linkBase + `dialogs/${openedDialogId}`,
      iconName: 'SplitObject',
      labelName: formatMessage('Create'),
      disabled: !botLoaded,
      match: /(bot\/[0-9.]+)$|(bot\/[0-9.]+\/skill\/[0-9.]+)$/,
      isDisabledForPVA: false,
    },
    {
      to: linkBase + `language-understanding/${openedDialogId}`,
      iconName: 'People',
      labelName: formatMessage('User input'),
      disabled: !botLoaded || skillIsRemote,
      match: /language-understanding\/[a-zA-Z0-9_-]+$/,
      isDisabledForPVA: false,
    },
    {
      to: linkBase + `language-generation/${openedDialogId}`,
      iconName: 'Robot',
      labelName: formatMessage('Bot responses'),
      disabled: !botLoaded || skillIsRemote,
      match: /language-generation\/[a-zA-Z0-9_-]+$/,
      isDisabledForPVA: false,
    },
    {
      to: `/bot/${rootProjectId || projectId}/publish`,
      iconName: 'CloudUpload',
      labelName: formatMessage('Publish'),
      disabled: !botLoaded,
      isDisabledForPVA: false,
    },
  ];

  return links;
};

export const bottomLinks: PageLink[] = [
  // {
  //   to: `/extensions`,
  //   iconName: 'OEM',
  //   labelName: formatMessage('Extensions'),
  //   disabled: false,
  // },
];
