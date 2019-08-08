### Guidelines for contributing to Composer

- Nothing gets pushed to the `master` branch. Use github pull-request's to submit new code.
- Use the "Description" field of the new Pull Request form to describe the change in detail. Assume reviewers are taking on a context switch to review your code and need a refresher on context. Reference & link to any pertinent tickets in project tracking software. This will also act as a paper trail of changes and it should be logical for one to use `git blame` to look up the commit and understand why the change was made.
- Keep your pull-requests small and concise. If you are working on a substantially large change in lines of code, it is OK to open a pull-request that is a partial implementation; please make it clear in the description and keep the boundaries between diffs logical.
- If the change includes non-trivial changes in UI, include a screenshot and tag a designer on the project. Be sure to show any border or layout changes clearly. Use your best judgement if you would like a designer to explicitly sign off on it, such as a deviation from the design artifacts.
- If the change includes a non-trivial change in UX, include a gif demonstrating the interaction. Tag a designer and use your judgement if you would like explicit sign off from them on it.
- At least one approver is required on a pull-request prior to merging it.
- Programatic testing for each change is a requirement. Comprehensive unit tests for every change is not. _"Write tests, not too many, mostly integration"_. We should be using [Jest](https://jestjs.io/) & [react-testing-library](https://github.com/kentcdodds/react-testing-library) for this in the client. Code coverage benchmarks will be introduced and need to be met with each change (TBD).
- Write code with Internationalization & Accessibility in mind. Every rendered string should be wrapped in an i18n API. Scrub through each UI change for keyboard-navigation and focus-indication. This will prevent most accessibility bugs.
- Use `rebase` when merging changes into to the master branch. This can be done using the _“Squash and Merge”_ technique in the GitHub UI. Local branches will need to be updated using rebase as well. This will keep a clean commit history. Reach out to me if you need help understanding rebase.

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
- merge upstream changes into your local master branch

```bash
git fetch upstream
git checkout master
git pull upstream master
```

#### Updating your feature branch with latest master

- update your local master by following the previous section
- merge/rebase master into your feature branch

```bash
git checkout <feature-branch-name>
git merge master # git rebase master
git push origin <feature-branch-name>
```

#### Checking out a pull request from a fork

```bash
git checkout -b pull-request-branch master
git pull git://github.com/<username>/BotFramework-Composer.git <fork-branch-name>
```

For example, if there were a PR from the user AwesomeDev's branch my-awesome-feature:

```bash
git checkout -b AwesomeDev/my-awesome-feature master
git pull git://github.com/AwesomeDev/BotFramework-Composer.git my-awesome-feature
```

#### Things to keep in mind

- Always work off of branches; don't commit directly to your master branch. This will help avoid conflicts and keep your master branch pristine.
- When creating pull requests check the `Allow edits from maintainers` option so that others can make changes if necessary.
