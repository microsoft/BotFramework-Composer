// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import axios from 'axios';
import axiosHttpsProxy from 'axios-https-proxy';

axios.interceptors.request.use(axiosHttpsProxy);

export default axios;
