// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import axios from 'axios';

import { BASEURL } from '../constants';

const httpClient = axios.create({
  baseURL: BASEURL,
});

export default httpClient;
