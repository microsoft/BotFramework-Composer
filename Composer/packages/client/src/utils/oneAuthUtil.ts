// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { isElectron } from './electronUtil';

let isEnabled = false;

export const isOneAuthEnabled = () => isElectron() && isEnabled;

export const setOneAuthEnabled = (enabled: boolean) => (isEnabled = enabled);
