#!/usr/bin/env bash

set -e

yarn start > server.log 2>&1 &
SERVER_PID=$!

npx cypress run
EXIT_CODE=$?
cat server.log
cleanup

function cleanup {
  kill $SERVER_PID
}

# kill server process
trap cleanup EXIT

exit $EXIT_CODE
