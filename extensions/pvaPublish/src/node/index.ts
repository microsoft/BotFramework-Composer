// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IExtensionRegistration } from '@botframework-composer/types';

import { getStatus, history, publish, pull } from './publish';
import { setLogger } from './logger';

function initialize(registration: IExtensionRegistration) {
  setLogger(registration.log);
  const extension = {
    name: 'pva-publish-composer',
    description: 'Publish bot to Power Virtual Agents (Preview)',
    bundleId: 'publish',
    getHistory: history,
    getStatus,
    publish,
    pull,
  };

  registration.addPublishMethod(extension);
}

module.exports = {
  initialize,
};
