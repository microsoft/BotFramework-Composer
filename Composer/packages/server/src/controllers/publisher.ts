// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import pluginLoader from '../services/pluginLoader';

export const PublishController = {
  publish: (req, res) => {
    const method = req.params.method;
    if (pluginLoader.extensions.publish[method]) {
      res.send(`Got valid request to publish`);
    } else {
      res.send(`Got invalid request to publish`);
    }
  },
};
