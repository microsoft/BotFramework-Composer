// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-console */
/* eslint-disable security/detect-non-literal-fs-filename */

const fs = require('fs-extra');
const path = require('path');
// eslint-disable-next-line security/detect-child-process
const { execSync } = require('child_process');

const esbuild = require('esbuild');
const GlobalsPlugin = require('esbuild-plugin-globals');

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

const getBundleConfigs = (extPath, packageJSON) => {
  const buildConfigs = [];

  const defaultConfig = Object.assign(
    {
      bundle: true,
      logLevel: 'error',
    },
    packageJSON.esbuild
  );

  // check for node entry
  for (const nodeEntry of ['', 'src', 'src/node']) {
    const p = path.join(extPath, nodeEntry, 'index.ts');
    if (fs.pathExistsSync(p)) {
      buildConfigs.push(
        Object.assign(
          { ...defaultConfig },
          {
            entryPoints: [p],
            outfile: path.join(extPath, 'dist/extension.js'),
            platform: 'node',
            target: ['node12.13.0'],
          }
        )
      );
    }
  }

  // for each contrib, create entry for each file
  const contribs = ['pages', 'publish'];

  for (const contribDir of contribs) {
    const p = path.join(extPath, 'src', contribDir);

    if (fs.pathExistsSync(p)) {
      for (const contrib of fs.readdirSync(p, { withFileTypes: true })) {
        const cPath = path.join(p, contrib.name);

        buildConfigs.push(
          Object.assign(
            { ...defaultConfig },
            {
              outdir: path.join(extPath, './dist'),
              entryPoints: [cPath],
              target: ['es2015'],
              plugins: [
                GlobalsPlugin({
                  react: 'React',
                  'react-dom': 'ReactDOM',
                  '@bfc/extension-client': 'ExtensionClient',
                  'office-ui-fabric-react': 'Fabric',
                  '@bfc/code-editor': 'CodeEditors',
                  '@bfc/ui-shared': 'UIShared',
                }),
              ],
              loader: {
                '.svg': 'dataurl',
                '.png': 'file',
              },
              define: {
                'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
              },
            }
          )
        );
      }
    }
  }

  return buildConfigs;
};

const cleanDist = async (name, extPath) => {
  console.log('[%s] cleaning dist', name);
  await fs.emptyDir(path.join(extPath, 'dist'));
};

const compile = async (name, extPath) => {
  const packageJSON = JSON.parse(fs.readFileSync(path.join(extPath, 'package.json')));
  const hasBuild = packageJSON && packageJSON.scripts && packageJSON.scripts.build;

  console.log('[%s] compiling', name);
  console.log('[%s] yarn install', name);
  execSync(`yarn --production=false --frozen-lockfile ${FORCE ? '--force' : ''}`, { cwd: extPath, stdio: 'inherit' });

  const service = await esbuild.startService();
  const work = [];

  try {
    for (const config of getBundleConfigs(extPath, packageJSON)) {
      work.push(service.build(config));
    }

    await Promise.all(work);
  } finally {
    await service.stop();
  }
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
          await cleanDist(entry.name, extPath);
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
