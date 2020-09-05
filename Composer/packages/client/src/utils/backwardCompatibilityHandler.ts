// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import keyBy from 'lodash/keyBy';
import { Skill } from '@bfc/shared';

export const convertSkillsToDictionary = (skills: Skill[]) => {
  const mappedSkills = skills.map(({ msAppId, endpointUrl, manifestUrl, name }: Skill) => {
    return {
      name,
      msAppId,
      endpointUrl,
      manifestUrl,
    };
  });

  const mapped = keyBy(mappedSkills, 'name');
  return mapped;
};
