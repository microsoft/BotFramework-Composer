/* eslint-disable security/detect-non-literal-fs-filename */
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import path from 'path';
import fs from 'fs';
import { promisify } from 'util';
import { exec } from 'child_process';

import { ExecResult } from '../types';

const mkdir = promisify(fs.mkdir);
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);
const copyFile = promisify(fs.copyFile);

export const readFile = promisify(fs.readFile);
export const writeFile = promisify(fs.writeFile);

export const dirExist = async (dirPath: string) => {
  try {
    const status = await stat(dirPath);
    return status.isDirectory();
  } catch (error) {
    return false;
  }
};

export const copyDir = async (srcDir: string, dstDir: string) => {
  if (!(await dirExist(srcDir))) {
    throw new Error(`no such dir ${srcDir}`);
  }
  if (!(await dirExist(dstDir))) {
    await mkdir(dstDir, { recursive: true });
  }
  const paths = await readdir(srcDir);
  for (const subPath of paths) {
    const srcPath = path.resolve(srcDir, subPath);
    const dstPath = path.resolve(dstDir, subPath);
    if (!(await stat(srcPath)).isDirectory()) {
      // copy files
      await copyFile(srcPath, dstPath);
    } else {
      // recursively copy dirs
      await copyDir(srcPath, dstPath);
    }
  }
};

export const createDir = async (dirPath: string) => {
  if (!(await dirExist(dirPath))) {
    await mkdir(dirPath, { recursive: true });
  }
};

export const execAsync = (command: string): Promise<ExecResult> => {
  return new Promise<ExecResult>((resolve, reject) => {
    exec(command, { encoding: 'utf8' }, (error, stdout, stderr) => {
      // Hack required because exec returns are insconsistent.
      if (!error) {
        stdout += stderr;
        stderr = undefined;
      }

      resolve({ stdout, stderr });
    });
  });
};
