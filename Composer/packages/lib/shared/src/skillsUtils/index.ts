// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import get from 'lodash/get';
import keyBy from 'lodash/keyBy';
import { DialogSetting } from '@botframework-composer/types';
import formatMessage from 'format-message';
import camelCase from 'lodash/camelCase';

export const VIRTUAL_LOCAL_ENDPOINT = {
  key: -1,
  name: formatMessage('Local Composer'),
};

export function fetchFromSettings(path: string, settings: DialogSetting): string {
  if (path) {
    const trimmed = path.replace(/=settings.(.*?)/gi, '');
    return get(settings, trimmed, '');
  }
  return '';
}

export const convertSkillsToDictionary = (skills: any[]) => {
  const mappedSkills = skills.map(({ msAppId, endpointUrl, manifestUrl, name }) => {
    return {
      name,
      msAppId,
      endpointUrl,
      manifestUrl,
    };
  });

  return keyBy(mappedSkills, (item) => camelCase(item.name));
};

export const getSkillNameFromSetting = (value?: string) => {
  if (!value) return '';

  const matched = value.match(/\['(.*?)'\]/);
  if (matched && matched.length > 1) {
    return matched[1];
  }
  return '';
};

export const getEndpointNameGivenUrl = (manifestData: any, urlToMatch: string) => {
  const matchedEndpoint = manifestData?.endpoints.find(({ endpointUrl }) => endpointUrl === urlToMatch);
  return matchedEndpoint ? matchedEndpoint.name : '';
};

export const getManifestNameFromUrl = (manifestUrl: string) => {
  const manifestNameIndex = manifestUrl.lastIndexOf('/') + 1;
  if (!manifestNameIndex) {
    return manifestUrl;
  }
  return manifestUrl.substring(manifestNameIndex);
};
