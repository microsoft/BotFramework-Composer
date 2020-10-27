import { ExtensionRegistration } from '@bfc/extension';

import { getStatus, history, publish, pull } from './publish';
import { setLogger } from './logger';

function initialize(registration: ExtensionRegistration) {
  setLogger(registration.log);
  const extension = {
    name: 'pva-publish-composer',
    description: 'Publish bot to Power Virtual Agents (Preview)',
    bundleId: 'publish',
    history,
    getStatus,
    publish,
    pull,
  };

  registration.addPublishMethod(extension);
}

module.exports = {
  initialize,
};
