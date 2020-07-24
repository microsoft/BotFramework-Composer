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
    'Settings contains detailed information about your bot. For security reasons, they are hidden by default. To test your bot or publish to Azure, you may need to provide these settings.'
  ),
  languageTitle: formatMessage('Bot language'),
  languagesubTitle: formatMessage(`Select the language that bot will be able to understand (User input) and respond to (Bot responses).
    To make this bot available in other languages, click “Add’ to create a copy of the default language, and translate the content into the new language.`),
  languageBotLanauge: formatMessage('Bot language (active)'),
  languageDefaultLanauge: formatMessage('Default language'),
  languageAddLanauge: formatMessage('Create copy to translate bot content'),
  learnMore: formatMessage('Learn more.'),
  settingsTitle: formatMessage('Bot settings'),
};
