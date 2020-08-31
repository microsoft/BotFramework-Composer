// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import keyBy from 'lodash/keyBy';
import { Skill } from '@bfc/shared';

export const convertSkillsToDictionary = (skills: Skill[]) => {
  const map = new Map();
  const mappedSkills = skills.map((skill: any) => {
    if (!map.get(skill)) {
      return skill;
    } else {
      let i = 1;
      while (map.get(`${skill}-${i}`)) {
        i++;
      }
      return {
        ...skill,
        name: `${skill}-${i}`,
      };
    }
  });
  return keyBy(mappedSkills, 'name');
};
