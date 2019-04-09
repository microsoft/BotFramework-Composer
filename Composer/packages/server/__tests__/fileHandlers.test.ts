import path from 'path';
import fs from 'fs';

import { getFiles, updateFile, FileInfo, createFromTemplate } from '../src/handlers/fileHandler';

const mockFilePath: string = path.join(__dirname, 'mocks/1.botproj');

describe('fileHandlers', () => {
  describe('getFiles', () => {
    it('should get files at a path', async () => {
      const files: any = await getFiles(mockFilePath);
      expect(files.dialogFiles.length).toBe(3);
    });
  });

  describe('updateFile', () => {
    it('should update a file at a path', async () => {
      const initValue = { old: 'value' };
      const newValue = { new: 'value' };

      await updateFile('a.dialog', newValue, mockFilePath);
      const aDialog = (await getFiles(mockFilePath)).dialogFiles.find(f => f.name.startsWith('a'));
      // @ts-ignore
      expect(aDialog.content).toEqual(newValue);
      await updateFile('a.dialog', initValue, mockFilePath);
    });
  });

  describe('createFromTemplate', () => {
    const dialogName = 'MyTestDialog';

    afterEach(() => {
      try {
        fs.unlinkSync(path.resolve(__dirname, `mocks/${dialogName}.dialog`));
      } catch (err) {
        // ignore
      }
    });

    it('should create a dialog file with given steps', async () => {
      await createFromTemplate(dialogName, ['foo', 'bar', 'baz'], mockFilePath);
      const newFile = (await getFiles(mockFilePath)).dialogFiles.find(f => f.name.startsWith(dialogName));

      if (!newFile) {
        expect(newFile).toBeTruthy();
      }

      const fileContent = (newFile as FileInfo).content;
      expect(fileContent.$type).toEqual('Microsoft.AdaptiveDialog');
      expect(fileContent.rules).toHaveLength(1);
      expect(fileContent.rules[0].steps).toHaveLength(3);
      expect(fileContent.rules[0].steps).toMatchObject([{ $type: 'foo' }, { $type: 'bar' }, { $type: 'baz' }]);
    });
  });
});
