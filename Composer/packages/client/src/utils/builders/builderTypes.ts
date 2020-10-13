// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ShellData } from '@bfc/types';

import { BotStatus } from '../../constants';
import { BotLoadError } from '../../recoilModel/types';

type SetStatusHandler = (status: BotStatus) => void;

type SetErrorHandler = (error: BotLoadError) => void;

export type Builder<BuilderConfig> = (
  projectId: string,
  config: BuilderConfig,
  shellData: ShellData,
  setStatus: SetStatusHandler,
  setError: SetErrorHandler
) => void;
