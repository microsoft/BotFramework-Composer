#!/usr/bin/env bash

function cleanup {
  kill $SERVER_PID
}

yarn start >> e2e.log 2>&1 &
SERVER_PID=$!

npx cypress run
EXIT_CODE=$?

# kill server process
trap cleanup EXIT

exit $EXIT_CODE
