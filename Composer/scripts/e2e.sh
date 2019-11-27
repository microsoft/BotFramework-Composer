#!/usr/bin/env bash

set -e

yarn start &
SERVER_PID=$!

npx cypress run --browser chrome
EXIT_CODE=$?
cleanup

function cleanup {
  kill $SERVER_PID
}

# kill server process
trap cleanup EXIT

exit $EXIT_CODE
