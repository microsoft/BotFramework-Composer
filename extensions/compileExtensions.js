// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-console */
/* eslint-disable security/detect-non-literal-fs-filename */

const fs = require('fs-extra');
const path = require('path');
// eslint-disable-next-line security/detect-child-process
const { execSync } = require('child_process');

const { compile } = require('./build');

const FORCE = process.argv.includes('--force') || process.argv.includes('-f');

const extensionsDir = process.env.COMPOSER_BUILTIN_EXTENSIONS_DIR || path.resolve(__dirname);
const buildCachePath = path.resolve(extensionsDir, '.build-cache.json');

console.log('Compiling extensions in %s', extensionsDir);

if (FORCE) {
  console.log('--force is true. Forcing a rebuild of all extensions.');
}

const ignoredDirs = ['node_modules'];
const allExtensions = fs
  .readdirSync(extensionsDir, { withFileTypes: true })
  .filter((ent) => !ignoredDirs.includes(ent.name));

const checkComposerLibs = () => {
  const libsToCheck = ['types', 'extension', 'extension-client', 'lib/shared'];

  for (const libName of libsToCheck) {
    const libPath = path.resolve(__dirname, '../Composer/packages/', libName, 'lib/index.js');
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
    // prettier-ignore
    const gitTimestamp = execSync(`git log -1 --pretty="%cI" "${extensionPath}"`, { // lgtm [js/shell-command-injection-from-environment]
      encoding: 'utf-8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
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

const missingMain = (extPath, packageJSON) => {
  const main = packageJSON && packageJSON.main;

  if (main) {
    return !fs.existsSync(path.join(extPath, main));
  }

  return true;
};

const hasChanges = (name, lastModified) => {
  return buildCache[name] ? new Date(buildCache[name]) < lastModified : true;
};

const install = async (name, extPath) => {
  console.log(`[%s] yarn install --production=false --frozen-lockfile ${FORCE ? '--force' : ''}`, name);
  execSync(`yarn --production=false --frozen-lockfile ${FORCE ? '--force' : ''}`, { cwd: extPath, stdio: 'inherit' });
};

async function main() {
  checkComposerLibs();

  const errors = [];

  for (const entry of allExtensions) {
    if (entry.isDirectory()) {
      const extPath = path.join(extensionsDir, entry.name);
      const packageJSONPath = path.join(extPath, 'package.json');
      if (!fs.existsSync(packageJSONPath)) {
        console.warn(`Ignore directory ${extPath} which is not a npm module.`);
        continue;
      }

      const packageJSON = JSON.parse(fs.readFileSync(packageJSONPath));
      const lastModified = getLastModified(extPath);
      if (FORCE || missingMain(extPath, packageJSON) || hasChanges(entry.name, lastModified)) {
        try {
          await install(entry.name, extPath);
          await compile(entry.name, extPath);
          writeToCache(entry.name, lastModified);
        } catch (err) {
          errors.push({
            name: entry.name,
            message: err.message,
          });
          console.error(err);
        }
      }
    }
  }

  if (errors.length > 0) {
    const formattedErrors = errors.map((e) => `\t- [${e.name}] ${e.message}`).join('\n');
    console.error(`There was an error compiling these extensions:\n${formattedErrors}`);
    process.exit(1);
  }
}

main();
