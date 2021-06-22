// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import formatMessage from 'format-message';

import * as dialogUtils from './dialogUtils';

formatMessage.setup({ missingTranslation: 'ignore' });

export * from '@botframework-composer/types';

export * from './constant';
export * from './copyUtils';
export * from './diagnostic';
export * from './dialogFactory';
export * from './EditorAPI';
export * from './featureFlagUtils';
export * from './functionUtils';
export * from './generateUniqueId';
export * from './icons';
export * from './labelMap';
export * from './lgUtils';
export * from './luNameBuilder';
export * from './promptTabs';
export * from './resolverFactory';
export * from './schemaUtils';
export * from './settings';
export * from './skillsUtils';
export * from './viewUtils';
export * from './walkerUtils';
export * from './httpsProxy';
export const DialogUtils = dialogUtils;
