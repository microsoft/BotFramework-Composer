// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

const path = require('path');
// eslint-disable-next-line security/detect-child-process
const { execSync } = require('child_process');

const inquirer = require('inquirer');
const fs = require('fs-extra');
const merge = require('merge-options');
const { once, kebabCase } = require('lodash');
const validateName = require('validate-npm-package-name');

const FORCE = process.argv.includes('--force');

let newExtensionPath = '';

const uiDeps = {
  '@bfc/extension-client': 'file:../../Composer/packages/extension-client',
  react: '^16.13.0',
  'react-dom': '^16.13.0',
  'office-ui-fabric-react': '7.71.0',
};

const uiDevDeps = {
  '@types/react': '^16.9.53',
};

const nodeDevDeps = {
  '@types/node': '^14.6.2',
};

async function getInputs() {
  const answers = await inquirer.prompt([
    {
      name: 'name',
      message: 'Name:',
      validate: (name) => {
        const { validForNewPackages, errors } = validateName(name);

        if (validForNewPackages) {
          return true;
        } else if (errors) {
          return errors[0];
        } else {
          return 'must be a valid npm package name';
        }
      },
    },
    {
      name: 'description',
      message: 'Description:',
    },
    {
      name: 'types',
      message: 'What extension templates should be included?',
      type: 'checkbox',
      choices: [new inquirer.Separator('-- Backend --'), 'node', new inquirer.Separator('-- UI --'), 'page', 'publish'],
    },
    {
      name: 'pageConfig.name',
      message: 'Page name:',
      when: ({ types }) => types.includes('page'),
    },
    {
      name: 'pageConfig.icon',
      message: 'Page icon:',
      when: ({ types }) => types.includes('page'),
    },
    {
      name: 'ready',
      message: 'Ready to continue?',
      type: 'confirm',
    },
  ]);

  return answers;
}

async function updatePackageJson(data) {
  if (!newExtensionPath) {
    throw new Error('Extension failed to be created.');
  }
  const pJsonPath = path.join(newExtensionPath, 'package.json');
  const pJson = await fs.readJSON(pJsonPath);

  await fs.writeJSON(pJsonPath, merge(pJson, data), { spaces: 2 });
}

async function addDeps(deps, type = 'dependencies') {
  await updatePackageJson({ [type]: deps });
}

const addUiDeps = once(async () => {
  await addDeps(uiDeps);
  await addDeps(uiDevDeps, 'devDependencies');
});

async function copyFiles(files) {
  for (const p of files) {
    let srcPath = '';
    let dstPath = '';

    if (typeof p === 'string') {
      srcPath = path.join(__dirname, 'template', p);
      dstPath = path.join(newExtensionPath, p);
    } else {
      srcPath = path.join(__dirname, 'template', p.src);
      dstPath = path.join(newExtensionPath, p.dest);
    }

    await fs.ensureDir(path.dirname(dstPath));
    await fs.copyFile(srcPath, dstPath);
  }
}

async function shared(name, description) {
  await copyFiles(['package.json', 'tsconfig.json']);

  const authorName = execSync('git config user.name').toString().trim();
  const authorEmail = execSync('git config user.email').toString().trim();

  await updatePackageJson({ name, description, author: { name: authorName, email: authorEmail } });
}

async function node() {
  await copyFiles(['src/node/index.ts']);
  await updatePackageJson({ main: 'dist/extension.js', devDependencies: nodeDevDeps });
}

async function page({ name, icon }) {
  const bundleId = kebabCase(name);
  await copyFiles([{ src: 'src/pages/page.tsx', dest: `src/pages/${bundleId}.tsx` }]);
  await addUiDeps();
  await updatePackageJson({
    composer: {
      bundles: [
        {
          id: bundleId,
          path: `./dist/${bundleId}.js`,
        },
      ],
      contributes: {
        views: {
          pages: [
            {
              bundleId,
              label: name,
              icon,
            },
          ],
        },
      },
    },
  });
}

async function publish() {
  await copyFiles(['src/publish/publish.tsx']);
  await addUiDeps();
}

async function installAndBuild() {
  execSync('yarn', { cwd: newExtensionPath, stdio: 'inherit' });
  execSync('yarn build', { cwd: newExtensionPath, stdio: 'inherit' });
}

async function main() {
  const { name, description, types, pageConfig, ready } = await getInputs();

  if (!ready) {
    process.exit(0);
  }

  newExtensionPath = path.resolve(__dirname, '..', name);

  if (FORCE) {
    await fs.emptyDir(newExtensionPath);
  }

  await fs.ensureDir(newExtensionPath);

  await shared(name, description);

  if (types.includes('node')) {
    await node();
  }

  if (types.includes('page')) {
    await page(pageConfig);
  }

  if (types.includes('publish')) {
    await publish();
  }

  await installAndBuild();
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);

    if (fs.pathExistsSync(newExtensionPath)) {
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      fs.removeSync(newExtensionPath);
    }

    process.exit(1);
  });
