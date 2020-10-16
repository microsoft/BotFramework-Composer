// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License

import { MicrosoftIDialog } from '@botframework-composer/types';

export type AdaptiveActionVisitor = (action: MicrosoftIDialog | string) => void;
