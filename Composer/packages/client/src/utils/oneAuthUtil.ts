// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { isElectron } from './electronUtil';

export const isOneAuthEnabled = () => isElectron() && !!window.__ENABLE_ONEAUTH__;
