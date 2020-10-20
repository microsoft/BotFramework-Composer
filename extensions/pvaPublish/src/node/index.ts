import { getStatus, history, publish } from './publish';

function initialize(registration) {
  const plugin = {
    name: 'pva-publish-composer',
    description: 'Publish bot to Power Virtual Agents (Preview)',
    bundleId: 'publish',
    history,
    getStatus,
    publish,
    // TODO: add 'pull' once ready,
  };
  registration.addPublishMethod(plugin);
}

module.exports = {
  initialize,
};
