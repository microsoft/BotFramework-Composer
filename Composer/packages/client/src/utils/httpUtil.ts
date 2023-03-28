// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { createAxios } from '@bfc/shared/lib/axios';

import { BASEURL } from '../constants';

/* Returns true if the url starts with http or https */
export const isExternalLink = (url: string): boolean => {
  return /^http[s]?:\/\/\w+/.test(url);
};

const httpClient = createAxios({
  baseURL: BASEURL,
});

export default httpClient;
