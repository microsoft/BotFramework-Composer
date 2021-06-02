// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/* eslint-disable security/detect-non-literal-fs-filename */

import Path from 'path';

import { IFileStorage } from './interface';

export async function copyDir(
  srcDir: string,
  srcStorage: IFileStorage,
  dstDir: string,
  dstStorage: IFileStorage,
  pathsToExclude?: Set<string>
) {
  if (!(await srcStorage.exists(srcDir)) || !(await srcStorage.stat(srcDir)).isDir) {
    throw new Error(`No such dir ${srcDir}}`);
  }

  if (!(await dstStorage.exists(dstDir))) {
    await dstStorage.mkDir(dstDir, { recursive: true });
  }

  const paths = await srcStorage.readDir(srcDir);

  for (const path of paths) {
    const srcPath = Path.join(srcDir, path);
    if (pathsToExclude?.has(srcPath)) {
      continue;
    }
    const dstPath = Path.join(dstDir, path);

    if ((await srcStorage.stat(srcPath)).isFile) {
      // copy files
      const content = await srcStorage.readFile(srcPath);
      await dstStorage.writeFile(dstPath, content);
    } else {
      // recursively copy dirs
      await copyDir(srcPath, srcStorage, dstPath, dstStorage, pathsToExclude);
    }
  }
}
