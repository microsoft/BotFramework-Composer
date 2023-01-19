// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { createAxios } from '@bfc/shared/lib/axios';

import { BASEURL } from '../constants';

const httpClient = createAxios({
  baseURL: BASEURL,
});

export default httpClient;
