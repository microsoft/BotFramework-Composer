// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import formatMessage from 'format-message';

import * as dialogUtils from './dialogUtils';

formatMessage.setup({ missingTranslation: 'ignore' });

export * from '@bfc/types';

export * from './constant';
export * from './copyUtils';
export * from './diagnostic';
export * from './dialogFactory';
export * from './functionUtils';
export * from './EditorAPI';
export * from './generateUniqueId';
export * from './labelMap';
export * from './lgUtils';
export * from './luNameBuilder';
export * from './promptTabs';
export * from './resolverFactory';
export * from './schemaUtils';
export * from './viewUtils';
export * from './walkerUtils';
export * from './skillsUtils';
export * from './fileUtils';
export const DialogUtils = dialogUtils;
