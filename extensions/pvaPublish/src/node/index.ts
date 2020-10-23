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

  // @ts-expect-error (TODO: remove once auth is integrated and added to publish method signature)
  registration.addPublishMethod(extension);
}

module.exports = {
  initialize,
};
