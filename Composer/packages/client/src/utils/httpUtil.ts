// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { createAxios } from '@bfc/shared/lib/axios';

import { BASEURL } from '../constants';
import { addAxiosInterceptor } from '../msal';

const httpClient = createAxios({
  baseURL: BASEURL,
});

addAxiosInterceptor(httpClient);
export default httpClient;
