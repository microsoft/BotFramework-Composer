// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Skill, SkillSetting } from '@bfc/shared';
import pickBy from 'lodash/pickBy';
import toPairs from 'lodash/toPairs';

const index = (skillContent: any[], skillSettings: { [name: string]: SkillSetting } = {}): Skill[] => {
  return toPairs(skillSettings).map(
    ([id, settings]): Skill => {
      const { content = {} } = skillContent.find(({ id: key }) => key === id) || {};
      const { description, endpoints = [] } = content;

      return pickBy({
        id,
        description,
        endpoints,
        content,
        ...settings,
      }) as Skill;
    }
  );
};

export const skillIndexer = {
  index,
};
