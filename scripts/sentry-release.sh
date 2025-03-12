#!/bin/bash

# Exit on error
set -e

# Debug mode
if [ "$VERCEL_DEBUG" = "1" ]; then
  set -x
fi

# Set release version
SENTRY_RELEASE="${VERCEL_GIT_COMMIT_SHA:-$(git rev-parse HEAD)}"
export SENTRY_RELEASE

echo "Creating Sentry release: $SENTRY_RELEASE"

# Create release
./node_modules/.bin/sentry-cli releases new "$SENTRY_RELEASE"

# Associate commits
./node_modules/.bin/sentry-cli releases set-commits "$SENTRY_RELEASE" --commit "$SENTRY_ORG/$SENTRY_PROJECT@$SENTRY_RELEASE"

# Upload source maps
./node_modules/.bin/sentry-cli sourcemaps inject ./dist
./node_modules/.bin/sentry-cli sourcemaps upload ./dist --release="$SENTRY_RELEASE"

# Finalize release
./node_modules/.bin/sentry-cli releases finalize "$SENTRY_RELEASE" 