// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import axios from 'axios';

import httpsProxy from './httpsProxy';

axios.interceptors.request.use(httpsProxy);

export default axios;
