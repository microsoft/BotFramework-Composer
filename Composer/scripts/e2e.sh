#!/usr/bin/env bash

set -e

yarn start &
SERVER_PID=$!

npx cypress run --record --parallel --ci-build-id $BUILD_BUILDNUMBER --group "Azure CI"

function cleanup {
  kill -9 $SERVER_PID
}

# kill server process
trap cleanup EXIT

