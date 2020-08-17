// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export interface DeployConfig {
  name: string;
  environment: string;
  luisAuthoringKey?: string;
  luisAuthoringRegion?: string;
  qnaSubscriptionKey?: string;
  botPath?: string;
  language?: string;
  hostname?: string;
  luisResource?: string;
}
