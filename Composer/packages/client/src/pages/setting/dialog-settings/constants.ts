// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import formatMessage from 'format-message';

export const BotSettings = {
  showKeys: formatMessage('Show keys'),
  productionSlot: formatMessage('In production'),
  integrationSlot: formatMessage('In test'),
  botSettings: formatMessage('Settings'),
  generalTitle: formatMessage('General'),
  botSettingDescription: formatMessage(
    'The Bot Settings page includes detailed configuration information about the selected bot. To test your bot or publish to Azure, you may need to provide these settings.'
  ),
  languageTitle: formatMessage('Bot language'),
  languagesubTitle: formatMessage(
    `To make this bot available in other languages, select "Create copy to translate bot content" and translate the content into the new language.`
  ),
  languageBotLanauge: formatMessage('Bot language (active)'),
  languageDefaultLanauge: formatMessage('Default language'),
  languageAddLanauge: formatMessage('Create copy to translate bot content'),
  learnMore: formatMessage('Learn more'),
  settingsTitle: formatMessage('Bot settings'),
};
