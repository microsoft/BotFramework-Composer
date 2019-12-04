// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License

const { execSync } = require('child_process');
const chalk = require('react-dev-utils/chalk');

const RELEASE_BRANCH = 'stable';
let currentBranch;

try {
  currentBranch = execSync('git branch', { stdio: ['ignore', 'pipe', 'ignore'] })
    .toString()
    .split('\n')
    .find(b => b.startsWith('* '))
    .substring(2);
} catch (err) {
  // just exit script without error and continue
  console.log(chalk.yellow('Unable to compare applications versions.. continuing'));
  process.exit();
}

if (currentBranch === RELEASE_BRANCH) {
  console.log(chalk.yellow('Checking for updates...\n'));
  try {
    execSync('git fetch');
    const sha = execSync(`git rev-parse --short ${RELEASE_BRANCH}`).toString();
    const originSha = execSync(`git rev-parse --short origin/${RELEASE_BRANCH}`).toString();
    if (sha !== originSha) {
      console.log(
        chalk.yellow(
          `An update to Composer is available.\n\nRun 'git pull origin stable' or fetch from origin/stable using another git-based tool.\n\nSee the CHANGELOG for more details.\nhttps://github.com/microsoft/BotFramework-Composer/blob/stable/CHANGELOG.md#releases\n`
        )
      );
    } else {
      console.log(chalk.green('You are using the most up to date version of Composer.'));
    }
  } catch (e) {
    console.log(chalk.yellow('Unable to compare applications versions.. continuing'));
  }
}
