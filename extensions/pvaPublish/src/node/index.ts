import { ExtensionRegistration } from '@bfc/extension';

import { getStatus, history, publish } from './publish';
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
    // TODO: add 'pull' once ready,
  };

  registration.addPublishMethod(extension);
}

module.exports = {
  initialize,
};
