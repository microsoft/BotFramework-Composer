// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

const axios = jest.createMockFromModule('axios');

module.exports = axios;
module.exports.createAxios = jest.fn().mockReturnValue(axios)
module.exports.axios = axios