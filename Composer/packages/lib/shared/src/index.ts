// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import formatMessage from 'format-message';

import * as dialogUtils from './dialogUtils';

formatMessage.setup({ missingTranslation: 'ignore' });

export * from './constant';
export * from './copyUtils';
export * from './dialogFactory';
export * from './generateUniqueId';
export * from './labelMap';
export * from './lgUtils';
export * from './luNameBuilder';
export * from './promptTabs';
export * from './types';
export * from './viewUtils';
export * from './walkerUtils';
export * from './resolverFactory';
export * from './functionUtils';
export const DialogUtils = dialogUtils;
