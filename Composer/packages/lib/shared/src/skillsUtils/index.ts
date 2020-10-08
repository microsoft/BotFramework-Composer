// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import get from 'lodash/get';
import keyBy from 'lodash/keyBy';
import { DialogSetting, Skill } from '@bfc/types';

export function fetchFromSettings(path: string, settings: DialogSetting): string {
  if (path) {
    const trimmed = path.replace(/=settings.(.*?)/gi, '');
    return get(settings, trimmed, '');
  }
  return '';
}

export const convertSkillsToDictionary = (skills: Skill[]) => {
  const mappedSkills = skills.map(({ msAppId, endpointUrl, manifestUrl, name }: Skill) => {
    return {
      name,
      msAppId,
      endpointUrl,
      manifestUrl,
    };
  });

  return keyBy(mappedSkills, 'name');
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
