import { IExtensionRegistration } from '@botframework-composer/types'

function initialize(registration: IExtensionRegistration) {
  registration.addWebRoute('get', '/webchat', (req, res) => {
    res.send('Webchat!');
  });
}

module.exports = {
  initialize,
};
