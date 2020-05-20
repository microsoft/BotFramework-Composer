import * as core from '@actions/core';

export interface PullRequestInfo {
  title: string;
  body: string;
  baseRefName: string;
}
type ValidationResult = string[];

const validTypes = [
  'feat',
  'feature',
  'fix',
  'doc',
  'docs',
  'style',
  'refactor',
  'perf',
  'test',
  'build',
  'ci',
  'chore',
  'revert',
  'release',
  'a11y',
];

const typeList = validTypes.map(t => `  - ${t}`).join('\n');

export function validateTitle(title: string): ValidationResult {
  const errors: ValidationResult = [];

  if (!title) {
    errors.push('[Title] Must be present.');
  }

  const hastype = validTypes.some(t => title.startsWith(`${t}: `));

  if (!hastype) {
    errors.push(
      `[Title] Must start with type (ex. 'feat: ').\nThe valid types are:\n${typeList}`
    );
  }

  return errors;
}

const refMatch = /((refs?|close(d|s)?|fix(ed|es)?) \#\d+)|(#minor)/i;
const helpLink =
  'https://help.github.com/en/github/managing-your-work-on-github/closing-issues-using-keywords';

export function validateBody(body: string): ValidationResult {
  let errors: ValidationResult = [];

  if (!refMatch.test(body)) {
    errors.push(
      `[Body] Must either reference an issue (ex. 'fixes #1234') or, if this is a minor change with no related issue, tag it as '#minor'.\nSee ${helpLink} for more details.`
    );
  }

  return errors;
}

export function isRelease(pr: PullRequestInfo) {
  return pr.title.startsWith('release: ') && pr.baseRefName === 'stable';
}

export function validateBaseBranch(
  title: string,
  baseBranch: string
): ValidationResult {
  let errors: ValidationResult = [];

  if (title.startsWith('release: ') && baseBranch !== 'stable') {
    errors.push("[Release] Release pull request must target 'stable' branch.");
  } else if (baseBranch === 'stable') {
    errors.push(
      "[Branch] Pull requests cannot target 'stable' branch. Perhaps you meant to create a release or are targeting the wrong branch."
    );
  }

  return errors;
}
