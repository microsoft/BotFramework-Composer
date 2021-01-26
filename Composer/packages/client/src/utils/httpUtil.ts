// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import axios from 'axios';

import { BASEPATH, BASEURL } from '../constants';

const httpClient = axios.create({
  baseURL: BASEURL,
});

export const composerServerExtensionClient = axios.create({
  baseURL: BASEPATH,
});

export default httpClient;
