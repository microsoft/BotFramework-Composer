// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

const axios = {
  get: jest.fn().mockReturnValue(Promise.resolve(new Proxy({}, {
    get() { return {} }
  })))
}

module.exports = axios;
module.exports.createAxios = jest.fn().mockReturnValue(axios)
module.exports.axios = axios
