// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { FileInfo } from '@bfc/shared';

import { PreBuilder } from './../preBuilder';
import { CrossTrainConfig } from './../builder';

const storage: any = {};
const builder = new PreBuilder('c:/bot', storage);

describe('Test the crossTrain config change', () => {
  it('should convert the cross train config from id to relativePath', () => {
    const configObject: CrossTrainConfig = {
      'main.en-us.lu': {
        rootDialog: true,
        triggers: {
          dia1Trigger: ['dia1.en-us.lu'],
          dia2Trigger: ['dia2.en-us.lu'],
        },
      },
      'dia2.en-us.lu': {
        rootDialog: false,
        triggers: {
          dia3Trigger: ['dia3.en-us.lu'],
          dia4Trigger: ['dia4.en-us.lu'],
        },
      },
      'main.fr-fr.lu': {
        rootDialog: true,
        triggers: {
          dia1Trigger: ['dia1.fr-fr.lu'],
        },
      },
    };

    const files: FileInfo[] = [
      {
        name: 'main.en-us.lu',
        content: '',
        path: 'c:/bot/lu/en-us/main.en-us.lu',
        relativePath: '',
        lastModified: '',
      },
      {
        name: 'dia1.en-us.lu',
        content: '',
        path: 'c:/bot/dia1/lu/en-us/dia1.en-us.lu',
        relativePath: '',
        lastModified: '',
      },
      {
        name: 'dia2.en-us.lu',
        content: '',
        path: 'c:/bot/dia2/lu/en-us/dia2.en-us.lu',
        relativePath: '',
        lastModified: '',
      },
      {
        name: 'dia3.en-us.lu',
        content: '',
        path: 'c:/bot/dia3/lu/en-us/dia3.en-us.lu',
        relativePath: '',
        lastModified: '',
      },
      {
        name: 'dia4.en-us.lu',
        content: '',
        path: 'c:/bot/dia4/lu/en-us/dia4.en-us.lu',
        relativePath: '',
        lastModified: '',
      },
      { name: 'main.fr-fr.lu', content: '', path: 'c:/bot/lu/fr-fr/main.fr-fr.lu', relativePath: '', lastModified: '' },
      {
        name: 'dia1.fr-fr.lu',
        content: '',
        path: 'c:/bot/dia1/lu/fr-fr/dia1.fr-fr.lu',
        relativePath: '',
        lastModified: '',
      },
    ];
    const result = builder.generateCrossTrainConfig(configObject, files);
    expect(result['../dia2/lu/en-us/dia2.en-us.lu']).not.toBeUndefined();
    expect(result['../dia2/lu/en-us/dia2.en-us.lu'].triggers.dia3Trigger[0]).toBe('../dia3/lu/en-us/dia3.en-us.lu');
  });
});
