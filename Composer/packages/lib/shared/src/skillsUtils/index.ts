// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import get from 'lodash/get';
import keyBy from 'lodash/keyBy';
import { BotProjectSpace, DialogSetting, SkillSetting } from '@botframework-composer/types';
import formatMessage from 'format-message';
import camelCase from 'lodash/camelCase';

// eslint-disable-next-line security/detect-unsafe-regex
const localhostRegex = /^https?:\/\/(localhost|127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}|::1)/;

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

export const migrateSkillsForExistingBots = (botProjectFile: BotProjectSpace, rootBotSkill: any) => {
  const updatedSkillSetting: Record<string, SkillSetting> = {};
  if (Object.keys(botProjectFile.skills).length === 0 && Object.keys(rootBotSkill).length > 0) {
    for (const skillName in rootBotSkill) {
      const currentSkill = rootBotSkill[skillName];
      const skillNameIdentifier = camelCase(skillName);
      updatedSkillSetting[skillNameIdentifier] = {
        endpointUrl: currentSkill.endpointUrl,
        msAppId: currentSkill.msAppId,
      };
      botProjectFile.skills[skillNameIdentifier] = {
        manifest: currentSkill?.manifestUrl || '',
        remote: true,
      };
    }
  }
  return {
    skillSettings: updatedSkillSetting,
    botProjectFile,
  };
};

export const fetchEndpointNameForSkill = (
  rootBotSettings: DialogSetting,
  skillNameIdentifier: string,
  manifestData
) => {
  const endpointUrl = get(rootBotSettings, `skill[${skillNameIdentifier}].endpointUrl`);
  if (endpointUrl) {
    const matchedEndpoint = getEndpointNameGivenUrl(manifestData, endpointUrl);
    return matchedEndpoint;
  }
};

export const isLocalhostUrl = (matchUrl: string) => {
  return localhostRegex.test(matchUrl);
};

export const isSkillHostUpdateRequired = (skillHostEndpoint?: string) => {
  return !skillHostEndpoint || isLocalhostUrl(skillHostEndpoint);
};

export const isUsingAdaptiveRuntime = (runtime?: DialogSetting['runtime']): boolean =>
  runtime?.key === 'csharp-azurewebapp-v2' || !!runtime?.key?.startsWith('adaptive-runtime-');
