// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IExtensionRegistration } from '@botframework-composer/types';

const API_ROOT = '';

export default async (composer: IExtensionRegistration): Promise<void> => {
  const ACDesignerController = {
    getCardTemplateManifest: async function (req, res) {
      res.send([
        {
          displayName: 'Virtual Assistant starter card',
          cardPayloadUrl: '/templates/calendar/card.json',
        },
      ]);
    },
    getCardTemplate: async function (req, res) {
      res.sendFile('/public/templates/calendar/card.json');
    },
  };

  composer.addWebRoute('get', `${API_ROOT}/adaptive-card-designer`, ACDesignerController.getCardTemplateManifest);
  composer.addWebRoute('get', `${API_ROOT}/templates/:file`, ACDesignerController.getCardTemplate);
};
