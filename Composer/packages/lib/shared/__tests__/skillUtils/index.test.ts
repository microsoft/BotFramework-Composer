// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License

import { DialogSetting } from '../../src/';
import {
  fetchFromSettings,
  getSkillNameFromSetting,
  isLocalhostUrl,
  isSkillHostUpdateRequired,
  fetchEndpointNameForSkill,
  convertSkillsToDictionary,
} from '../../src/skillsUtils';

describe('skills utils', () => {
  it('migrate skills array in older bots to skills dictionary', () => {
    const skills: any[] = [
      { name: 'oneNoteSync', manifestUrl: 'http://test.onenotesync/manifests/one-note.json' },
      { name: 'googleSync', manifestUrl: 'http://test.googlesync/manifests/google-sync.json' },
    ];
    const result = convertSkillsToDictionary(skills);
    expect(result.oneNoteSync.manifestUrl).toBe('http://test.onenotesync/manifests/one-note.json');
  });
  it('can fetch from settings given dialog settings', () => {
    const result = fetchFromSettings('=settings.luis.authoringKey', {
      luis: {
        authoringKey: 'abcd',
      },
    } as DialogSetting);

    expect(result).toBe('abcd');
  });

  it('should return empty string  given invalid expression', () => {
    const result = fetchFromSettings('=settings.luis.author', {
      luis: {
        authoringKey: 'abcd',
      },
    } as DialogSetting);

    expect(result).toBe('');
  });

  it('should return the skill name given an expression', () => {
    const result = getSkillNameFromSetting(`=settings.skill['oneNoteSync'].endpointUrl`);
    expect(result).toBe('oneNoteSync');
  });

  it('check if localhost', () => {
    expect(isLocalhostUrl(`http://127.0.0.1/api/skills`)).toBeTruthy();
    expect(isLocalhostUrl(`http://localhost:3000/api/skills`)).toBeTruthy();
    expect(isLocalhostUrl(`http://ngrok-url/api/skills`)).toBeFalsy();
  });

  it('check if skill host endpoint setting needs to be updated', () => {
    expect(isSkillHostUpdateRequired(`http://127.0.0.1/api/skills`)).toBeTruthy();
    expect(isSkillHostUpdateRequired(``)).toBeTruthy();
  });

  it('should get matched endpoint name from the manifest', () => {
    const setting: any = {
      skill: {
        oneNoteSync: {
          endpointUrl: 'http://onenotesync/api/message',
        },
      },
    };
    let matchedEndpoint = fetchEndpointNameForSkill(setting, 'oneNoteSync', {
      endpoints: [
        {
          name: 'localEndpoint',
          endpointUrl: 'http://onenotesync/api/message',
        },
      ],
    });
    expect(matchedEndpoint).toBe('localEndpoint');

    matchedEndpoint = fetchEndpointNameForSkill(setting, 'oneNoteSync-1', {
      endpoints: [
        {
          name: 'localEndpoint',
          endpointUrl: 'http://onenotesync/api/message',
        },
      ],
    });
    expect(matchedEndpoint).toBeUndefined();
  });
});
