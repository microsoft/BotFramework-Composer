// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-console */
/* eslint-disable security/detect-non-literal-fs-filename */

const fs = require('fs');
const path = require('path');
// eslint-disable-next-line security/detect-child-process
const { execSync } = require('child_process');

const glob = require('globby');

const extensionsDir = path.resolve(__dirname, '../../extensions');
const buildCachePath = path.resolve(extensionsDir, '.build-cache.json');

console.log('Compiling extensions in %s', extensionsDir);

const allExtensions = fs.readdirSync(extensionsDir, { withFileTypes: true });

const checkComposerLibs = () => {
  const libsToCheck = ['types', 'extension', 'extension-client', 'lib/shared'];

  for (const libName of libsToCheck) {
    const libPath = path.resolve(__dirname, '../packages/', libName, 'lib/index.js');
    if (!fs.existsSync(libPath)) {
      console.error('Composer libraries have not yet been compiled. Run `yarn build:libs` first.');
      process.exit(1);
    }
  }
};

let buildCache = (() => {
  if (fs.existsSync(buildCachePath)) {
    try {
      return JSON.parse(fs.readFileSync(buildCachePath));
    } catch (_) {
      return {};
    }
  } else {
    return {};
  }
})();

const getLastModified = (extensionPath) => {
  let last = new Date(0);

  try {
    const gitTimestamp = execSync(`git log -1 --pretty="%cI" "${extensionPath}"`).toString().trim();
    const timestamp = new Date(gitTimestamp);
    if (timestamp > last) {
      last = timestamp;
    }
  } catch (_err) {
    last = new Date();
  }

  return last;
};

const writeToCache = (name, lastModified) => {
  buildCache = {
    ...buildCache,
    [name]: lastModified,
  };
  fs.writeFileSync(buildCachePath, JSON.stringify(buildCache, null, 2));
};

const shouldCompile = (name, lastModified) => {
  return buildCache[name] ? new Date(buildCache[name]) < lastModified : true;
};

const compile = (name, extPath) => {
  const packageJSON = JSON.parse(fs.readFileSync(path.join(extPath, 'package.json')));
  const hasBuild = packageJSON && packageJSON.scripts && packageJSON.scripts.build;

  console.log('[%s] compiling', name);
  console.log('[%s] yarn --force', name);
  execSync('yarn --force --frozen-lockfile', { cwd: extPath, stdio: 'inherit' });

  if (hasBuild) {
    console.log('[%s] yarn build', name);
    execSync('yarn build', { cwd: extPath, stdio: 'inherit' });
  } else {
    console.log('[%s] no build script found.', name);
  }
};

checkComposerLibs();

for (const entry of allExtensions) {
  if (entry.isDirectory()) {
    const dir = path.join(extensionsDir, entry.name);
    const lastModified = getLastModified(dir);
    if (shouldCompile(entry.name, lastModified)) {
      try {
        compile(entry.name, dir);
        writeToCache(entry.name, lastModified);
      } catch (err) {
        console.error(err);
      }
    }
  }
}
