### Guidelines for contributing to Composer

- Nothing gets pushed to the `main` branch. Use github pull-request's to submit new code.
- Use the "Description" field of the new Pull Request form to describe the change in detail. Assume reviewers are taking on a context switch to review your code and need a refresher on context. Reference & link to any pertinent tickets in project tracking software. This will also act as a paper trail of changes and it should be logical for one to use `git blame` to look up the commit and understand why the change was made.
- Keep your pull-requests small and concise. If you are working on a substantially large change in lines of code, it is OK to open a pull-request that is a partial implementation; please make it clear in the description and keep the boundaries between diffs logical.
- If the change includes non-trivial changes in UI, include a screenshot and tag a designer on the project. Be sure to show any border or layout changes clearly. Use your best judgement if you would like a designer to explicitly sign off on it, such as a deviation from the design artifacts.
- If the change includes a non-trivial change in UX, include a gif demonstrating the interaction. Tag a designer and use your judgement if you would like explicit sign off from them on it.
- At least one approver is required on a pull-request prior to merging it.
- Programatic testing for each change is a requirement. Comprehensive unit tests for every change is not. _"Write tests, not too many, mostly integration"_. We should be using [Jest](https://jestjs.io/) & [@testing-library/react](https://github.com/testing-library/react-testing-library) for this in the client. Code coverage benchmarks will be introduced and need to be met with each change (TBD).
- Write code with Internationalization & Accessibility in mind. Every rendered string should be wrapped in an i18n API. Scrub through each UI change for keyboard-navigation and focus-indication. This will prevent most accessibility bugs.
- Use `rebase` when merging changes into to the main branch. This can be done using the _“Squash and Merge”_ technique in the GitHub UI. Local branches will need to be updated using rebase as well. This will keep a clean commit history. Reach out to me if you need help understanding rebase.

### Forking

In order to keep a clean tree on our Github repository we use a forking strategy. Follow the steps below to work with forks.

#### Creating a fork

To create a fork, click on the the `Fork` button at the top of the repository page in Github.

This creates a copy of the repository in your Github account in which you can develop against. Read more about working with forks [here](https://help.github.com/en/articles/working-with-forks).

#### Developing on your fork

- clone your fork to your machine
- create a branch
- make changes and commit
- push your branch to your fork
- create a pull request against the main repository [docs](https://help.github.com/en/articles/creating-a-pull-request-from-a-fork)

#### Keeping your fork up-to-date

- add a new remote to your local repository

```bash
git remote add upstream git@github.com:microsoft/BotFramework-Composer.git
```

- update your upstream remote
- merge upstream changes into your local main branch

```bash
git fetch upstream
git checkout main
git pull upstream main
```

#### Updating your feature branch with latest main

- update your local main by following the previous section
- merge/rebase main into your feature branch

```bash
git checkout <feature-branch-name>
git merge main # git rebase main
git push origin <feature-branch-name>
```

#### Checking out a pull request from a fork

```bash
git checkout -b pull-request-branch main
git pull git://github.com/<username>/BotFramework-Composer.git <fork-branch-name>
```

For example, if there were a PR from the user AwesomeDev's branch my-awesome-feature:

```bash
git checkout -b AwesomeDev/my-awesome-feature main
git pull git://github.com/AwesomeDev/BotFramework-Composer.git my-awesome-feature
```

#### Things to keep in mind

- Always work off of branches; don't commit directly to your main branch. This will help avoid conflicts and keep your main branch pristine.
- When creating pull requests check the `Allow edits from maintainers` option so that others can make changes if necessary.

### Testing

There are two types of tests in the Composer project: unit tests and end-to-end (e2e) tests. Use e2e tests to cover core scenarios (happy path) with some coverage of edge cases. Everything else should be unit tested, with a target coverage goal of 90%.
The primary outcome of a well-tested code base is greater confidence in making future changes.

#### Unit Testing

[Jest](https://jestjs.io/) is the unit testing framework used. The guiding principle to unit testing is to test the _behavior_ of the code, not the mechanics.

- When testing UI, make assertions about the state of the DOM. Don't let component implementation details leak into tests.
- It's ok to mock/stub side effecting code (xhr requests, file system reads/writes, etc).
- Each test should be independent (isolated) from other tests. Make sure to reset state, clean up either before or after eact test run.
- Provide a concise description of what tests cover using the doc string.

Goal: 90% test coverage.

#### E2E Testing

[Cypress](https://www.cypress.io/) is the e2e testing framework. The main guiding principles for e2e tests boil down to the following:

- E2E tests should be reliable. There should be a high level of confidence in the tests to catch real issues, avoiding flaky tests or false negatives.
- Work within the framework to make tests work, avoiding using `cy.wait` as that often is a sign of a poorly written test.
- It's ok to automate environment setup to reduce timing and false negatives.
- Use `data-testid` to make assertions instead of strings. This helps reduce churn when copy updates occur.

Goal: All P0 scenarios have e2e test coverage. Some P1 scenarios have e2e coverage.
