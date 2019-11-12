import core from '@actions/core';
import github from '@actions/github';

import { validateTitle, validateBody } from './utils';

const OWNER = github.context.repo.owner;
const REPO = github.context.repo.repo;

const getPrNumber = (): number | undefined => {
  const pullRequest = github.context.payload.pull_request;

  if (!pullRequest) {
    return;
  }

  return pullRequest.number;
};

const prQuery = `
  query PRInfo($owner: String!, $repo: String!, $prNumber: Int!) {
    repository(owner: $owner, name: $repo) {
      pullRequest(number: $prNumber) {
        title
        body
        isDraft
      }
    }
  }
`;

async function run() {
  const token = core.getInput('repo-token', { required: true });
  const prNumber = getPrNumber();

  if (!prNumber) {
    core.setFailed('Not in a Pull Request context.');
    return;
  }

  try {
    const oktokit = new github.GitHub(token);
    const { repository } = await oktokit.graphql(prQuery, {
      owner: OWNER,
      repo: REPO,
      prNumber,
    });
    const pr = repository.pullRequest;

    if (!pr) {
      core.setFailed('Not in a Pull Request context.');
      return;
    }

    if (pr.isDraft) {
      return;
    }

    const titleErrors = validateTitle(pr.title);
    const bodyErrors = validateTitle(pr.body);

    if (titleErrors.length) {
      core.setFailed(titleErrors.join('\n'));
    }

    if (bodyErrors.length) {
      core.setFailed(bodyErrors.join('\n'));
    }
  } catch (err) {
    core.error(err);
    core.setFailed('Error getting Pull Request data.');
  }
}

run().catch(err => {
  core.error(err);
  core.setFailed('Error verifying conventional PR.');
});
