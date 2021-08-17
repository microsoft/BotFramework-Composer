// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IExtensionRegistration } from '@botframework-composer/types';

import { logger, setLogger } from './logger';
import { PVAStorage } from './pvaStorage';

function initialize(registration: IExtensionRegistration) {
  setLogger(registration.log);

  registration.useStorage(PVAStorage);

  logger.log('Using PVA Storage.');
}

module.exports = {
  initialize,
};
