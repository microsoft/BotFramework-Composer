const chalk = require('react-dev-utils/chalk');
const { execSync } = require('child_process');

console.log(chalk.yellow('Checking for updates...\n'));
try {
  const sha = execSync('git rev-parse --short');
  const originSha = execSync('git rev-parse --short origin/stable');
  if (sha.toString() !== originSha.toString()) {
    console.log(
      chalk.yellow(
        `An update to Composer is available.\n\nRun 'git pull origin stable' or fetch from origin/stable using another git-based tool.\n\nSee the CHANGELOG for more details.\nhttps://github.com/microsoft/BotFramework-Composer/blob/stable/CHANGELOG.md#releases\n`
      )
    );
  } else {
    console.log(chalk.green('You are using the most up to date version of Composer.'));
  }
} catch (e) {
  console.log('e', e);
  return;
}
