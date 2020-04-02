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

export interface ISkillFormData {
  manifestUrl?: string;
  name?: string;
  endpointUrl?: string;
  msAppId?: string;
}

export interface ISkillFormDataErrors {
  manifestUrl?: string;
  name?: string;
  endpointUrl?: string;
  msAppId?: string;
}

export interface ISkillByManifestUrl {
  manifestUrl: string;
}

export interface ISkillByAppConfig {
  name: string;
  endpointUrl: string;
  msAppId: string;
}

export enum ISkillType {
  URL = 'url',
  APPConfig = 'appConfig',
}

export const SkillNameRegex = /^[a-zA-Z0-9-_.\s]+$/;
export const SkillAppIdRegex = /^[a-zA-Z0-9-_.]+$/;
export const SkillUrlRegex = /^http[s]?:\/\/\w+/;
