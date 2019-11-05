import * as core from "@actions/core";
import * as github from "@actions/github";

const getPRNumber = (): number | undefined => {
  const pr = github.context.payload.pull_request;

  if (pr) {
    return pr.number;
  }
};

async function run() {
  const token = core.getInput("repo-token", { required: true });
  const prNumber = getPRNumber();

  if (!prNumber) {
    core.debug("Could not get pull request number from context. Skipping.");
    return;
  }

  const oktokit = new github.GitHub(token);

  try {
    core.debug(`Checking base branch for PR #${prNumber}`);

    const payload = {
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      pull_number: prNumber
    };

    const pr = await oktokit.pulls.get({
      ...payload
    });

    if (pr.data.base.ref === "stable") {
      core.debug("Base is stable. Updating to master.");

      await oktokit.pulls.update({
        ...payload,
        base: "master"
      });
    } else {
      core.debug(`Base branch is ${pr.data.base.ref}. Skipping.`);
    }
  } catch (err) {
    core.error(err);
    core.setFailed(
      `Error occurred while validating base branch: ${err.message}`
    );
  }
}

run();
