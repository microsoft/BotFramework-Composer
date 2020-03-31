// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export interface ISkill {
  manifestUrl?: string;
  name: string;
  description: string;
  endpointUrl: string;
  msAppId: string;
  [key: string]: any;
}

export interface ISkillByManifestUrl {
  manifestUrl: string;
}

export interface ISkillByAppConfig {
  name: string;
  endpointUrl: string;
  msAppId: string;
}
