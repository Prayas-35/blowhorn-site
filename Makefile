# Copyright Layer5, Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#    http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

include .github/build/Makefile.show-help.mk

#-----------------------------------------------------------------------------
# blowhorn.ai is a Hugo site with Docsy as a Hugo module, built like
# layer5io/docs. You need Go (Hugo modules), Node.js and npm (the pinned
# hugo-extended and postcss come from package.json), Python 3 (checks) and make.
#
# MAIN TARGETS (the website targets of the blowhorn repository, mirrored so the
# two repositories share one vocabulary; the layer5io/docs names
# build-production, build-internal and preview-internal are kept as aliases)
#
#   setup              Install site dependencies (npm install).
#   build              Build locally with draft, future, and expired content.
#   build-preview      Build for a deploy preview (uses BASE_URL or DEPLOY_PRIME_URL).
#   site-build         Build for production. Pass BASE_URL=... to set the base URL.
#   site               Serve locally with live reload.
#   serve              Serve locally once, file watcher off (no live reload).
#   check-links        Check every local link, image and font in the built site.
#   check-deps         Verify required commands and local dependencies.
#   check-go           Verify Go is installed (required by Hugo Modules).
#
# BLOWHORN TARGETS (every CI step that runs repository logic is one of these;
# the workflows call the target, so `make <target>` reproduces that step)
#
#   setup-ci           Install the exact locked dependencies (npm ci), as CI does.
#   validate-html      Production build, then html-validate on every page.
#   check-third-party  Production build, then fail on any request to another host.
#   check-urls         Production build, then fail on a lost public URL or anchor.
#   site-check         Production build once, then validate-html, check-links,
#                      check-third-party, check-urls, check-no-internal,
#                      check-theme, check-platform-docs, check-naming,
#                      check-action-matrix, check-platform-pages and
#                      check-download-links (site.yml).
#   check-no-internal  Fail if the production build contains /internal/,
#                      or its offline search index is missing or contains /internal/.
#   check-platform-docs Production build, then fail if a supported platform
#                      lacks a docs page, a page skips the shared actions
#                      table, or a docs page carries a hand-written action list.
#   check-action-matrix Production build, then fail if the site action matrix
#                      (/integrations/actions/) or the docs all-actions table
#                      drifts from data/actions.json plus data/platforms/, or
#                      links to a dead page or anchor.
#   check-platform-pages Production build, then fail if a platform page drifts
#                      from data/platform_pages.json, leaks into the sitemap,
#                      llms.txt or search, or its script stops working.
#   check-api-reference Production build, then (once params.apiReference.spec is set)
#                      fail if the API reference page drifts from its spec, loses
#                      its "Not an HTTP API" notice or names the private repository.
#   api-reference-export
#                      Write the public API spec from a local OpenAPI file:
#                      make api-reference-export API_SPEC_SRC=path/to/openapi.yaml
#                      (docs/api-reference.md).
#   site-internal-build
#                      Internal build (hugo --environment internal, mounting
#                      BLOWHORN_DIR, default ../blowhorn) into public-internal/.
#                      BASE_URL=... sets the base URL (the deploy passes
#                      https://internal.blowhorn.ai/).
#   site, site-internal
#                      Live-reload servers for the two builds.
#   site-internal-deploy
#                      Run internal-site.yml (build, Cloudflare Access, Worker
#                      deploy at internal.blowhorn.ai, verify) and watch it:
#                      make site-internal-deploy [REF=<blowhorn ref>] [WATCH=0].
#   site-internal-poll Decide whether internal-site-auto.yml deploys (see
#                      .github/scripts/internal-poll.sh).
#   site-internal-access, site-internal-access-check, site-internal-worker-deploy,
#   site-internal-verify
#                      The steps of internal-site.yml (see docs/deploy.md).
#   test-internal-worker
#                      Unit tests for the internal Worker's Access token check.
#   test-scripts       Unit tests for the check scripts in .github/scripts/.
#   workflow-check     actionlint on this repository's workflows.
#   check              site-check, test-scripts and workflow-check.
#   ci                 setup-ci, then everything site.yml's check job runs.
#   dmg-check          Sanity-check a disk image: make dmg-check DMG=path/to/file.dmg
#   dmg-resolve, dmg-download, dmg-package, dmg-verify, dmg-release,
#   dmg-pin-download, dmg-sync-docs
#                      The steps of publish-dmg.yml (see docs/distribution.md).
#   npm-fetch, npm-verify, npm-publish, npm-confirm
#                      The steps of publish-blowhorn-axi.yml (see docs/distribution.md).
#   docs-sync          Sync the user docs from a blowhorn checkout
#                      into content/en/docs/: make docs-sync REF=<tag|branch|sha>
#                      (see docs/deploy.md).
#   docs-sync-base     Check out the docs-sync branch on the open sync PR's
#                      head, or on origin/master when none is open.
#   docs-sync-start-checks
#                      Start the site checks on the docs-sync branch after a
#                      sync: gh workflow run site.yml (see docs/deploy.md).
#   docs-sync-merge    Merge the sync pull request once its site checks
#                      pass, then start the master site run that deploys.
#   help               List every target with its description.
#   clean              Empty the build cache, reinstall dependencies, run 'site'.
#-----------------------------------------------------------------------------
# Fixed: the npm build and link-check scripts and site.yml all use public/.
override BUILD_DIR := public
HTML_VALIDATE_VERSION ?= 9.5.5
AJV_CLI_VERSION ?= 5.0.0
ACTIONLINT_VERSION ?= 1.7.7
BIN_DIR ?= .bin
# actionlint from PATH when installed; otherwise a pinned copy is downloaded into $(BIN_DIR).
ACTIONLINT ?= $(shell command -v actionlint 2>/dev/null)
# Workflows owned by this repo. Template workflows (labeler and friends) are left as-is.
WORKFLOWS ?= .github/workflows/site.yml .github/workflows/publish-dmg.yml .github/workflows/sync-docs.yml .github/workflows/cloud-auth-smoke.yml .github/workflows/product-ci.yml .github/workflows/internal-site.yml .github/workflows/internal-site-auto.yml .github/workflows/publish-blowhorn-axi.yml
# A blowhorn checkout for `make docs-sync` (the sync-docs.yml
# workflow checks the product repo out at this path).
SOURCE_DIR ?= product
# The private blowhorn clone that config/internal/hugo.toml mounts
# (module import github.com/blowhorn-ai/blowhorn, replaced with this directory).
BLOWHORN_DIR ?= ../blowhorn
BLOWHORN_ABS = $(abspath $(BLOWHORN_DIR))
BLOWHORN_MODULE := github.com/blowhorn-ai/blowhorn
DOCS_DIR ?= content/en/docs
# Where `make api-reference-export` writes the public API spec (the value of
# params.apiReference.spec in hugo.toml once the reference page is enabled).
API_SPEC_OUT ?= api/openapi.public.json
# Branch the sync-docs.yml workflow pushes and opens its pull request from.
SYNC_BRANCH ?= docs-sync
# The internal site's hosting workflow (site-internal-deploy) and its blowhorn ref.
INTERNAL_SITE_REPO ?= blowhorn-ai/blowhorn-site
INTERNAL_WORKFLOW ?= internal-site.yml
REF ?= master

# ---------------------------------------------------------------------------
# MAINTENANCE
# ---------------------------------------------------------------------------

## Verify required commands and local dependencies are present.
check-deps:
	@echo "Checking for npm, hugo and postcss (node_modules/.bin from 'make setup', or system installs)..."
	@command -v npm > /dev/null || { echo "Error: 'npm' not found. Please install Node.js and npm."; exit 1; }
	@test -x node_modules/.bin/hugo || command -v hugo > /dev/null || { echo "Error: no 'hugo' found. Run 'make setup' for the pinned hugo-extended, or install Hugo (https://gohugo.io/installation/)."; exit 1; }
	@test -x node_modules/.bin/postcss || command -v postcss > /dev/null || { echo "Error: no 'postcss' found (Docsy's stylesheets need it). Run 'make setup'."; exit 1; }
	@if test -x node_modules/.bin/hugo; then echo "hugo: node_modules/.bin/hugo (pinned)."; else echo "hugo: $$(command -v hugo) (system; 'make setup' installs the pinned one)."; fi
	@if test -x node_modules/.bin/postcss; then echo "postcss: node_modules/.bin/postcss (pinned)."; else echo "postcss: $$(command -v postcss) (system)."; fi
	@echo "Dependencies check passed."

## Verify Go is installed locally.
check-go:
	@echo "Checking if Go is installed..."
	@command -v go > /dev/null || { echo "Go is not installed. Please install it before proceeding."; exit 1; }
	@echo "Go is installed."

## Check every local link, image, font and srcset reference in a production build.
check-links: site-build
	npm run check:links

## List every target with its description.
help: show-help

# ---------------------------------------------------------------------------
# LOCAL BUILDS
# ---------------------------------------------------------------------------

## Install blowhorn.ai dependencies (the pinned Hugo extended and postcss) on your local machine.
setup:
	npm install

## Install the exact locked dependencies from package-lock.json (npm ci), as CI does.
setup-ci:
	npm ci

## Build the site locally with draft, future, and expired content enabled.
build: check-go check-deps
	npm run build

## Build the site for a deploy preview.
build-preview: check-go check-deps
	npm run build:preview

## Build blowhorn.ai for production with optional base URL (what CI deploys).
site-build: check-go check-deps
	set -e; \
	if [ -n "$(BASE_URL)" ]; then \
		base_url="$(BASE_URL)"; \
		base_url="$${base_url%/}/"; \
		npm run build:production -- --baseURL "$$base_url"; \
	else \
		npm run build:production; \
	fi

## Build the internal site (only /internal/, mounted from the blowhorn clone at BLOWHORN_DIR, default ../blowhorn) into public-internal/. Pass BASE_URL=... to set the base URL.
site-internal-build: check-go check-deps check-blowhorn
	set -e; \
	if [ -n "$(BASE_URL)" ]; then \
		base_url="$(BASE_URL)"; \
		base_url="$${base_url%/}/"; \
		HUGO_MODULE_REPLACEMENTS="$(BLOWHORN_MODULE) -> $(BLOWHORN_ABS)" npm run build:internal -- --baseURL "$$base_url"; \
	else \
		HUGO_MODULE_REPLACEMENTS="$(BLOWHORN_MODULE) -> $(BLOWHORN_ABS)" npm run build:internal; \
	fi

## Build and run the site locally with live reload (draft and future content enabled).
site: check-go check-deps
	npm run site

## Serve the internal site at http://localhost:1313/internal/ with live reload, rendered in memory so public/ is never touched.
site-internal: check-go check-deps check-blowhorn
	@echo "Internal site: http://localhost:1313/internal/ (the root redirects there)"
	HUGO_MODULE_REPLACEMENTS="$(BLOWHORN_MODULE) -> $(BLOWHORN_ABS)" npm run _hugo -- server --cleanDestinationDir --environment internal --renderToMemory

# ---------------------------------------------------------------------------
# INTERNAL SITE HOSTING (internal-worker/, .github/workflows/internal-site.yml)
# ---------------------------------------------------------------------------

## Run internal-site.yml, which builds the internal site and deploys it to the blowhorn-internal Worker behind Cloudflare Access, then watch it: make site-internal-deploy [REF=<blowhorn ref>] [WATCH=0].
site-internal-deploy:
	@command -v gh > /dev/null || { echo "Error: gh not found (https://cli.github.com)."; exit 1; }
	gh workflow run $(INTERNAL_WORKFLOW) -R $(INTERNAL_SITE_REPO) -f blowhorn_ref="$(REF)"
	@if [ "$(WATCH)" != "0" ]; then \
		sleep 5; \
		run_id="$$(gh run list -R $(INTERNAL_SITE_REPO) --workflow $(INTERNAL_WORKFLOW) --event workflow_dispatch -L 1 --json databaseId --jq '.[0].databaseId')"; \
		echo "Watching run $$run_id"; \
		gh run watch "$$run_id" -R $(INTERNAL_SITE_REPO) --exit-status; \
	fi

## Decide whether internal-site-auto.yml deploys: always on push or dispatch; on schedule, only when blowhorn master changed a mounted path in the last 2 hours (needs DMG_SOURCE_TOKEN).
site-internal-poll:
	.github/scripts/internal-poll.sh

## Read-only: confirm CLOUDFLARE_API_TOKEN can read Zero Trust, Access applications and policies, and Workers.
site-internal-access-check:
	python3 .github/scripts/internal_access.py check

## Create or update the Cloudflare Access application, allow policy and trusted-network bypass policy (internal-worker/access.json), then verify they are default-deny.
site-internal-access:
	python3 .github/scripts/internal_access.py ensure

## Deploy public-internal/ to the blowhorn-internal Worker (needs TEAM_DOMAIN and POLICY_AUD from site-internal-access), then confirm workers.dev is off.
site-internal-worker-deploy:
	.github/scripts/internal-deploy.sh
	python3 .github/scripts/internal_access.py verify-worker

## Fail unless unauthenticated requests to the internal hostname get the Cloudflare Access login, never a page.
site-internal-verify:
	.github/scripts/internal-verify.sh

## Unit tests for the internal Worker's Access token check.
test-internal-worker:
	node --test internal-worker/worker.test.mjs

## Fail unless BLOWHORN_DIR is a blowhorn clone with the internal sources.
check-blowhorn:
	@test -d "$(BLOWHORN_ABS)/marketing/strategy/hugo/strategy" || { echo "Error: no blowhorn clone at BLOWHORN_DIR=$(BLOWHORN_DIR) ($(BLOWHORN_ABS)). Clone it beside this repository (git clone https://github.com/blowhorn-ai/blowhorn ../blowhorn) or pass BLOWHORN_DIR=path/to/blowhorn."; exit 1; }


## Build and serve the site once with the file-watcher off (no live reload).
serve: check-go check-deps
	npm run serve

## Alias of site-build (the layer5io/docs name, kept working).
build-production: site-build

## Alias of site-internal-build (the layer5io/docs name, kept working).
build-internal: site-internal-build

## Alias of site-internal (the former name of the internal server).
preview-internal: site-internal

# ---------------------------------------------------------------------------
# CHECKS
# ---------------------------------------------------------------------------

## Build for production, then run html-validate on every page.
validate-html: site-build
	npx --yes html-validate@$(HTML_VALIDATE_VERSION) "$(BUILD_DIR)/**/*.html"

## Build for production, then fail if a page, or a stylesheet or script it loads, requests another host.
check-third-party: site-build
	python3 .github/scripts/check-third-party.py $(BUILD_DIR)

## Build for production, then fail if a published URL or anchor is gone.
check-urls: site-build
	python3 .github/scripts/check-site-contract.py $(BUILD_DIR)

## Validate every data file that has a JSON Schema in schemas/ (data/hero.json, data/machines.json, data/home_ai.json, data/roles.json, data/use_cases.json, data/solutions.json, data/themes.json, data/integrations.json, data/hero_demo.json, data/actions.json, data/action_examples.json, data/tells.json, data/support.json, data/docs_events.json, data/activity_feed.examples.json, internal-worker/access.json).
## Role, use-case and solution schemas $ref shared line/text/card types; ajv -r loads that file.
## data/docs_events.json $refs the docs event payload types in schemas/defs/docs-event.schema.json (ajv -r).
## check_action_examples.py also requires every supported YAML action to have an example.
## check_action_matrix.py --source checks action groups, matrix exceptions and platform order.
check-schemas:
	npx --yes ajv-cli@$(AJV_CLI_VERSION) validate --strict=false -s schemas/hero.schema.json -d data/hero.json
	npx --yes ajv-cli@$(AJV_CLI_VERSION) validate --strict=false -s schemas/machines.schema.json -d data/machines.json
	npx --yes ajv-cli@$(AJV_CLI_VERSION) validate --strict=false -s schemas/home_ai.schema.json -d data/home_ai.json
	npx --yes ajv-cli@$(AJV_CLI_VERSION) validate --strict=false -s schemas/posture.schema.json -d data/posture.json
	npx --yes ajv-cli@$(AJV_CLI_VERSION) validate --strict=false -s schemas/roles.schema.json -r schemas/defs/cast-page.schema.json -d data/roles.json
	npx --yes ajv-cli@$(AJV_CLI_VERSION) validate --strict=false -s schemas/use_cases.schema.json -r schemas/defs/cast-page.schema.json -d data/use_cases.json
	npx --yes ajv-cli@$(AJV_CLI_VERSION) validate --strict=false -s schemas/solutions.schema.json -r schemas/defs/cast-page.schema.json -d data/solutions.json
	npx --yes ajv-cli@$(AJV_CLI_VERSION) validate --strict=false -s schemas/themes.schema.json -d data/themes.json
	npx --yes ajv-cli@$(AJV_CLI_VERSION) validate --strict=false -s schemas/integrations.schema.json -d data/integrations.json
	npx --yes ajv-cli@$(AJV_CLI_VERSION) validate --strict=false -s schemas/hero_demo.schema.json -d data/hero_demo.json
	npx --yes ajv-cli@$(AJV_CLI_VERSION) validate --strict=false -r schemas/event_feed_page.schema.json -s schemas/activity_feed.examples.schema.json -d data/activity_feed.examples.json
	npx --yes ajv-cli@$(AJV_CLI_VERSION) validate --strict=false -s schemas/actions.schema.json -d data/actions.json
	npx --yes ajv-cli@$(AJV_CLI_VERSION) validate --strict=false -s schemas/action_examples.schema.json -d data/action_examples.json
	npx --yes ajv-cli@$(AJV_CLI_VERSION) validate --strict=false -s schemas/tells.schema.json -d data/tells.json
	npx --yes ajv-cli@$(AJV_CLI_VERSION) validate --strict=false -s schemas/support.schema.json -d data/support.json
	npx --yes ajv-cli@$(AJV_CLI_VERSION) validate --strict=false -s schemas/social_links.schema.json -d data/social_links.json
	npx --yes ajv-cli@$(AJV_CLI_VERSION) validate --strict=false -s schemas/docs_events.schema.json -r schemas/defs/docs-event.schema.json -d data/docs_events.json
	npx --yes ajv-cli@$(AJV_CLI_VERSION) validate --strict=false -s schemas/internal_access.schema.json -d internal-worker/access.json
	npx --yes ajv-cli@$(AJV_CLI_VERSION) validate --strict=false -s schemas/bookmarklet.schema.json -d data/bookmarklet.json
	npx --yes ajv-cli@$(AJV_CLI_VERSION) validate --strict=false -s schemas/platform_page.schema.json -d data/platform_pages.json
	python3 .github/scripts/check_action_examples.py
	python3 .github/scripts/check_bookmarklet.py
	python3 .github/scripts/check_action_matrix.py --source
	python3 .github/scripts/check_platform_pages.py --source

## Production build, then fail if / is not the home-page theme (themes.json default plus _index.md front matter), the Reveille preview lost today's look, or a theme-specific content file appeared outside content/en/home-reveille.md.
check-theme: site-build
	python3 .github/scripts/check_theme.py $(BUILD_DIR)

## Production build, then fail if a supported platform has no docs page, a platform docs page skips the shared actions table, or a docs page carries a hand-written action list.
check-platform-docs: site-build
	python3 .github/scripts/check_platform_docs.py $(BUILD_DIR)

## Production build, then fail if the action matrix page or the docs all-actions table drifts from data/actions.json and data/platforms/, links to a dead page or anchor, or loses its links from / and /integrations/.
check-action-matrix: site-build
	python3 .github/scripts/check_action_matrix.py $(BUILD_DIR)

## Production build, then fail if a platform page (/preview/platforms/<id>/) drifts from data/platform_pages.json, loses noindex, appears in the sitemap, llms.txt or search, is linked from another page, its call to action stops installing the extension, or its script stops swapping the activity type, playing the local stage's scenes once, paging the setups by hand or honouring reduced motion (docs/platform-pages.md).
check-platform-pages: site-build
	python3 .github/scripts/check_platform_pages.py $(BUILD_DIR)

## Build for production once, then validate-html, check-links, check-third-party and check-urls, plus check-schemas (what site.yml runs).
site-check: check-schemas validate-html check-links check-third-party check-urls check-no-internal check-theme check-platform-docs check-naming check-action-matrix check-platform-pages check-download-links check-feeds check-brand-kits check-tells check-tips check-api-reference

## Production build, then fail if any built page or script links to /releases/latest/download (an axi release can hold Latest; build download URLs from data/download.json).
check-download-links: site-build
	python3 .github/scripts/check_download_links.py $(BUILD_DIR)

## Production build, then fail if the Brand page links a kit zip the build does not publish, or states its size wrong.
check-brand-kits: site-build
	python3 .github/scripts/check_brand_kits.py $(BUILD_DIR)

## Production build, then validate the Resources RSS feeds, including the desktop contract feed (issue #253, Part D).
check-feeds: site-build
	python3 .github/scripts/check_feeds.py $(BUILD_DIR)

## Source check, no build: fail if a published article or video lacks a column (blowhorn #1555), or a published tip lacks a video or a unique tipOrder (blowhorn #1554).
check-tips:
	python3 .github/scripts/check_tips.py

## Production build, then fail if a Blowhorn Tells placement (data/tells.json) left its page or a Tells link lost its UTM tags.
check-tells: site-build
	python3 .github/scripts/check_tells.py $(BUILD_DIR)

## Production build, then, once params.apiReference.spec is set, fail if the API reference page drifts from its spec, drops the "Not an HTTP API" notice or mentions the private repository. Passes (and checks nothing) while the param is empty.
check-api-reference: site-build
	python3 .github/scripts/check_api_reference.py $(BUILD_DIR)

## Write the public API spec the reference page renders from a LOCAL OpenAPI file: make api-reference-export API_SPEC_SRC=path/to/openapi.yaml [API_SPEC_OUT=api/openapi.public.json]. Fetching the product schema is not wired here (docs/api-reference.md).
api-reference-export:
	@test -n "$(API_SPEC_SRC)" || { echo "Error: pass API_SPEC_SRC=path/to/openapi.yaml (a local file; nothing is fetched)."; exit 1; }
	python3 .github/scripts/openapi_export.py "$(API_SPEC_SRC)" "$(API_SPEC_OUT)"

## Production build, then fail if a page says Layer5 Cloud or Blowhorn Cloud, or names Layer5 outside the footer and the legal pages (users see Blowhorn).
check-naming: site-build
	python3 .github/scripts/check_naming.py $(BUILD_DIR)

## Build for production, then fail if /internal/ leaked into it, including the offline search index.
check-no-internal: site-build
	.github/scripts/check-no-internal.sh $(BUILD_DIR)

## Unit tests for the hero activity feed (node:test, no extra dependencies).
test-activity-feed:
	node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON --test assets/js/activity-feed.test.mjs

## Run the unit tests for the check scripts in .github/scripts/, then the hero activity feed tests.
test-scripts: test-internal-worker test-activity-feed
	python3 -m unittest discover -s .github/scripts -p 'test_*.py'

## Lint this repo's GitHub Actions workflows with actionlint.
workflow-check:
ifeq ($(ACTIONLINT),)
	@test -x $(BIN_DIR)/actionlint || (mkdir -p $(BIN_DIR) && cd $(BIN_DIR) && \
		curl -fsSL https://raw.githubusercontent.com/rhysd/actionlint/v$(ACTIONLINT_VERSION)/scripts/download-actionlint.bash | \
		TAR_OPTIONS="--no-same-owner" bash -s -- $(ACTIONLINT_VERSION) .)
	$(BIN_DIR)/actionlint -color $(WORKFLOWS)
else
	$(ACTIONLINT) -color $(WORKFLOWS)
endif

## Run every check: site-check, test-scripts and workflow-check.
check: site-check test-scripts workflow-check

## Reproduce site.yml's check job: setup-ci, workflow-check, test-scripts and site-check, in that order.
ci:
	$(MAKE) setup-ci
	$(MAKE) workflow-check
	$(MAKE) test-scripts
	$(MAKE) site-check

## Sanity-check a local disk image before publishing: make dmg-check DMG=path/to/Blowhorn.dmg
dmg-check:
	@test -n "$(DMG)" || (echo "usage: make dmg-check DMG=path/to/file.dmg"; exit 1)
	.github/scripts/check-dmg.sh "$(DMG)"

## Download and mount a release DMG for the Cloud auth smoke (macOS): make cloud-auth-smoke-mount [RELEASE_TAG=v1.24.0]
cloud-auth-smoke-mount:
	.github/scripts/cloud-auth-smoke/mount.sh

## The last release before the cloud.blowhorn.ai default and the sign-out revoke fix:
## up to it, those two checks warn instead of failing.
CLOUD_FIXES_AFTER ?= 1.24.0
CLOUD_URL ?= https://cloud.blowhorn.ai

## Sign in to Blowhorn Cloud with a release's bundled CLI: make cloud-auth-smoke CHECK=signin|signup|default ENGINE=<.../Contents/Resources/engine>
cloud-auth-smoke:
	@test -n "$(ENGINE)" || (echo "usage: make cloud-auth-smoke CHECK=signin|signup|default ENGINE=<Blowhorn.app/Contents/Resources/engine>"; exit 1)
	@predates=0; if [ -n "$(BLOWHORN_VERSION)" ] && \
	  [ "$$(printf '%s\n%s\n' "$(BLOWHORN_VERSION)" "$(CLOUD_FIXES_AFTER)" | sort -V | tail -1)" = "$(CLOUD_FIXES_AFTER)" ]; then predates=1; fi; \
	if [ "$(CHECK)" = default ] && [ $$predates = 1 ]; then \
	  "$(ENGINE)/bin/python" .github/scripts/cloud-auth-smoke/drive.py default --engine "$(ENGINE)" --cloud "$(CLOUD_URL)" || \
	  echo "::warning::Blowhorn $(BLOWHORN_VERSION) predates the cloud.blowhorn.ai default; this check fails from the next release"; \
	else \
	  BLOWHORN_PREDATES_CLOUD_FIXES=$$predates "$(ENGINE)/bin/python" .github/scripts/cloud-auth-smoke/drive.py $(CHECK) --engine "$(ENGINE)" --cloud "$(CLOUD_URL)" $(if $(SIGNUP_TAG),--signup-tag $(SIGNUP_TAG)); \
	fi

## Run the private product repository's CI on a checkout of it, printing only step results and
## pass/fail counts (its output goes to PRODUCT_CI_LOG, never printed; product-ci.yml runs this):
## make product-ci SUITE=python|desktop PRODUCT_DIR=<blowhorn checkout> [PRODUCT_CI_LOG=<file>]
PRODUCT_DIR ?= product
PRODUCT_CI_LOG ?= $(or $(RUNNER_TEMP),/tmp)/product-ci/$(SUITE).log
product-ci:
	@test -n "$(SUITE)" || (echo "usage: make product-ci SUITE=python|desktop PRODUCT_DIR=<checkout>"; exit 1)
	python3 .github/scripts/product-ci/run.py $(SUITE) --product "$(PRODUCT_DIR)" --log "$(PRODUCT_CI_LOG)"

## Sync the user docs from a blowhorn checkout at $(SOURCE_DIR) into $(DOCS_DIR): make docs-sync REF=<tag|branch|sha> (see docs/deploy.md).
docs-sync:
	@test -n "$(REF)" || (echo "usage: make docs-sync REF=<tag|branch|sha of blowhorn> [SOURCE_DIR=path/to/checkout]"; exit 1)
	python3 .github/scripts/sync-docs.py "$(SOURCE_DIR)" "$(DOCS_DIR)" --ref "$(REF)"

## Regenerate the CLI reference pages in the $(SOURCE_DIR) checkout from its schema and parser (what sync-docs.yml runs before the sync; needs typer and PyYAML).
docs-cli-reference:
	.github/scripts/docs-cli-reference.sh "$(SOURCE_DIR)"

## Check out the docs-sync branch on the open sync PR's head, or on origin/master when none is open (what sync-docs.yml runs before the sync).
docs-sync-base:
	.github/scripts/sync-docs-base-branch.sh "$(SYNC_BRANCH)"

## Start the site checks on the docs-sync branch after a sync: gh workflow run site.yml (what sync-docs.yml runs after opening the sync PR).
docs-sync-start-checks:
	.github/scripts/sync-docs-start-checks.sh "$(SYNC_BRANCH)"

## Merge the sync pull request once its site checks pass, then start the master site run that deploys (what sync-docs.yml runs last).
docs-sync-merge:
	.github/scripts/sync-docs-merge.sh "$(SYNC_BRANCH)"

# publish-dmg.yml steps. Each reads its inputs from the environment, as the
# workflow sets them; see the script headers in .github/scripts/publish-dmg/.

## publish-dmg step 1: validate IN_VERSION, IN_URL, IN_ARCH, IN_DRAFT, IN_NOTARIZED, IN_NOTES into GITHUB_OUTPUT.
dmg-resolve:
	.github/scripts/publish-dmg/resolve.sh

## publish-dmg step 2: download DMG_URL to dist/source.dmg over HTTPS (DMG_SOURCE_TOKEN only to GitHub hosts).
dmg-download:
	.github/scripts/publish-dmg/download.sh

## publish-dmg step 3: check dist/source.dmg, name it for VERSION and ARCH, write SHA256SUMS.txt.
dmg-package:
	.github/scripts/publish-dmg/package.sh

## publish-dmg step 4 (macOS): verify integrity, signature, Gatekeeper and stapled notarization of dist/*.dmg.
dmg-verify:
	.github/scripts/publish-dmg/verify-macos.sh

## publish-dmg step 5: create the GitHub Release VERSION from dist/ (never overwrites).
dmg-release:
	.github/scripts/publish-dmg/release.sh

## publish-dmg step 6: after a public release, pin data/download.json on master to VERSION and start site.yml (a draft, prerelease or older version changes nothing).
dmg-pin-download:
	.github/scripts/publish-dmg/pin-download.sh

## publish-dmg step 7: after a public release, start sync-docs.yml at the product tag desktop-$(VERSION) (a draft starts nothing).
dmg-sync-docs:
	.github/scripts/publish-dmg/sync-docs.sh

# publish-blowhorn-axi.yml steps. Each reads its inputs from the environment, as
# the workflow sets them; see the script headers in .github/scripts/publish-npm/.
# They need only bash, curl, gh, node and npm (no Go, Hugo or site dependencies).

## publish-blowhorn-axi step 1: fetch PACKAGE-VERSION.tgz from TARBALL_URL (HTTPS) or release RELEASE_TAG; TARBALL into GITHUB_ENV.
npm-fetch:
	.github/scripts/publish-npm/fetch.sh

## publish-blowhorn-axi step 2: check TARBALL's sha256 (SHA256), name, version and repository.url; refuse an already-published version.
npm-verify:
	.github/scripts/publish-npm/verify.sh

## publish-blowhorn-axi step 3: npm publish TARBALL with --provenance under DIST_TAG (default latest), over OIDC.
npm-publish:
	.github/scripts/publish-npm/publish.sh

## publish-blowhorn-axi step 4: poll npm for PACKAGE@VERSION for about 5 minutes, then warn (never fails).
npm-confirm:
	.github/scripts/publish-npm/confirm.sh

## Empty the build cache, reinstall dependencies, and run the site locally.
clean:
	npm run clean
	$(MAKE) setup
	$(MAKE) site

.PHONY: \
	check-schemas \
	check-brand-kits \
	check-naming \
	check-download-links \
	check-feeds \
	check-tips \
	check-tells \
	check-api-reference \
	api-reference-export \
	check-theme \
	check-platform-docs \
	check-action-matrix \
	check-platform-pages \
	setup \
	build \
	build-preview \
	build-production \
	site-build \
	site \
	serve \
	check-links \
	check-deps \
	check-go \
	help \
	setup-ci \
	validate-html \
	check-third-party \
	check-urls \
	site-check \
	check-no-internal \
	build-internal \
	site-internal \
	site-internal-build \
	site-internal-deploy \
	site-internal-access \
	site-internal-access-check \
	site-internal-worker-deploy \
	site-internal-verify \
	test-internal-worker \
	test-activity-feed \
	preview-internal \
	check-blowhorn \
	test-scripts \
	workflow-check \
	check \
	ci \
	dmg-check \
	cloud-auth-smoke \
	cloud-auth-smoke-mount \
	product-ci \
	dmg-resolve \
	dmg-download \
	dmg-package \
	dmg-verify \
	dmg-release \
	dmg-pin-download \
	dmg-sync-docs \
	npm-fetch \
	npm-verify \
	npm-publish \
	npm-confirm \
	docs-cli-reference \
	docs-sync \
	docs-sync-base \
	docs-sync-start-checks \
	docs-sync-merge \
	clean
