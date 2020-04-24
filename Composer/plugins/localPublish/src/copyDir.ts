// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IFileStorage } from './interface';

/**
 * Copy a dir from one storage to another storage
 * @param srcDir path of the src dir
 * @param srcStorage src storage
 * @param dstDir path of the dst dir
 * @param dstStorage dst storage
 */
export async function copyDir(srcDir: string, srcStorage: IFileStorage, dstDir: string, dstStorage: IFileStorage) {
  if (!(await srcStorage.exists(srcDir)) || !(await srcStorage.stat(srcDir)).isDir) {
    throw new Error(`No such dir ${srcDir}}`);
  }

  if (!(await dstStorage.exists(dstDir))) {
    await dstStorage.mkDir(dstDir, { recursive: true });
  }

  const paths = await srcStorage.readDir(srcDir);
  for (const path of paths) {
    const srcPath = `${srcDir}/${path}`;
    const dstPath = `${dstDir}/${path}`;

    if ((await srcStorage.stat(srcPath)).isFile) {
      // copy files
      const content = await srcStorage.readFile(srcPath);
      await dstStorage.writeFile(dstPath, content);
    } else {
      // recursively copy dirs
      await copyDir(srcPath, srcStorage, dstPath, dstStorage);
    }
  }
}
