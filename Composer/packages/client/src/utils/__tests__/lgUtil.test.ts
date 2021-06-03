// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { DialogInfo, LgFile } from '@bfc/shared';

import { createMissingLgTemplatesForDialogs } from '../lgUtil';

jest.mock('../../recoilModel/parsers/lgWorker', () => {
  return {
    addTemplates: (projectId, lgFile, templatesToAdd, lgFiles) =>
      require('@bfc/indexers/lib/utils/lgUtil').addTemplates(lgFile, templatesToAdd),
  };
});

const bot1 = {
  projectId: 'test',
  lgFiles: [
    {
      id: 'EmptyBot-Test.en-us',
      allTemplates: [{ name: 'SendActivity_Welcome' }, { name: 'SendActivity_jKvFxl' }],
      content: `# SendActivity_Welcome
        - welcome
        # SendActivity_jKvFxl()
        -  1`,
    } as LgFile,
    {
      id: 'EmptyBot-Test.zh-cn',
      allTemplates: [{ name: 'SendActivity_Welcome' }, { name: 'SendActivity_8Oc1NU' }],
      content: `# SendActivity_Welcome
        - welcome
        # SendActivity_8Oc1NU()
        -  2`,
    } as LgFile,
  ],
  dialogs: [
    {
      id: 'EmptyBot-Test',
      lgFile: 'EmptyBot-Test',
      lgTemplates: [{ name: 'SendActivity_Welcome' }, { name: 'SendActivity_jKvFxl' }, { name: 'SendActivity_8Oc1NU' }],
    } as DialogInfo,
  ],
};

describe('client lgUtil tests', () => {
  it('should create missing lg templates for dialogs', async () => {
    const { projectId, lgFiles, dialogs } = bot1;

    const updatedLgFiles = await createMissingLgTemplatesForDialogs(projectId, dialogs, lgFiles);

    expect(updatedLgFiles.length).toEqual(2);
    expect(updatedLgFiles[0].id).toEqual('EmptyBot-Test.en-us');
    expect(updatedLgFiles[0].templates.length).toEqual(3);
    expect(updatedLgFiles[0].templates.map(({ name }) => name)).toContain('SendActivity_8Oc1NU');
    expect(updatedLgFiles[1].id).toEqual('EmptyBot-Test.zh-cn');
    expect(updatedLgFiles[1].templates.length).toEqual(3);
    expect(updatedLgFiles[1].templates.map(({ name }) => name)).toContain('SendActivity_jKvFxl');
  });
});
