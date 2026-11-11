# <a name="contributing">Contributing Overview</a>
Please do! Thanks for your help improving the project! :balloon:

All contributors are welcome. Please see the [newcomers welcome guide](https://layer5.io/community/newcomers) for how, where and why to contribute. This project is community-built and welcomes collaboration. Contributors are expected to adhere to our [Code of Conduct](.CODE_OF_CONDUCT.md).

Not sure where to start? First, see the [newcomers welcome guide](https://docs.google.com/document/d/17OPtDE_rdnPQxmk2Kauhm3GwXF1R5dZ3Cj8qZLKdo5E/edit). Grab an open issue with the [help-wanted label](../../labels/help%20wanted) and jump in. Join the [Slack account](http://slack.layer5.io) and engage in conversation. Create a [new issue](/../../issues/new/choose) if needed.  All [pull requests](/../../pulls) should reference an open [issue](/../../issues). Include keywords in your pull request descriptions, as well as commit messages, to [automatically close issues in GitHub](https://help.github.com/en/github/managing-your-work-on-github/closing-issues-using-keywords).

**Sections**
- <a name="contributing">General Contribution Flow</a>
  - <a href="#commit-signing">Developer Certificate of Origin</a>

Relevant coding style guidelines are the Go Code Review Comments and the Formatting and style section of Peter Bourgon's Go: Best Practices for Production Environments.

# <a name="contributing">General Contribution Flow</a>

In order to contribute to the Blowhorn site, please follow the fork-and-pull request workflow described [here](./CONTRIBUTING-gitflow.md).

## <a name="commit-signing">Signing-off on Commits (Developer Certificate of Origin)</a>

To contribute to this project, you must agree to the Developer Certificate of
Origin (DCO) for each commit you make. The DCO is a simple statement that you,
as a contributor, have the legal right to make the contribution.

See the [DCO](https://developercertificate.org) file for the full text of what you must agree to
and how it works [here](https://github.com/probot/dco#how-it-works).
To signify that you agree to the DCO for contributions, you simply add a line to each of your
git commit messages:

```
Signed-off-by: Jane Smith <jane.smith@example.com>
```

In most cases, you can add this signoff to your commit automatically with the
`-s` or `--signoff` flag to `git commit`. You must use your real name and a reachable email
address (sorry, no pseudonyms or anonymous contributions). An example of signing off on a commit:
```
$ commit -s -m “my commit message w/signoff”
```

To ensure all your commits are signed, you may choose to add this alias to your global ```.gitconfig```:

*~/.gitconfig*
```
[alias]
  amend = commit -s --amend
  cm = commit -s -m
  commit = commit -s
```
Or you may configure your IDE, for example, Visual Studio Code to automatically sign-off commits for you:

<a href="https://user-images.githubusercontent.com/7570704/64490167-98906400-d25a-11e9-8b8a-5f465b854d49.png" ><img src="https://user-images.githubusercontent.com/7570704/64490167-98906400-d25a-11e9-8b8a-5f465b854d49.png" width="50%"><a>

## <a name="contributing-docs">Site Contribution Flow</a>
Please contribute! blowhorn.ai is a [Hugo](https://gohugo.io) site that uses [Docsy](https://www.docsy.dev) as a Hugo module, the same framework as [docs.layer5.io](https://github.com/layer5io/docs). You need Go, Node.js and npm, Python 3 with PyYAML, and `make`; the pinned Hugo extended comes from `package.json`. The [README](README.md#working-on-the-site) maps the repository. The process of contributing follows this flow:

1. Create a fork, if you have not already, by following the steps described [here](./CONTRIBUTING-gitflow.md)
1. Create and checkout a new branch to make changes within
`git checkout -b <my-changes>`
1. Install the site's dependencies once.
`make setup`, then `python3 -m pip install --user pyyaml` for the check scripts' tests ([README](README.md#working-on-the-site) has the Homebrew variant).
1. Edit the pages (`content/en/`), templates (`layouts/`), styles (`assets/css/site.css`) or brand files (`static/assets/brand/`).
1. Run the site locally to preview changes at http://localhost:1313.
`make site`
1. Run the checks CI runs.
`make check`
1. Commit, [sign-off](#commit-signing), and push changes to your remote branch.
`git push origin <my-changes>`
1. Open a pull request (in your web browser) against the repo.


#### Tests
`make check` runs what CI runs: a production build, html-validate on every page, the local link check, the check that no page loads anything from another host except the disclosed GitHub release lookup, the check that every public URL and anchor still exists, unit tests for those check scripts, and actionlint on the workflows. Visual changes also need the screenshots [docs/deploy.md](docs/deploy.md#local-checks-and-evidence) describes.

## Adding a platform action example

Platform docs examples are data, not Markdown. Follow [docs/action-examples.md](docs/action-examples.md): add the action id to `data/actions.json` if it is new, list it on the platform YAML, fill `data/action_examples.json` (placeholders allowed), and drop a PNG at the documented path when the App screenshot exists. Hyphens, never em dashes. `make check-schemas` fails when a supported action has no example. `make check-platform-docs` fails if a supported platform has no docs page, if a page skips the shared `supported-actions` table, or if a docs page still carries a hand-written action list.

# <a name="maintaining"> Reviews</a>
All contributors are invited to review pull requests. See this short video on [how to review a pull request](https://www.youtube.com/watch?v=isLfo7jfE6g&feature=youtu.be).

# New to Git?
Resources: https://lab.github.com and https://try.github.com/

### License

This repository and site are available as open source under the terms of the [Apache 2.0 License](https://opensource.org/licenses/Apache-2.0).

### About Layer5

**Community First**
<p>The <a href="https://layer5.io/community">Layer5 community</a> represents the largest collection of service mesh projects and their maintainers in the world.</p>

**Open Source First**
<p>At Layer5, we champion developer-defined infrastructure, giving engineers the power to reshape application delivery. We empower operators in reimagining how they manage modern infrastructure: collaboratively.</p>
