import * as core from '@actions/core';

type ValidationResult = string[];

const validTypes = [
  'feat',
  'fix',
  'docs',
  'style',
  'refactor',
  'perf',
  'test',
  'build',
  'ci',
  'chore',
  'revert',
];

const typeList = validTypes.map(t => `  - ${t}`).join('\n');

export function validateTitle(title: string): ValidationResult {
  const errors: ValidationResult = [];

  if (!title) {
    errors.push('[Title] Must be present.');
  }

  const hastype = validTypes.some(t => title.startsWith(`${t}: `));

  if (!hastype) {
    core.info(
      `[Title] Missing type in title. Choose from the following:\n${typeList}`
    );
    errors.push("[Title] Must start with type. i.e. 'feat: '");
  }

  return errors;
}

const refMatch = /(refs?|close(d|s)?|fix(ed|es)?) \#\d+/i;

export function validateBody(body: string): ValidationResult {
  let errors: ValidationResult = [];

  if (!refMatch.test(body)) {
    errors.push('[Body] Must reference an issue.');
  }

  return errors;
}
